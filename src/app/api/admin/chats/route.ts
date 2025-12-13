import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const SESSION_COOKIE_NAME = 'corrin_admin_session';

async function checkAuth(request: NextRequest): Promise<boolean> {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  return !!sessionToken;
}

export async function GET(request: NextRequest) {
  if (!await checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // If session ID provided, get messages for that session
    if (sessionId) {
      const { data: messages, error } = await supabase
        .from('corrin_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const { data: session } = await supabase
        .from('corrin_chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      return NextResponse.json({
        session,
        messages: messages || [],
      });
    }

    // Otherwise, get all sessions
    const { data, error, count } = await supabase
      .from('corrin_chat_sessions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({
      sessions: data || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Chats error:', error);
    return NextResponse.json(
      { error: 'שגיאה בטעינת השיחות' },
      { status: 500 }
    );
  }
}
