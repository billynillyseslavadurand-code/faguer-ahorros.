/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useOnlineStatus } from '../utils/usePWAInstall';
import { WifiOff, Database } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      className="fixed bottom-18 sm:bottom-4 left-4 z-40 flex items-center gap-2 rounded-xl bg-amber-500/95 text-slate-950 px-3.5 py-2 text-xs font-semibold shadow-lg shadow-amber-950/20 backdrop-blur-xs border border-amber-300 animate-in fade-in slide-in-from-bottom-2"
      role="status"
    >
      <WifiOff className="w-4 h-4 text-slate-950 shrink-0" />
      <span>Modo sin conexión activo — Tus datos se guardan de forma segura localmente</span>
    </div>
  );
};
