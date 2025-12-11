import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID!;

export async function POST(req: NextRequest) {
  try {
    const { message, threadId } = await req.json();

    // Create a new thread if one doesn't exist
    let currentThreadId: string;
    if (threadId && typeof threadId === 'string') {
      currentThreadId = threadId;
    } else {
      const newThread = await openai.beta.threads.create();
      if (!newThread?.id) {
        throw new Error('Failed to create thread - no thread ID returned');
      }
      currentThreadId = newThread.id;
    }

    // Add the user's message to the thread
    await openai.beta.threads.messages.create(currentThreadId, {
      role: 'user',
      content: message,
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.createAndPoll(currentThreadId, {
      assistant_id: ASSISTANT_ID,
    });

    if (!run?.id) {
      throw new Error('Failed to create run - no run ID returned');
    }

    // Check run status
    const runStatus = run;

    if (runStatus.status === 'failed') {
      console.error('Run failed:', runStatus);
      return NextResponse.json(
        { error: 'Assistant run failed', threadId: currentThreadId },
        { status: 500 }
      );
    }

    if (runStatus.status !== 'completed') {
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
