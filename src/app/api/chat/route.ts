import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { recipes, products, couponCodes } from '@/data/corrin-data';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID!;

// Build context with all data
function buildContext() {
  const recipesContext = recipes.map(r => 
    `**${r.name}**: ${r.description}\nמצרכים: ${r.ingredients.join(', ')}\nהכנה: ${r.instructions}`
  ).join('\n\n');

  const couponsContext = couponCodes.map(c => 
    `${c.brand}: קוד "${c.code}" - ${c.description}`
  ).join('\n');

  const productsContext = products.slice(0, 10).map(p => 
    `${p.name} (${p.brand})${p.couponCode ? ` - קופון: ${p.couponCode}` : ''}`
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
    const { message, threadId } = await req.json();

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
התפקיד שלך:
1. לעזור עם מתכונים - להסביר שלבים, להציע תחליפים למרכיבים, לתת טיפים
2. להמליץ על מוצרים וקופונים רלוונטיים
3. להיות חם, ידידותי ומועיל - כמו שקורין עצמה הייתה עונה

כשמישהו שואל על מתכון:
- תן את כל הפרטים הרלוונטיים
- הצע טיפים ושיפורים
- אם שואלים על תחליף למרכיב - תן אפשרויות

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

    return NextResponse.json({
      response: responseText,
      threadId: currentThreadId,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
