/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Percent, ShieldCheck } from 'lucide-react';
import { getLocalDateString, calculateTred, formatTredPercentage } from '../utils/savingsEngine';

interface InitialSetupModalProps {
  isOpen: boolean;
  onSave: (config: {
    startDate: string;
    initialBalance: number;
    trea: number;
    capitalizeMonthlyInterest: boolean;
  }) => void;
}

export const InitialSetupModal: React.FC<InitialSetupModalProps> = ({ isOpen, onSave }) => {
  const today = getLocalDateString();
  const [startDate, setStartDate] = useState(today);
  const [initialBalance, setInitialBalance] = useState('0');
  const [trea, setTrea] = useState('4.5');
  const [capitalize, setCapitalize] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const numTrea = parseFloat(trea) || 0;
  const computedTred = calculateTred(numTrea);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) {
      setError('Por favor selecciona una fecha de inicio.');
      return;
    }
    const bal = parseFloat(initialBalance);
    if (isNaN(bal) || bal < 0) {
      setError('El saldo inicial debe ser un número mayor o igual a 0.');
      return;
    }
    const parsedTrea = parseFloat(trea);
    if (isNaN(parsedTrea) || parsedTrea < 0) {
      setError('La TREA debe ser un valor positivo o cero.');
      return;
    }

    onSave({
      startDate,
      initialBalance: bal,
      trea: parsedTrea,
      capitalizeMonthlyInterest: capitalize,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="setup-title"
    >
      <div className="bg-[#0e172e] rounded-3xl shadow-2xl border border-blue-900/50 max-w-lg w-full p-6 sm:p-8 my-8 text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-900 border border-blue-500/50 shadow-md p-0.5">
            <img
              src="/public/assets/aistudio/logo_c553cfe5.jpg"
              alt="FAGUER"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          <div>
            <h2 id="setup-title" className="text-xl font-bold text-white">
              FAGUER · Control de Ahorros
            </h2>
            <p className="text-xs text-blue-300">Configura tu cuenta bancaria en soles para comenzar</p>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-xs text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Fecha de inicio */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Fecha de inicio de la cuenta
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-[#080e1e] border border-blue-900/40 rounded-xl text-white text-xs font-medium focus:outline-none focus:border-blue-400"
                required
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              La cuenta iniciará estrictamente desde esta fecha; los días previos no se mostrarán ni calcularán intereses.
            </p>
          </div>

          {/* Saldo inicial */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Saldo inicial (S/)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm text-[#F5B731]">
                S/
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                placeholder="0.00"
                className="w-full pl-9 pr-3 py-2.5 bg-[#080e1e] border border-blue-900/40 rounded-xl text-white text-sm font-mono font-bold tabular-nums focus:outline-none focus:border-blue-400"
                required
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Monto con el que abres o empiezas a registrar tu cuenta (puede ser 0).
            </p>
          </div>

          {/* TREA anual */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                TREA (o TEA) del banco
              </label>
              <span className="text-[11px] text-slate-400">
                TRED calculada: <strong className="text-blue-400 font-mono">{formatTredPercentage(computedTred)}</strong>
              </span>
            </div>
            <div className="relative">
              <Percent className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={trea}
                onChange={(e) => setTrea(e.target.value)}
                placeholder="4.5"
                className="w-full pl-3 pr-9 py-2.5 bg-[#080e1e] border border-blue-900/40 rounded-xl text-white text-sm font-mono font-bold tabular-nums focus:outline-none focus:border-blue-400"
                required
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              Tasa anual según tu entidad. La tasa diaria (TRED) se calcula automáticamente en base 360 días.
            </p>
          </div>

          {/* Capitalización de intereses */}
          <div className="pt-2 border-t border-slate-800">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={capitalize}
                onChange={(e) => setCapitalize(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-700 bg-slate-900 focus:ring-blue-500 cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-semibold text-white block">
                  Capitalizar el interés al cierre de mes (el último día del mes)
                </span>
                <span className="text-slate-400 leading-normal block mt-0.5 text-[11px]">
                  Desactivado por defecto. Si lo activas, el interés acumulado del mes se abonará en el saldo del último día del mes.
                </span>
              </div>
            </label>
          </div>

          {/* Botón de inicio */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-950/50 transition-all text-sm cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Comenzar con FAGUER Ahorros</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
