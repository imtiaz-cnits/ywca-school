'use client';

import { format } from 'date-fns';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    Fingerprint,
    RefreshCw,
    Send,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function LivePunchMonitorPage() {
  const [punches, setPunches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Punch Simulator state for testing
  const [simUserId, setSimUserId] = useState('');
  const [simLoading, setSimLoading] = useState(false);

  const fetchPunches = async () => {
    try {
      const res = await fetch('/api/dashboard/summary');
      const data = await res.json();
      if (data.success) {
        setPunches(data.recentPunches || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPunches();
    if (!autoRefresh) return;
    const interval = setInterval(fetchPunches, 5000); // 5s poll
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleSimulatePunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simUserId.trim()) {
      toast.error('Please enter a Biometric User ID');
      return;
    }

    setSimLoading(true);
    try {
      const res = await fetch('/api/attendance/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bridge-token': 'ywca_zkteco_k40_bridge_sync_token_secret_9988',
        },
        body: JSON.stringify({
          userId: simUserId.trim(),
          timestamp: new Date().toISOString(),
          verifyMode: 1,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Punch recorded for User ID: ${simUserId}`);
        setSimUserId('');
        fetchPunches();
      } else {
        toast.error(data.message || 'Sync failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Network error');
    } finally {
      setSimLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-indigo-600" />
            Live ZKTeco K60 Biometric Punch Monitor
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time feed of punches sent from the school gate device.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <input
              type="checkbox"
              id="autoRefresh"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded text-indigo-600"
            />
            <label htmlFor="autoRefresh" className="text-slate-600 dark:text-slate-400 font-medium">
              Live Auto-Refresh (5s)
            </label>
          </div>
          <button
            onClick={fetchPunches}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 hover:text-indigo-600 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Punches Stream */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              Latest Device Punches
            </h2>
            <span className="text-xs text-slate-400">Total Recent: {punches.length}</span>
          </div>

          <div className="space-y-3">
            {punches.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                No biometric punches received yet. Start the bridge agent or use the simulator.
              </div>
            ) : (
              punches.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs hover:border-indigo-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 flex items-center justify-center font-bold">
                      <Fingerprint className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100">
                        Biometric User ID: <span className="font-mono text-indigo-600">{p.biometricUserId}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {format(new Date(p.punchTime), 'dd MMM yyyy • hh:mm:ss a')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                      <CheckCircle2 className="w-3 h-3" /> Synced
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Simulator & Hardware Info */}
        <div className="space-y-6">
          {/* Punch Simulator Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-600" />
              Simulate Device Punch
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Test instant punch registration and automated SMS dispatch from the browser.
            </p>

            <form onSubmit={handleSimulatePunch} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Biometric User ID / Student ID
                </label>
                <input
                  type="text"
                  value={simUserId}
                  onChange={(e) => setSimUserId(e.target.value)}
                  placeholder="e.g. 101, STU-2025-0001"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={simLoading}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {simLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Fingerprint className="w-3.5 h-3.5" />}
                Trigger Instant Punch
              </button>
            </form>
          </div>

          {/* Device Setup Status */}
          <div className="bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-5 text-xs space-y-3">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold">
              <AlertCircle className="w-4 h-4" />
              Hardware Integration Guide
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              To connect your physical ZKTeco K60 device:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
              <li>Connect K60 to the school WiFi / LAN router.</li>
              <li>Set static IP on K60 (e.g. <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded text-indigo-600">192.168.0.134</code>).</li>
              <li>Run the lightweight Sync Agent script on any school PC.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

