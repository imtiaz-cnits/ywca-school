'use client';

import {
    AlertCircle,
    Coins,
    MessageSquare,
    RefreshCw,
    Send
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function SendSmsPage() {
  const [targetType, setTargetType] = useState('CLASS');
  const [sessionId, setSessionId] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [customNumbers, setCustomNumbers] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  // SMS Balance & Stats
  const [balanceInfo, setBalanceInfo] = useState<any>({ totalSent: '...', balance: '...' });
  const [loadingBalance, setLoadingBalance] = useState(true);

  // Academic Dropdown Data
  const [sessions, setSessions] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);

  const fetchBalance = async () => {
    try {
      setLoadingBalance(true);
      const res = await fetch('/api/sms/balance');
      const data = await res.json();
      if (data.success) {
        setBalanceInfo(data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingBalance(false);
    }
  };

  useEffect(() => {
    async function loadMeta() {
      try {
        const [sesRes, clsRes, secRes] = await Promise.all([
          fetch('/api/academic/sessions'),
          fetch('/api/academic/classes'),
          fetch('/api/academic/sections'),
        ]);

        const [ses, cls, sec] = await Promise.all([
          sesRes.json(),
          clsRes.json(),
          secRes.json(),
        ]);

        if (ses.success) {
          setSessions(ses.sessions);
          const curr = ses.sessions.find((s: any) => s.isCurrent) || ses.sessions[0];
          if (curr) setSessionId(String(curr.id));
        }
        if (cls.success) {
          setClasses(cls.classes);
          if (cls.classes[0]) setClassId(String(cls.classes[0].id));
        }
        if (sec.success) setSections(sec.sections);
      } catch {
        // ignore
      }
    }
    loadMeta();
    fetchBalance();
  }, []);

  const isBangla = /[\u0980-\u09FF]/.test(message);
  const charLimit = isBangla ? 70 : 160;
  const smsCount = message.length > 0 ? Math.ceil(message.length / charLimit) : 0;

  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter message text');
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetType,
          sessionId,
          classId,
          sectionId,
          customNumbers,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.message || 'Failed to send SMS');
        return;
      }

      toast.success(data.message || 'SMS sent successfully!');
      setMessage('');
      fetchBalance();
    } catch (error: any) {
      toast.error(error.message || 'Network error');
    } finally {
      setSending(false);
    }
  };

  const filteredSections = classId
    ? sections.filter((s) => s.classId === Number(classId))
    : sections;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            Send Bulk SMS & Notices
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Broadcast emergency alerts, holiday notices, or fee reminders via Greenweb Gateway.
          </p>
        </div>

        {/* Live Balance Card */}
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 px-4 py-2.5 rounded-2xl shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
            <Coins className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="text-slate-400 block text-[10px]">Greenweb SMS Balance</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {loadingBalance ? 'Checking...' : balanceInfo.balance || 'Active'}
            </span>
          </div>
          <button
            onClick={fetchBalance}
            title="Refresh Balance"
            className="p-1 text-slate-400 hover:text-indigo-600"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingBalance ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SMS Form */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSendSms} className="space-y-5 text-xs">
            {/* Target Selection */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-2">
                1. Select Recipients
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'CLASS', label: 'Class Guardians' },
                  { id: 'ALL_TEACHERS', label: 'All Teachers' },
                  { id: 'ALL_STAFF', label: 'All Staff' },
                  { id: 'CUSTOM', label: 'Custom Numbers' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTargetType(item.id)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      targetType === item.id
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Specific Filters */}
            {targetType === 'CLASS' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Session
                  </label>
                  <select
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="">All Sessions</option>
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Class
                  </label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="">All Classes</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Section
                  </label>
                  <select
                    value={sectionId}
                    onChange={(e) => setSectionId(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none"
                  >
                    <option value="">All Sections</option>
                    {filteredSections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {targetType === 'CUSTOM' && (
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Recipient Mobile Numbers (Comma separated)
                </label>
                <textarea
                  rows={2}
                  value={customNumbers}
                  onChange={(e) => setCustomNumbers(e.target.value)}
                  placeholder="01712345678, 01812345678, 01912345678"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            )}

            {/* Message Body */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  2. Message Text
                </label>
                <span className="text-[11px] text-slate-400">
                  {message.length} chars • {smsCount} SMS ({isBangla ? 'Unicode/Bangla' : 'English'})
                </span>
              </div>
              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="সম্মানিত অভিভাবক, আগামী রবিবার স্কুল বন্ধ থাকবে..."
                required
                className="w-full px-3.5 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={sending}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {sending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Dispatching SMS to Greenweb Gateway...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Broadcast SMS</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info & Sample Templates */}
        <div className="space-y-4 text-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-indigo-600" />
              Quick Templates
            </h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() =>
                  setMessage(
                    'সম্মানিত অভিভাবক, আগামী কাল বিশেষ কারণে স্কুলের পাঠদান স্থগিত থাকবে। - ওয়াইডব্লিউসিএ নার্সারি স্কুল'
                  )
                }
                className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <span className="font-semibold block text-[11px]">ছুটির নোটিশ</span>
                <span className="text-[10px] text-slate-400 line-clamp-1">
                  সম্মানিত অভিভাবক, আগামী কাল বিশেষ কারণে স্কুলের পাঠদান...
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setMessage(
                    'সম্মানিত অভিভাবক, আপনার সন্তানের চলতি মাসের বকেয়া বেতন পরিশোধ করার জন্য অনুরোধ করা হচ্ছে। - YWCA School'
                  )
                }
                className="w-full text-left p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <span className="font-semibold block text-[11px]">বেতন/ফি নোটিশ</span>
                <span className="text-[10px] text-slate-400 line-clamp-1">
                  সম্মানিত অভিভাবক, আপনার সন্তানের চলতি মাসের বকেয়া বেতন...
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

