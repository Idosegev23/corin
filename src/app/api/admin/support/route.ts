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
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('corrin_support_requests')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return NextResponse.json({
      requests: data || [],
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Support list error:', error);
    return NextResponse.json(
      { error: 'שגיאה בטעינת הפניות' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  if (!await checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'חסרים פרמטרים' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { status };
    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('corrin_support_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, request: data });
  } catch (error) {
    console.error('Support update error:', error);
    return NextResponse.json(
      { error: 'שגיאה בעדכון הפנייה' },
      { status: 500 }
    );
  }
}
