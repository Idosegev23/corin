'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center" dir="rtl">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950" dir="rtl">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/10 via-gray-950 to-pink-900/10" />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl overflow-hidden">
                <Image
                  src="/corrin-avatar.jpg"
                  alt="Corrin"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="font-semibold text-white text-sm">פאנל ניהול</h1>
                <p className="text-[10px] text-gray-500">Corrin Gideon</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              יציאה
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="sticky top-[57px] z-40 bg-gray-900/60 backdrop-blur-xl border-b border-gray-800">
        <div className="flex">
          <Link
            href="/admin/dashboard"
            className="flex-1 py-3 text-center text-sm font-medium text-purple-400 border-b-2 border-purple-500"
          >
            דשבורד
          </Link>
          <Link
            href="/admin/support"
            className="flex-1 py-3 text-center text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            פניות
          </Link>
          <Link
            href="/admin/chats"
            className="flex-1 py-3 text-center text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            שיחות
          </Link>
        </div>
      </nav>

      <main className="relative p-4 pb-8 max-w-3xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/80 backdrop-blur rounded-2xl p-4 border border-gray-800"
          >
            <div className="text-2xl font-bold text-white">{stats?.chatStats.today || 0}</div>
            <div className="text-xs text-gray-400 mt-1">שיחות היום</div>
            <div className="text-[10px] text-gray-600 mt-2">סה״כ {stats?.chatStats.total || 0}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-gray-900/80 backdrop-blur rounded-2xl p-4 border border-gray-800"
          >
            <div className="text-2xl font-bold text-white">{stats?.chatStats.totalMessages || 0}</div>
            <div className="text-xs text-gray-400 mt-1">הודעות</div>
            <div className="text-[10px] text-gray-600 mt-2">שבוע: {stats?.chatStats.week || 0}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 backdrop-blur rounded-2xl p-4 border border-orange-500/20"
          >
            <div className="text-2xl font-bold text-orange-400">{stats?.supportStats.open || 0}</div>
            <div className="text-xs text-gray-400 mt-1">פניות פתוחות</div>
            <div className="text-[10px] text-gray-600 mt-2">טופלו: {stats?.supportStats.resolved || 0}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gray-900/80 backdrop-blur rounded-2xl p-4 border border-gray-800"
          >
            <div className="text-2xl font-bold text-white">{stats?.supportStats.today || 0}</div>
            <div className="text-xs text-gray-400 mt-1">פניות היום</div>
            <div className="text-[10px] text-gray-600 mt-2">סה״כ {stats?.supportStats.total || 0}</div>
          </motion.div>
        </div>

        {/* Brand Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/80 backdrop-blur rounded-2xl p-4 border border-gray-800 mb-4"
        >
          <h2 className="text-sm font-semibold text-white mb-4">פניות לפי מותג</h2>
          {stats?.brandCounts && Object.keys(stats.brandCounts).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(stats.brandCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([brand, count]) => (
                  <div key={brand} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold">
                      {brand.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-300">{brand}</span>
                        <span className="text-xs font-medium text-white">{count}</span>
                      </div>
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                          style={{
                            width: `${(count / Math.max(...Object.values(stats.brandCounts))) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6 text-sm">אין עדיין פניות</p>
          )}
        </motion.div>

        {/* Recent Support */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gray-900/80 backdrop-blur rounded-2xl p-4 border border-gray-800 mb-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">פניות אחרונות</h2>
            <Link href="/admin/support" className="text-xs text-purple-400">
              הכל →
            </Link>
          </div>
          {stats?.recentSupport && stats.recentSupport.length > 0 ? (
            <div className="space-y-2">
              {stats.recentSupport.slice(0, 3).map((request) => (
                <div
                  key={request.id}
                  className="p-3 bg-gray-800/50 rounded-xl flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{request.customer_name}</div>
                    <div className="text-xs text-gray-500">{request.brand}</div>
                  </div>
                  <div className="flex flex-col items-end gap-1 mr-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        request.status === 'open'
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {request.status === 'open' ? 'פתוח' : 'טופל'}
                    </span>
                    <span className="text-[10px] text-gray-600">
                      {formatDate(request.created_at)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6 text-sm">אין עדיין פניות</p>
          )}
        </motion.div>

        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/80 backdrop-blur rounded-2xl p-4 border border-gray-800"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">שיחות אחרונות</h2>
            <Link href="/admin/chats" className="text-xs text-purple-400">
              הכל →
            </Link>
          </div>
          {stats?.recentSessions && stats.recentSessions.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {stats.recentSessions.slice(0, 4).map((session) => (
                <Link
                  key={session.id}
                  href={`/admin/chats?session=${session.id}`}
                  className="p-3 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition-colors"
                >
                  <div className="text-sm font-medium text-white">
                    {session.message_count} הודעות
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1">
                    {formatDate(session.created_at)}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6 text-sm">אין עדיין שיחות</p>
          )}
        </motion.div>
      </main>
    </div>
  );
}
