'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

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
      setSelectedSession(null);
      setMessages([]);
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
            className="flex-1 py-3 text-center text-sm font-medium text-gray-400 hover:text-white transition-colors"
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
            className="flex-1 py-3 text-center text-sm font-medium text-purple-400 border-b-2 border-purple-500"
          >
            שיחות
          </Link>
        </div>
      </nav>

      <main className="relative p-4 pb-8 max-w-3xl mx-auto">
        {/* Single Session View */}
        {selectedSession ? (
          <>
            <div className="mb-4">
              <Link
                href="/admin/chats"
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                ← כל השיחות
              </Link>
            </div>

            <div className="bg-gray-900/80 backdrop-blur rounded-2xl border border-gray-800 overflow-hidden">
              <div className="p-4 border-b border-gray-800">
                <h2 className="font-medium text-white">
                  שיחה מ-{formatDate(selectedSession.created_at)}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedSession.message_count} הודעות
                </p>
              </div>

              <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02 }}
                    className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-gray-800 text-white'
                          : 'bg-purple-500/20 text-purple-100'
                      }`}
                    >
                      <div className="text-[10px] text-gray-500 mb-1">
                        {message.role === 'user' ? 'משתמש' : 'בוט'}
                      </div>
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                    </div>
                  </motion.div>
                ))}

                {messages.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    אין הודעות בשיחה זו
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Sessions List */}
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-medium text-white">היסטוריית שיחות</h2>
              <span className="text-xs text-gray-500">{sessions.length} שיחות</span>
            </div>

            <div className="space-y-3">
              {sessions.length > 0 ? (
                sessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Link
                      href={`/admin/chats?session=${session.id}`}
                      className="block bg-gray-900/80 backdrop-blur rounded-2xl p-4 border border-gray-800 hover:border-gray-700 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white text-sm">
                            {session.message_count} הודעות
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(session.created_at)}
                          </div>
                        </div>
                        <span className="text-purple-400 text-xs">צפייה →</span>
                      </div>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <div className="bg-gray-900/80 backdrop-blur rounded-2xl p-8 border border-gray-800 text-center">
                  <p className="text-gray-500">אין עדיין שיחות</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function AdminChats() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center" dir="rtl">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ChatsContent />
    </Suspense>
  );
}
