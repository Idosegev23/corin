import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { recipes, products, couponCodes } from '@/data/corrin-data';
import { supabase } from '@/lib/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID!;

// Helper to save chat data to Supabase
async function saveToSupabase(
  sessionId: string | null,
  userMessage: string,
  assistantResponse: string
): Promise<string | null> {
  try {
    let currentSessionId = sessionId;

    // Create session if not exists
    if (!currentSessionId) {
      const { data: session, error: sessionError } = await supabase
        .from('corrin_chat_sessions')
        .insert({})
        .select()
        .single();

      if (sessionError) {
        console.error('Error creating session:', sessionError);
        return null;
      }
      currentSessionId = session.id;
    }

    // Save user message
    await supabase.from('corrin_chat_messages').insert({
      session_id: currentSessionId,
      role: 'user',
      content: userMessage,
    });

    // Save assistant response
    await supabase.from('corrin_chat_messages').insert({
      session_id: currentSessionId,
      role: 'assistant',
      content: assistantResponse,
    });

    // Update session message count
    const { data: messages } = await supabase
      .from('corrin_chat_messages')
      .select('id')
      .eq('session_id', currentSessionId);

    await supabase
      .from('corrin_chat_sessions')
      .update({
        message_count: messages?.length || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentSessionId);

    return currentSessionId;
  } catch (error) {
    console.error('Error saving to Supabase:', error);
    return null;
  }
}

// Build context with all data including links
function buildContext() {
  const recipesContext = recipes.map(r => 
    `**${r.name}**: ${r.description}\nמצרכים: ${r.ingredients.join(', ')}\nלינק: ${r.url}`
  ).join('\n\n');

  const couponsContext = couponCodes.map(c => 
    `${c.brand}: קוד "${c.code}" - ${c.description}`
  ).join('\n');

  const productsContext = products.map(p => 
    `${p.name} (${p.brand})${p.couponCode ? ` - קופון: ${p.couponCode}` : ''} - לינק: ${p.shortLink || p.link}`
  ).join('\n');

  return `
## מתכונים של קורין:
${recipesContext}

## קודי קופון פעילים:
${couponsContext}

## מוצרים מומלצים:
${productsContext}
`;
}

export async function POST(req: NextRequest) {
  try {
    const { message, threadId, sessionId } = await req.json();

    // Create a new thread if one doesn't exist
    let currentThreadId: string;
    let isNewThread = false;
    
    if (threadId && typeof threadId === 'string') {
      currentThreadId = threadId;
    } else {
      const newThread = await openai.beta.threads.create();
      if (!newThread?.id) {
        throw new Error('Failed to create thread - no thread ID returned');
      }
      currentThreadId = newThread.id;
      isNewThread = true;
    }

    // For new threads or recipe-related questions, add context
    const isRecipeQuestion = message.includes('מתכון') || 
                            message.includes('מרכיב') || 
                            message.includes('הכנה') ||
                            message.includes('לבשל') ||
                            message.includes('לאפות') ||
                            message.includes('אוכל');
    
    let enrichedMessage = message;
    
    if (isNewThread || isRecipeQuestion) {
      const context = buildContext();
      enrichedMessage = `${message}\n\n---\nמידע רלוונטי:\n${context}`;
    }

    // Add the user's message to the thread
    await openai.beta.threads.messages.create(currentThreadId, {
      role: 'user',
      content: enrichedMessage,
    });

    // Run the assistant with additional instructions
    const run = await openai.beta.threads.runs.createAndPoll(currentThreadId, {
      assistant_id: ASSISTANT_ID,
      additional_instructions: `
אתה העוזר החכם של קורין גדעון - יוצרת תוכן בתחום האוכל והלייפסטייל.

## התפקיד שלך:
1. לעזור עם מתכונים - להסביר שלבים, להציע תחליפים למרכיבים, לתת טיפים
2. להמליץ על מוצרים וקופונים רלוונטיים
3. להיות חם, ידידותי ומועיל - כמו שקורין עצמה הייתה עונה

## כללים חשובים לגבי לינקים:
- כשאתה מציע מוצר, מתכון או קופון - תמיד כלול את הלינק המדויק מהקונטקסט
- אל תמציא לינקים! השתמש רק בלינקים שקיבלת במידע הרלוונטי
- הצג לינקים בפורמט markdown: [שם הלינק](כתובת)

## פורמט תשובה:
- השתמש ב-**טקסט מודגש** לדברים חשובים
- השתמש ברשימות ממוספרות להוראות הכנה
- הצג קופונים בצורה ברורה: "קוד הקופון: XXXXX"
- הוסף טיפים עם סימון מיוחד: "💡 טיפ: ..."

ענה תמיד בעברית, בצורה חמה ומזמינה.
      `.trim(),
    });

    if (!run?.id) {
      throw new Error('Failed to create run - no run ID returned');
    }

    if (run.status === 'failed') {
      console.error('Run failed:', run);
      return NextResponse.json(
        { error: 'Assistant run failed', threadId: currentThreadId },
        { status: 500 }
      );
    }

    if (run.status !== 'completed') {
      return NextResponse.json(
        { error: 'Request timeout', threadId: currentThreadId },
        { status: 504 }
      );
    }

    // Get the assistant's response
    const messages = await openai.beta.threads.messages.list(currentThreadId);
    const lastMessage = messages.data[0];

    let responseText = '';
    if (lastMessage && lastMessage.content[0]?.type === 'text') {
      responseText = lastMessage.content[0].text.value;
    }

    // Save to Supabase (non-blocking)
    const newSessionId = await saveToSupabase(sessionId || null, message, responseText);

    return NextResponse.json({
      response: responseText,
      threadId: currentThreadId,
      sessionId: newSessionId || sessionId,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
