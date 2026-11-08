/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserProfile } from '../utils/userAuth';
import { PWAInstallButton } from './PWAInstallButton';
import {
  FileSpreadsheet,
  Sliders,
  Calendar,
  ArrowDownUp,
  User,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'principal' | 'historial' | 'configuracion';
  setActiveTab: (tab: 'principal' | 'historial' | 'configuracion') => void;
  onExportCurrentMonth: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onExportCurrentMonth,
  currentUser,
  onOpenAuth,
}) => {
  return (
    <header className="bg-[#0b142c]/90 border-b border-blue-900/40 sticky top-0 z-30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-16">
          {/* Zone 1: FAGUER Brand Zone with uploaded logo asset */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-9 w-9 rounded-xl overflow-hidden bg-slate-900 border border-blue-500/40 shadow-md shadow-blue-950/40 p-0.5 flex items-center justify-center">
              <img
                src="/public/assets/aistudio/logo_c553cfe5.jpg"
                alt="FAGUER Logo"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-wider text-white uppercase font-sans">
                  FAGUER
                </span>
                <span className="text-[10px] font-bold tracking-widest text-[#F5B731] bg-[#F5B731]/15 px-1.5 py-0.2 rounded border border-[#F5B731]/30 uppercase">
                  SOLES
                </span>
              </div>
              <span className="text-[10px] text-blue-300 font-medium hidden sm:inline">
                Ahorros & Rendimiento Bancario
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links / Segmented Argon Controls */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 bg-[#070d1e]/80 rounded-xl border border-blue-900/30">
            <button
              type="button"
              onClick={() => setActiveTab('principal')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'principal'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <ArrowDownUp className="w-3.5 h-3.5" />
              <span>Cuenta Principal</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('historial')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'historial'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Historial Mensual</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('configuracion')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'configuracion'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Tasas y Ajustes</span>
            </button>
          </nav>

          {/* Zone 3: Actions - PWA Install, User Profile, Export */}
          <div className="flex items-center gap-2 shrink-0">
            {/* In-app PWA install button */}
            <PWAInstallButton />

            {/* User Account Button */}
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800/80 border border-blue-900/40 text-xs text-slate-200 transition-all cursor-pointer"
              title={currentUser ? `Cuenta: ${currentUser.name}` : 'Iniciar sesión'}
            >
              {currentUser ? (
                <>
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-blue-600/30 border border-blue-400/40 flex items-center justify-center font-bold text-[10px] text-white">
                    {currentUser.avatarUrl ? (
                      <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      currentUser.name.charAt(0)
                    )}
                  </div>
                  <span className="hidden sm:inline font-medium max-w-[100px] truncate text-slate-200">
                    {currentUser.name}
                  </span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4 text-blue-400" />
                  <span className="hidden sm:inline font-medium text-slate-300">
                    Mi Cuenta
                  </span>
                </>
              )}
            </button>

            {/* Export Excel button */}
            <button
              type="button"
              onClick={onExportCurrentMonth}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
              title="Descargar este mes en formato Excel / CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Excel</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
