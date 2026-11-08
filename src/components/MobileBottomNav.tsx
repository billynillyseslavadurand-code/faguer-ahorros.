/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowDownUp, Calendar, Sliders, PlusCircle } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'principal' | 'historial' | 'configuracion';
  setActiveTab: (tab: 'principal' | 'historial' | 'configuracion') => void;
  onQuickAction?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080e1e]/95 border-t border-blue-900/40 backdrop-blur-lg px-4 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setActiveTab('principal')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'principal'
              ? 'text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              activeTab === 'principal'
                ? 'bg-blue-600 shadow-md shadow-blue-900/50 text-white'
                : 'text-slate-400'
            }`}
          >
            <ArrowDownUp className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold tracking-tight">Principal</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('historial')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'historial'
              ? 'text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              activeTab === 'historial'
                ? 'bg-blue-600 shadow-md shadow-blue-900/50 text-white'
                : 'text-slate-400'
            }`}
          >
            <Calendar className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold tracking-tight">Historial</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('configuracion')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
            activeTab === 'configuracion'
              ? 'text-white'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              activeTab === 'configuracion'
                ? 'bg-blue-600 shadow-md shadow-blue-900/50 text-white'
                : 'text-slate-400'
            }`}
          >
            <Sliders className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-semibold tracking-tight">Tasas & PWA</span>
        </button>
      </div>
    </div>
  );
};
