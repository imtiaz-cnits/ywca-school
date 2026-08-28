'use client';

import {
    Check,
    Copy,
    Fingerprint,
    Key,
    Server,
    ShieldCheck,
    Terminal
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function BiometricSettingsPage() {
  const [copiedToken, setCopiedToken] = useState(false);
  const syncSecret = 'ywca_zkteco_k40_bridge_sync_token_secret_9988';
  const apiEndpoint = 'https://your-domain.com/api/attendance/sync';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Fingerprint className="w-5 h-5 text-indigo-600" />
          ZKTeco K40 Biometric Device & Sync Agent Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Step-by-step connection guide for physical ZKTeco attendance devices on school premises.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        {/* Connection Credentials Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-600" />
              Cloud Sync Credentials
            </h2>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Cloud Webhook / Sync Endpoint URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={apiEndpoint}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-mono text-xs focus:outline-none"
                />
                <button
                  onClick={() => handleCopy(apiEndpoint)}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy
                </button>
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Biometric Bridge Secret Token (Keep Private)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={syncSecret}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-mono text-xs focus:outline-none"
                />
                <button
                  onClick={() => handleCopy(syncSecret)}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1"
                >
                  {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedToken ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Setup Guide Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-600" />
              How To Setup On School Local PC
            </h2>

            <div className="space-y-3 text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white mb-1">
                  1. Setup Physical ZKTeco K40 Device:
                </p>
                <p>
                  Connect the K40 machine to the school router with an ethernet LAN cable or WiFi.
                  Go to <span className="font-semibold text-slate-800 dark:text-slate-200">K40 Menu ➔ Comm. ➔ Network</span> and set IP Address to <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded font-mono text-indigo-600">192.168.1.201</code> (or any static local IP) and Port <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded font-mono text-indigo-600">4370</code>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white mb-1">
                  2. Install Sync Bridge Script:
                </p>
                <p>
                  On the school desktop/laptop computer (connected to the same WiFi/router), open terminal in <code className="bg-white dark:bg-slate-900 px-1 py-0.5 rounded font-mono text-indigo-600">scripts/zkteco-bridge/</code> and run:
                </p>
                <pre className="mt-2 p-2.5 rounded-lg bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto">
                  npm install{'\n'}
                  node bridge.js
                </pre>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white mb-1">
                  3. Automatic Windows Background Service (Optional):
                </p>
                <p>
                  You can register <code className="font-mono text-indigo-600">bridge.js</code> as a background Windows service using <span className="font-semibold">node-windows</span> or <span className="font-semibold">PM2 for Windows</span>, so it starts automatically whenever the computer turns on.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Device Spec Card */}
        <div className="space-y-4">
          <div className="bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Offline Resilience
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              If the school internet goes down, the local sync agent buffers all punches in a local cache file. As soon as the internet recovers, all pending punches are automatically uploaded to the cloud server!
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Server className="w-4 h-4 text-indigo-600" />
              K40 Hardware Parameters
            </h3>
            <div className="space-y-2 text-slate-600 dark:text-slate-400 text-[11px]">
              <div className="flex justify-between">
                <span>Default Port:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">4370 (UDP/TCP)</span>
              </div>
              <div className="flex justify-between">
                <span>Protocol:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">ZKEM / Standalone</span>
              </div>
              <div className="flex justify-between">
                <span>Auto SMS Trigger:</span>
                <span className="font-bold text-emerald-600">Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

