import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const SESSION_COOKIE_NAME = 'corrin_admin_session';

// Check authentication
async function checkAuth(request: NextRequest): Promise<boolean> {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return false;
  
  // In a real app, validate against stored sessions
  // For now, just check if token exists
  return true;
}

export async function GET(request: NextRequest) {
  if (!await checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    // Get chat sessions stats
    const [
      totalSessions,
      todaySessions,
      weekSessions,
      monthSessions,
    ] = await Promise.all([
      supabase.from('corrin_chat_sessions').select('id', { count: 'exact', head: true }),
      supabase.from('corrin_chat_sessions').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
      supabase.from('corrin_chat_sessions').select('id', { count: 'exact', head: true }).gte('created_at', weekStart),
      supabase.from('corrin_chat_sessions').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
    ]);

    // Get chat messages stats
    const [totalMessages] = await Promise.all([
      supabase.from('corrin_chat_messages').select('id', { count: 'exact', head: true }),
    ]);

    // Get support requests stats
    const [
      totalSupport,
      openSupport,
      resolvedSupport,
      todaySupport,
    ] = await Promise.all([
      supabase.from('corrin_support_requests').select('id', { count: 'exact', head: true }),
      supabase.from('corrin_support_requests').select('id', { count: 'exact', head: true }).eq('status', 'open'),
      supabase.from('corrin_support_requests').select('id', { count: 'exact', head: true }).eq('status', 'resolved'),
      supabase.from('corrin_support_requests').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
    ]);

    // Get brand breakdown
    const { data: brandBreakdown } = await supabase
      .from('corrin_support_requests')
      .select('brand');

    const brandCounts: Record<string, number> = {};
    brandBreakdown?.forEach((item) => {
      brandCounts[item.brand] = (brandCounts[item.brand] || 0) + 1;
    });

    // Get recent support requests
    const { data: recentSupport } = await supabase
      .from('corrin_support_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    // Get recent chat sessions
    const { data: recentSessions } = await supabase
      .from('corrin_chat_sessions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      chatStats: {
        total: totalSessions.count || 0,
        today: todaySessions.count || 0,
        week: weekSessions.count || 0,
        month: monthSessions.count || 0,
        totalMessages: totalMessages.count || 0,
      },
      supportStats: {
        total: totalSupport.count || 0,
        open: openSupport.count || 0,
        resolved: resolvedSupport.count || 0,
        today: todaySupport.count || 0,
      },
      brandBreakdown,
      brandCounts,
      recentSupport: recentSupport || [],
      recentSessions: recentSessions || [],
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'שגיאה בטעינת הסטטיסטיקות' },
      { status: 500 }
    );
  }
}
