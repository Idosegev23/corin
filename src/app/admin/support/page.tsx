'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

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
              <Link href="/admin/support" className="text-indigo-600 font-medium">
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
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex bg-white rounded-xl shadow-sm p-1">
            {(['all', 'open', 'resolved'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {status === 'all' ? 'הכל' : status === 'open' ? 'פתוח' : 'טופל'}
              </button>
            ))}
          </div>
          <span className="text-sm text-slate-500">
            {requests.length} פניות
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Requests List */}
          <div className="lg:col-span-2 space-y-4">
            {requests.length > 0 ? (
              requests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedRequest(request)}
                  className={`bg-white rounded-2xl shadow-sm p-4 cursor-pointer transition-all hover:shadow-md ${
                    selectedRequest?.id === request.id ? 'ring-2 ring-indigo-500' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">
                          {request.customer_name}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            request.status === 'open'
                              ? 'bg-orange-100 text-orange-600'
                              : 'bg-green-100 text-green-600'
                          }`}
                        >
                          {request.status === 'open' ? 'פתוח' : 'טופל'}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500 mt-1">
                        {request.brand} • הזמנה: {request.order_number || '-'}
                      </div>
                      <div className="text-sm text-slate-600 mt-2 line-clamp-2">
                        {request.problem}
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-slate-400">
                        {formatDate(request.created_at)}
                      </div>
                      {request.whatsapp_sent && (
                        <div className="text-xs text-green-500 mt-1">
                          WhatsApp נשלח
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-slate-400">
                אין פניות להצגה
              </div>
            )}
          </div>

          {/* Selected Request Details */}
          <div className="lg:col-span-1">
            {selectedRequest ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-sm p-6 sticky top-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800">פרטי פנייה</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      selectedRequest.status === 'open'
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-green-100 text-green-600'
                    }`}
                  >
                    {selectedRequest.status === 'open' ? 'פתוח' : 'טופל'}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-xs text-slate-400">שם לקוח</div>
                    <div className="text-slate-800">{selectedRequest.customer_name}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-slate-400">מותג</div>
                    <div className="text-slate-800">{selectedRequest.brand}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-slate-400">מספר הזמנה</div>
                    <div className="text-slate-800">{selectedRequest.order_number || '-'}</div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-slate-400">טלפון</div>
                    <a
                      href={`tel:${selectedRequest.phone}`}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      {selectedRequest.phone}
                    </a>
                  </div>
                  
                  <div>
                    <div className="text-xs text-slate-400">תיאור הבעיה</div>
                    <div className="text-slate-800 whitespace-pre-wrap">
                      {selectedRequest.problem}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-slate-400">תאריך פתיחה</div>
                    <div className="text-slate-800">{formatDate(selectedRequest.created_at)}</div>
                  </div>

                  {selectedRequest.resolved_at && (
                    <div>
                      <div className="text-xs text-slate-400">תאריך טיפול</div>
                      <div className="text-slate-800">{formatDate(selectedRequest.resolved_at)}</div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                  {selectedRequest.status === 'open' ? (
                    <button
                      onClick={() => updateStatus(selectedRequest.id, 'resolved')}
                      className="w-full py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors text-sm font-medium"
                    >
                      סמן כטופל
                    </button>
                  ) : (
                    <button
                      onClick={() => updateStatus(selectedRequest.id, 'open')}
                      className="w-full py-2 px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors text-sm font-medium"
                    >
                      פתח מחדש
                    </button>
                  )}
                  
                  <a
                    href={`https://wa.me/972${selectedRequest.phone.replace(/^0/, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors text-sm font-medium text-center"
                  >
                    שלח WhatsApp
                  </a>
                </div>
              </motion.div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-8 text-center text-slate-400">
                בחר פנייה לצפייה בפרטים
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
