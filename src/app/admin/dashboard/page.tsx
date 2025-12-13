'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Stats {
  chatStats: {
    total: number;
    today: number;
    week: number;
    month: number;
    totalMessages: number;
  };
  supportStats: {
    total: number;
    open: number;
    resolved: number;
    today: number;
  };
  brandCounts: Record<string, number>;
  recentSupport: Array<{
    id: string;
    brand: string;
    customer_name: string;
    problem: string;
    status: string;
    created_at: string;
  }>;
  recentSessions: Array<{
    id: string;
    message_count: number;
    created_at: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const authRes = await fetch('/api/admin/auth');
      const authData = await authRes.json();
      
      if (!authData.authenticated) {
        router.push('/admin');
        return;
      }

      const res = await fetch('/api/admin/stats');
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin');
          return;
        }
        throw new Error('Failed to fetch stats');
      }

      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError('שגיאה בטעינת הסטטיסטיקות');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' }),
    });
    router.push('/admin');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center" dir="rtl">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-800">
            דשבורד ניהול - Corrin Gideon
          </h1>
          <div className="flex items-center gap-4">
            <nav className="flex gap-4">
              <Link href="/admin/dashboard" className="text-indigo-600 font-medium">
                דשבורד
              </Link>
              <Link href="/admin/support" className="text-slate-600 hover:text-indigo-600 transition-colors">
                פניות תמיכה
              </Link>
              <Link href="/admin/chats" className="text-slate-600 hover:text-indigo-600 transition-colors">
                היסטוריית שיחות
              </Link>
            </nav>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-slate-600 hover:text-red-600 transition-colors"
            >
              התנתקות
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="text-sm text-slate-500 mb-1">שיחות היום</div>
            <div className="text-3xl font-bold text-slate-800">{stats?.chatStats.today || 0}</div>
            <div className="text-xs text-slate-400 mt-2">
              סה״כ: {stats?.chatStats.total || 0}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="text-sm text-slate-500 mb-1">הודעות סה״כ</div>
            <div className="text-3xl font-bold text-slate-800">{stats?.chatStats.totalMessages || 0}</div>
            <div className="text-xs text-slate-400 mt-2">
              שבוע אחרון: {stats?.chatStats.week || 0} שיחות
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="text-sm text-slate-500 mb-1">פניות פתוחות</div>
            <div className="text-3xl font-bold text-orange-500">{stats?.supportStats.open || 0}</div>
            <div className="text-xs text-slate-400 mt-2">
              טופלו: {stats?.supportStats.resolved || 0}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="text-sm text-slate-500 mb-1">פניות היום</div>
            <div className="text-3xl font-bold text-slate-800">{stats?.supportStats.today || 0}</div>
            <div className="text-xs text-slate-400 mt-2">
              סה״כ: {stats?.supportStats.total || 0}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Brand Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <h2 className="text-lg font-semibold text-slate-800 mb-4">פניות לפי מותג</h2>
            {stats?.brandCounts && Object.keys(stats.brandCounts).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.brandCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([brand, count]) => (
                    <div key={brand} className="flex items-center justify-between">
                      <span className="text-slate-700">{brand}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{
                              width: `${(count / Math.max(...Object.values(stats.brandCounts))) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-600 w-8 text-left">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">אין עדיין פניות</p>
            )}
          </motion.div>

          {/* Recent Support Requests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800">פניות אחרונות</h2>
              <Link href="/admin/support" className="text-sm text-indigo-600 hover:text-indigo-700">
                הצג הכל
              </Link>
            </div>
            {stats?.recentSupport && stats.recentSupport.length > 0 ? (
              <div className="space-y-3">
                {stats.recentSupport.map((request) => (
                  <div
                    key={request.id}
                    className="p-3 bg-slate-50 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="font-medium text-slate-800">{request.customer_name}</div>
                      <div className="text-sm text-slate-500">{request.brand}</div>
                    </div>
                    <div className="text-left">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          request.status === 'open'
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-green-100 text-green-600'
                        }`}
                      >
                        {request.status === 'open' ? 'פתוח' : 'טופל'}
                      </span>
                      <div className="text-xs text-slate-400 mt-1">
                        {formatDate(request.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-8">אין עדיין פניות</p>
            )}
          </motion.div>
        </div>

        {/* Recent Chat Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-sm p-6 mt-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">שיחות אחרונות</h2>
            <Link href="/admin/chats" className="text-sm text-indigo-600 hover:text-indigo-700">
              הצג הכל
            </Link>
          </div>
          {stats?.recentSessions && stats.recentSessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {stats.recentSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/admin/chats?session=${session.id}`}
                  className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="text-sm font-medium text-slate-800">
                    {session.message_count} הודעות
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {formatDate(session.created_at)}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-8">אין עדיין שיחות</p>
          )}
        </motion.div>
      </main>
    </div>
  );
}
