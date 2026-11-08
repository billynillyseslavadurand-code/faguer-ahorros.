/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, getAllSavedProfiles } from '../utils/userAuth';
import { User, LogIn, LogOut, CheckCircle2, Shield, X, Users, Mail, Lock } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  currentUser: UserProfile | null;
  onClose: () => void;
  onLogin: (profile: UserProfile) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onLogin,
  onLogout,
}) => {
  const [email, setEmail] = useState('billynillyseslavadurand@gmail.com');
  const [name, setName] = useState('Billy Durand');
  const [password, setPassword] = useState('••••••••');
  const [mode, setMode] = useState<'google' | 'password'>('google');

  if (!isOpen) return null;

  const savedProfiles = getAllSavedProfiles();

  const handleGoogleSignIn = () => {
    const profile: UserProfile = {
      uid: 'google-' + (email.split('@')[0] || 'user'),
      name: name || 'Usuario FAGUER',
      email: email || 'usuario@faguer.com',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'F')}`,
      provider: 'google',
    };
    onLogin(profile);
    onClose();
  };

  const handlePasswordSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    const profile: UserProfile = {
      uid: 'pwd-' + email.replace(/[^a-zA-Z0-9]/g, '_'),
      name: name || email.split('@')[0],
      email: email,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}`,
      provider: 'password',
    };
    onLogin(profile);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="bg-[#0e172e] border border-blue-900/40 rounded-2xl p-6 sm:p-8 max-w-md w-full text-slate-100 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-blue-900/60 p-0.5">
              <img
                src="/public/assets/aistudio/logo_c553cfe5.jpg"
                alt="FAGUER"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div>
              <h2 id="auth-modal-title" className="text-lg font-bold text-white">
                Cuenta FAGUER
              </h2>
              <p className="text-xs text-blue-400">Sincronización y acceso personal</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {currentUser ? (
          <div className="mt-5 space-y-4">
            <div className="p-4 bg-blue-950/30 border border-blue-800/40 rounded-xl flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-blue-600/30 border border-blue-400/30 flex items-center justify-center font-bold text-lg text-white">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  currentUser.name.charAt(0)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Sesión activa
                </span>
                <p className="text-sm font-bold text-white truncate mt-0.5">{currentUser.name}</p>
                <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center gap-2 text-slate-300">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Tus datos están aislados y vinculados a tu cuenta</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal pl-6">
                Todos tus depósitos, retiros y configuraciones de tasas se almacenan exclusivamente para ti y funcionan también sin conexión a internet.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onLogout}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Cerrar sesión</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Continuar
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Inicia sesión para tener tu cuenta de ahorros sincronizada y protegida. No requiere ninguna configuración técnica.
            </p>

            {/* Google Sign In button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-3 text-xs sm:text-sm cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar con Google</span>
            </button>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-[#0e172e] px-2 text-slate-500 uppercase tracking-wider text-[10px]">
                  O con correo
                </span>
              </div>
            </div>

            {/* Email & Password Form */}
            <form onSubmit={handlePasswordSignIn} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Tu correo electrónico
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="usuario@ejemplo.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Nombre
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre completo"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Ingresar / Registrarse</span>
              </button>
            </form>

            {/* Saved profiles quick switcher */}
            {savedProfiles.length > 0 && (
              <div className="pt-3 border-t border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Cuentas guardadas en este dispositivo:
                </span>
                <div className="space-y-1.5">
                  {savedProfiles.map((p) => (
                    <button
                      key={p.uid}
                      type="button"
                      onClick={() => {
                        onLogin(p);
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-xs text-slate-300 transition-colors text-left"
                    >
                      <span className="font-medium text-white truncate">{p.name}</span>
                      <span className="text-slate-500 text-[11px] truncate max-w-xs">{p.email}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
