import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface SupportData {
  brand: string;
  customerName: string;
  orderNumber: string;
  problemDetails: string;
  customerPhone: string;
}

// Format phone number for WhatsApp (Israeli format)
function formatPhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/[-\s]/g, '');
  
  // Convert to international format
  if (cleaned.startsWith('0')) {
    cleaned = '972' + cleaned.slice(1);
  }
  
  return cleaned + '@c.us';
}

// Build the WhatsApp message for the brand
function buildBrandMessage(data: SupportData): string {
  return `היי ${data.brand} זה המנוע AI של קורין.
לקוחה שלי בשם ${data.customerName} עם מספר הזמנה ${data.orderNumber},
יש לה בעיה עם המשלוח - ${data.problemDetails}
אודה לחזרה ללקוח ולטיפול כמה שיותר מהר

שם לקוח: ${data.customerName}
מספר הזמנה: ${data.orderNumber}
נייד לקוחה: ${data.customerPhone}

בתודה, קורין גדעון

אין להשיב להודעה זו`;
}

// Build the WhatsApp message for the customer
function buildCustomerMessage(data: SupportData): string {
  return `היי ${data.customerName}! 💜

קיבלתי את הפנייה שלך לגבי ההזמנה מ-${data.brand}.

רציתי לעדכן אותך שהעברתי את הפרטים ישירות לצוות של המותג והם יחזרו אלייך בהקדם האפשרי!

פרטי הפנייה:
🏷️ מותג: ${data.brand}
📦 מספר הזמנה: ${data.orderNumber}
📝 תיאור: ${data.problemDetails}

אני כאן אם תצטרכי עוד משהו! 🙏

קורין 💜`;
}

export async function POST(req: NextRequest) {
  try {
    const { supportData, supportRequestId } = await req.json() as { 
      supportData: SupportData; 
      supportRequestId?: string;
    };
    
    // Validate required data
    if (!supportData.brand || !supportData.customerName || !supportData.orderNumber || 
        !supportData.problemDetails || !supportData.customerPhone) {
      return NextResponse.json(
        { error: 'Missing required support data' },
        { status: 400 }
      );
    }
    
    // Get GREEN-API credentials
    const instanceId = process.env.GREEN_API_INSTANCE_ID;
    const apiToken = process.env.GREEN_API_TOKEN;
    
    if (!instanceId || !apiToken) {
      console.error('GREEN-API credentials not configured');
      return NextResponse.json(
        { error: 'WhatsApp service not configured' },
        { status: 500 }
      );
    }
    
    // Target phone number (Corrin's support number)
    const targetPhone = '972547667775@c.us';
    
    // Customer phone number
    const customerPhone = formatPhoneForWhatsApp(supportData.customerPhone);
    
    // Build messages
    const brandMessage = buildBrandMessage(supportData);
    const customerMessage = buildCustomerMessage(supportData);
    
    // Send via GREEN-API
    const greenApiUrl = `https://api.greenapi.com/waInstance${instanceId}/sendMessage/${apiToken}`;
    
    // Send message to Corrin's support number (for the brand)
    const brandResponse = await fetch(greenApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatId: targetPhone,
        message: brandMessage,
      }),
    });
    
    if (!brandResponse.ok) {
      const errorText = await brandResponse.text();
      console.error('GREEN-API error (brand):', errorText);
      return NextResponse.json(
        { error: 'Failed to send WhatsApp message to brand', details: errorText },
        { status: 500 }
      );
    }
    
    const brandResult = await brandResponse.json();
    
    // Send message to customer
    const customerResponse = await fetch(greenApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatId: customerPhone,
        message: customerMessage,
      }),
    });
    
    let customerMessageSent = false;
    if (customerResponse.ok) {
      customerMessageSent = true;
    } else {
      console.error('GREEN-API error (customer):', await customerResponse.text());
    }
    
    // Mark support request as WhatsApp sent
    if (supportRequestId) {
      await supabase
        .from('corrin_support_requests')
        .update({ whatsapp_sent: true })
        .eq('id', supportRequestId);
    }
    
    return NextResponse.json({
      success: true,
      messageId: brandResult.idMessage,
      customerMessageSent,
      message: 'הודעה נשלחה בהצלחה!'
    });
    
  } catch (error) {
    console.error('WhatsApp API error:', error);
    return NextResponse.json(
      { error: 'Failed to send WhatsApp message' },
      { status: 500 }
    );
  }
}
