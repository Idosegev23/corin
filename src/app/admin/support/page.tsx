'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface SupportRequest {
  id: string;
  brand: string;
  customer_name: string;
  order_number: string | null;
  problem: string;
  phone: string;
  status: 'open' | 'resolved';
  whatsapp_sent: boolean;
  created_at: string;
  resolved_at: string | null;
}

export default function AdminSupport() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      const authRes = await fetch('/api/admin/auth');
      const authData = await authRes.json();
      
      if (!authData.authenticated) {
        router.push('/admin');
        return;
      }

      const res = await fetch(`/api/admin/support?status=${statusFilter}`);
      if (!res.ok) {
        if (res.status === 401) {
          router.push('/admin');
          return;
        }
        throw new Error('Failed to fetch');
      }

      const data = await res.json();
      setRequests(data.requests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: 'open' | 'resolved') => {
    try {
      const res = await fetch('/api/admin/support', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        setRequests((prev) =>
          prev.map((r) =>
            r.id === id
              ? { ...r, status: newStatus, resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null }
              : r
          )
        );
        if (selectedRequest?.id === id) {
          setSelectedRequest((prev) =>
            prev ? { ...prev, status: newStatus } : null
          );
        }
      }
    } catch (err) {
      console.error(err);
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
            className="flex-1 py-3 text-center text-sm font-medium text-purple-400 border-b-2 border-purple-500"
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
        {/* Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {(['all', 'open', 'resolved'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {status === 'all' ? 'הכל' : status === 'open' ? 'פתוחות' : 'טופלו'}
            </button>
          ))}
          <span className="px-3 py-2 text-xs text-gray-500 whitespace-nowrap">
            {requests.length} פניות
          </span>
        </div>

        {/* Requests List */}
        <div className="space-y-3">
          {requests.length > 0 ? (
            requests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => setSelectedRequest(request)}
                className={`bg-gray-900/80 backdrop-blur rounded-2xl p-4 border cursor-pointer transition-all ${
                  selectedRequest?.id === request.id
                    ? 'border-purple-500 ring-2 ring-purple-500/20'
                    : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{request.customer_name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          request.status === 'open'
                            ? 'bg-orange-500/20 text-orange-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}
                      >
                        {request.status === 'open' ? 'פתוח' : 'טופל'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">{request.brand} • {request.order_number || 'ללא מספר'}</div>
                    <div className="text-sm text-gray-400 line-clamp-2">{request.problem}</div>
                  </div>
                  <div className="text-[10px] text-gray-600 whitespace-nowrap">
                    {formatDate(request.created_at)}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-gray-900/80 backdrop-blur rounded-2xl p-8 border border-gray-800 text-center">
              <p className="text-gray-500">אין פניות להצגה</p>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setSelectedRequest(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: '100%' }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: '100%' }}
              className="fixed inset-x-0 bottom-0 z-50 bg-gray-900 rounded-t-3xl max-h-[85vh] overflow-auto"
              dir="rtl"
            >
              <div className="sticky top-0 bg-gray-900 p-4 border-b border-gray-800 flex items-center justify-between">
                <h3 className="font-semibold text-white">פרטי פנייה</h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 text-lg font-bold">
                    {selectedRequest.brand.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-white">{selectedRequest.customer_name}</div>
                    <div className="text-sm text-gray-500">{selectedRequest.brand}</div>
                  </div>
                  <span
                    className={`mr-auto text-xs px-3 py-1 rounded-full font-medium ${
                      selectedRequest.status === 'open'
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-green-500/20 text-green-400'
                    }`}
                  >
                    {selectedRequest.status === 'open' ? 'פתוח' : 'טופל'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800/50 rounded-xl p-3">
                    <div className="text-[10px] text-gray-500 mb-1">מספר הזמנה</div>
                    <div className="text-sm text-white">{selectedRequest.order_number || '-'}</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-xl p-3">
                    <div className="text-[10px] text-gray-500 mb-1">טלפון</div>
                    <a
                      href={`tel:${selectedRequest.phone}`}
                      className="text-sm text-purple-400"
                    >
                      {selectedRequest.phone}
                    </a>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-3">
                  <div className="text-[10px] text-gray-500 mb-1">תיאור הבעיה</div>
                  <div className="text-sm text-gray-300 whitespace-pre-wrap">{selectedRequest.problem}</div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800/50 rounded-xl p-3">
                    <div className="text-[10px] text-gray-500 mb-1">נפתח</div>
                    <div className="text-xs text-white">{formatDate(selectedRequest.created_at)}</div>
                  </div>
                  {selectedRequest.resolved_at && (
                    <div className="bg-gray-800/50 rounded-xl p-3">
                      <div className="text-[10px] text-gray-500 mb-1">טופל</div>
                      <div className="text-xs text-white">{formatDate(selectedRequest.resolved_at)}</div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  {selectedRequest.status === 'open' ? (
                    <button
                      onClick={() => updateStatus(selectedRequest.id, 'resolved')}
                      className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors"
                    >
                      סמן כטופל
                    </button>
                  ) : (
                    <button
                      onClick={() => updateStatus(selectedRequest.id, 'open')}
                      className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors"
                    >
                      פתח מחדש
                    </button>
                  )}
                  <a
                    href={`https://wa.me/972${selectedRequest.phone.replace(/^0/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors text-center"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
