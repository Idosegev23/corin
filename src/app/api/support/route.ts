import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import couponsData from '@/data/coupons.json';
import { supabase } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Save support request to Supabase
async function saveSupportRequest(data: {
  brand: string;
  customerName: string;
  orderNumber: string;
  problem: string;
  phone: string;
}): Promise<string | null> {
  try {
    const { data: result, error } = await supabase
      .from('corrin_support_requests')
      .insert({
        brand: data.brand,
        customer_name: data.customerName,
        order_number: data.orderNumber,
        problem: data.problem,
        phone: data.phone,
        status: 'open',
        whatsapp_sent: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving support request:', error);
      return null;
    }

    return result.id;
  } catch (error) {
    console.error('Error saving support request:', error);
    return null;
  }
}

// Mark WhatsApp as sent
async function markWhatsAppSent(id: string): Promise<void> {
  try {
    await supabase
      .from('corrin_support_requests')
      .update({ whatsapp_sent: true })
      .eq('id', id);
  } catch (error) {
    console.error('Error marking WhatsApp sent:', error);
  }
}

// Types
interface SupportData {
  brand?: string;
  customerName?: string;
  orderNumber?: string;
  problemDetails?: string;
  customerPhone?: string;
}

interface SupportState {
  step: 'detect' | 'brand' | 'name' | 'order' | 'problem' | 'phone' | 'complete';
  data: SupportData;
}

// Intent detection using GPT-5.2 style (fallback to gpt-4o-mini for compatibility)
async function detectIntent(message: string): Promise<{ intent: 'support' | 'general'; confidence: number }> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `אתה מזהה כוונות. בדוק אם ההודעה מתארת בעיה עם:
- קופון שלא עובד
- הזמנה (בעיה, עיכוב, טעות)
- משלוח (לא הגיע, איחור, נזק)
- החזר כספי
- תלונה על מוצר

החזר JSON בלבד: {"intent": "support" | "general", "confidence": 0.0-1.0}`
        },
        {
          role: 'user',
          content: message
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return {
      intent: result.intent || 'general',
      confidence: result.confidence || 0
    };
  } catch (error) {
    console.error('Intent detection error:', error);
    return { intent: 'general', confidence: 0 };
  }
}

// Generate empathetic response for support
async function generateSupportResponse(
  step: string,
  data: SupportData,
  userMessage?: string
): Promise<string> {
  const prompts: Record<string, string> = {
    brand: `אוי איזה באסה! 😔 אני מצטערת לשמוע שנתקלת בבעיה.
בואי נטפל בזה ביחד! על איזה מותג מדובר?`,
    
    name: `הבנתי, ${data.brand}. על שם מי ההזמנה?`,
    
    order: `תודה ${data.customerName}! מה מספר ההזמנה שלך?`,
    
    problem: `אוקי, הזמנה מספר ${data.orderNumber}. 
ספרי לי בבקשה מה הבעיה בדיוק?`,
    
    phone: `הבנתי את הבעיה. מה המספר נייד שלך כדי שנוכל לחזור אלייך?`,
    
    complete: `תודה רבה! 🙏
אני מצטערת על החוויה ומעבירה את זה מיידית לטיפול של ${data.brand}!
אנחנו על זה ומעדכנים אותך כמה שיותר מהר! מבטיחה! 💜`
  };

  return prompts[step] || 'איך אפשר לעזור?';
}

// Validate phone number (Israeli format)
function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[-\s]/g, '');
  return /^0[5][0-9]{8}$/.test(cleaned) || /^972[5][0-9]{8}$/.test(cleaned);
}

export async function POST(req: NextRequest) {
  try {
    const { message, supportState } = await req.json();
    
    let state: SupportState = supportState || { step: 'detect', data: {} };
    
    // Step 1: Detect intent if starting fresh
    if (state.step === 'detect') {
      const { intent, confidence } = await detectIntent(message);
      
      if (intent === 'support' && confidence > 0.5) {
        // Start support flow
        state.step = 'brand';
        const response = await generateSupportResponse('brand', state.data);
        
        return NextResponse.json({
          response,
          supportState: state,
          action: 'show_brands',
          brands: couponsData.coupons.map(c => ({
            brand: c.brand,
            product: c.product,
            code: c.code
          }))
        });
      } else {
        // Not a support request
        return NextResponse.json({
          response: null,
          supportState: null,
          action: 'use_assistant'
        });
      }
    }
    
    // Step 2: Brand selected
    if (state.step === 'brand') {
      // Find matching brand
      const brand = couponsData.coupons.find(c => 
        c.brand.toLowerCase() === message.toLowerCase() ||
        message.includes(c.brand)
      );
      
      if (brand) {
        state.data.brand = brand.brand;
        state.step = 'name';
        const response = await generateSupportResponse('name', state.data);
        
        return NextResponse.json({
          response,
          supportState: state,
          action: 'collect_input',
          inputType: 'name'
        });
      } else {
        // Brand not found, ask again
        return NextResponse.json({
          response: 'לא מצאתי את המותג הזה. בבקשה בחרי מהרשימה:',
          supportState: state,
          action: 'show_brands',
          brands: couponsData.coupons.map(c => ({
            brand: c.brand,
            product: c.product,
            code: c.code
          }))
        });
      }
    }
    
    // Step 3: Name collected
    if (state.step === 'name') {
      state.data.customerName = message.trim();
      state.step = 'order';
      const response = await generateSupportResponse('order', state.data);
      
      return NextResponse.json({
        response,
        supportState: state,
        action: 'collect_input',
        inputType: 'order'
      });
    }
    
    // Step 4: Order number collected
    if (state.step === 'order') {
      state.data.orderNumber = message.trim();
      state.step = 'problem';
      const response = await generateSupportResponse('problem', state.data);
      
      return NextResponse.json({
        response,
        supportState: state,
        action: 'collect_input',
        inputType: 'problem'
      });
    }
    
    // Step 5: Problem details collected
    if (state.step === 'problem') {
      state.data.problemDetails = message.trim();
      state.step = 'phone';
      const response = await generateSupportResponse('phone', state.data);
      
      return NextResponse.json({
        response,
        supportState: state,
        action: 'collect_input',
        inputType: 'phone'
      });
    }
    
    // Step 6: Phone collected - complete!
    if (state.step === 'phone') {
      if (!isValidPhone(message)) {
        return NextResponse.json({
          response: 'המספר לא נראה תקין. בבקשה הכניסי מספר נייד ישראלי (למשל: 0541234567)',
          supportState: state,
          action: 'collect_input',
          inputType: 'phone'
        });
      }
      
      state.data.customerPhone = message.replace(/[-\s]/g, '');
      state.step = 'complete';
      const response = await generateSupportResponse('complete', state.data);
      
      // Save support request to Supabase
      const supportRequestId = await saveSupportRequest({
        brand: state.data.brand || '',
        customerName: state.data.customerName || '',
        orderNumber: state.data.orderNumber || '',
        problem: state.data.problemDetails || '',
        phone: state.data.customerPhone || '',
      });
      
      return NextResponse.json({
        response,
        supportState: state,
        action: 'send_whatsapp',
        supportData: state.data,
        supportRequestId
      });
    }
    
    return NextResponse.json({
      response: 'משהו השתבש. בואי נתחיל מחדש.',
      supportState: { step: 'detect', data: {} },
      action: 'reset'
    });
    
  } catch (error) {
    console.error('Support API error:', error);
    return NextResponse.json(
      { error: 'Failed to process support request' },
      { status: 500 }
    );
  }
}
