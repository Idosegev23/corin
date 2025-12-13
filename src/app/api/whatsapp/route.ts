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

// Build the WhatsApp message
function buildMessage(data: SupportData): string {
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
    
    // Build the message
    const message = buildMessage(supportData);
    
    // Send via GREEN-API
    const greenApiUrl = `https://api.greenapi.com/waInstance${instanceId}/sendMessage/${apiToken}`;
    
    const response = await fetch(greenApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatId: targetPhone,
        message: message,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('GREEN-API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to send WhatsApp message', details: errorText },
        { status: 500 }
      );
    }
    
    const result = await response.json();
    
    // Mark support request as WhatsApp sent
    if (supportRequestId) {
      await supabase
        .from('corrin_support_requests')
        .update({ whatsapp_sent: true })
        .eq('id', supportRequestId);
    }
    
    return NextResponse.json({
      success: true,
      messageId: result.idMessage,
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
