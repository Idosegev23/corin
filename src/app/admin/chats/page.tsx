'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface ChatSession {
  id: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

function ChatsContent() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const sessionId = searchParams.get('session');
    if (sessionId) {
      fetchSession(sessionId);
    } else {
      fetchSessions();
    }
  }, [searchParams]);

  const fetchSessions = async () => {
    try {
      const authRes = await fetch('/api/admin/auth');
      const authData = await authRes.json();
      
      if (!authData.authenticated) {
        router.push('/admin');
        return;
      }

      const res = await fetch('/api/admin/chats');
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin');
          return;
        }
        throw new Error('Failed to fetch');
      }

      const data = await res.json();
      setSessions(data.sessions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSession = async (sessionId: string) => {
    try {
      const authRes = await fetch('/api/admin/auth');
      const authData = await authRes.json();
      
      if (!authData.authenticated) {
        router.push('/admin');
        return;
      }

      const res = await fetch(`/api/admin/chats?session=${sessionId}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin');
          return;
        }
        throw new Error('Failed to fetch');
      }

      const data = await res.json();
      setSelectedSession(data.session);
      setMessages(data.messages);
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
      year: 'numeric',
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

  // Show single session view
  if (selectedSession) {
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
                <Link href="/admin/dashboard" className="text-slate-600 hover:text-indigo-600 transition-colors">
                  דשבורד
                </Link>
                <Link href="/admin/support" className="text-slate-600 hover:text-indigo-600 transition-colors">
                  פניות תמיכה
                </Link>
                <Link href="/admin/chats" className="text-indigo-600 font-medium">
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

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-6">
            <Link
              href="/admin/chats"
              className="text-indigo-600 hover:text-indigo-700 text-sm"
            >
              ← חזרה לכל השיחות
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  שיחה מתאריך {formatDate(selectedSession.created_at)}
                </h2>
                <p className="text-sm text-slate-500">
                  {selectedSession.message_count} הודעות
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    <div className="text-xs opacity-70 mb-1">
                      {message.role === 'user' ? 'משתמש' : 'בוט'}
                    </div>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs opacity-50 mt-2 text-left">
                      {new Date(message.created_at).toLocaleTimeString('he-IL', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}

              {messages.length === 0 && (
                <div className="text-center text-slate-400 py-8">
                  אין הודעות בשיחה זו
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show sessions list
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
              <Link href="/admin/dashboard" className="text-slate-600 hover:text-indigo-600 transition-colors">
                דשבורד
              </Link>
              <Link href="/admin/support" className="text-slate-600 hover:text-indigo-600 transition-colors">
                פניות תמיכה
              </Link>
              <Link href="/admin/chats" className="text-indigo-600 font-medium">
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
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-800">
            היסטוריית שיחות
          </h2>
          <p className="text-sm text-slate-500">
            {sessions.length} שיחות
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/admin/chats?session=${session.id}`}
                className="block bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-slate-800">
                      {session.message_count} הודעות
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      {formatDate(session.created_at)}
                    </div>
                  </div>
                  <div className="text-indigo-600 text-sm">
                    צפייה →
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {sessions.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-slate-400">
            אין עדיין שיחות
          </div>
        )}
      </main>
    </div>
  );
}

export default function AdminChats() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center" dir="rtl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <ChatsContent />
    </Suspense>
  );
}
