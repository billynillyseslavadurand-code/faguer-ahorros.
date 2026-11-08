/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  formatSoles,
  formatInterest,
  formatTredPercentage,
  formatDateSpanish,
  DayRecord,
  Movement,
} from '../utils/savingsEngine';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Percent,
  Coins,
} from 'lucide-react';

interface DailyOperationsCardProps {
  todayDate: string;
  todayRecord?: DayRecord;
  lastMovement?: Movement;
  onAddMovement: (type: 'deposito' | 'retiro', amount: number, note?: string) => void;
  onUndoLastMovement: () => void;
  onRequestNegativeWithdrawalConfirm: (amount: number, newBalance: number, note?: string) => void;
}

export const DailyOperationsCard: React.FC<DailyOperationsCardProps> = ({
  todayDate,
  todayRecord,
  lastMovement,
  onAddMovement,
  onUndoLastMovement,
  onRequestNegativeWithdrawalConfirm,
}) => {
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNote, setDepositNote] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalNote, setWithdrawalNote] = useState('');
  const [depositError, setDepositError] = useState<string | null>(null);
  const [withdrawalError, setWithdrawalError] = useState<string | null>(null);

  const closingBalance = todayRecord ? todayRecord.closingBalance : 0;
  const initialBalance = todayRecord ? todayRecord.initialBalance : 0;
  const totalDeposits = todayRecord ? todayRecord.deposits : 0;
  const totalWithdrawals = todayRecord ? todayRecord.withdrawals : 0;
  const dailyInterest = todayRecord ? todayRecord.dailyInterest : 0;
  const accumulatedInterest = todayRecord ? todayRecord.accumulatedInterest : 0;
  const trea = todayRecord ? todayRecord.trea : 4.5;
  const tred = todayRecord ? todayRecord.tred : 0;

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError(null);
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setDepositError('Ingresa un monto válido mayor a 0');
      return;
    }
    onAddMovement('deposito', amount, depositNote.trim() || undefined);
    setDepositAmount('');
    setDepositNote('');
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawalError(null);
    const amount = parseFloat(withdrawalAmount);
    if (isNaN(amount) || amount <= 0) {
      setWithdrawalError('Ingresa un monto válido mayor a 0');
      return;
    }

    const projectedBalance = closingBalance - amount;
    if (projectedBalance < 0) {
      onRequestNegativeWithdrawalConfirm(amount, projectedBalance, withdrawalNote.trim() || undefined);
      setWithdrawalAmount('');
      setWithdrawalNote('');
      return;
    }

    onAddMovement('retiro', amount, withdrawalNote.trim() || undefined);
    setWithdrawalAmount('');
    setWithdrawalNote('');
  };

  return (
    <div className="space-y-5">
      {/* Argon Hero Surface: Balance & Live Indicators */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0e1a38] via-[#0a1226] to-[#070c1b] rounded-2xl sm:rounded-3xl border border-blue-900/40 p-5 sm:p-7 shadow-xl">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-60 h-60 bg-[#F5B731]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>Hoy en tu cuenta</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-300 font-normal">
                {formatDateSpanish(todayDate, true)}
              </span>
            </div>

            <div className="mt-2 flex items-baseline gap-3 flex-wrap">
              <span className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-mono tabular-nums">
                {formatSoles(closingBalance)}
              </span>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold bg-slate-900/60 px-2 py-0.5 rounded-md border border-slate-800">
                Saldo de cierre
              </span>
            </div>
          </div>

          {/* Quick Undo Button */}
          <div className="flex flex-col items-start md:items-end">
            <button
              type="button"
              onClick={onUndoLastMovement}
              disabled={!lastMovement}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                lastMovement
                  ? 'bg-amber-500/15 hover:bg-amber-500/25 text-[#F5B731] border border-[#F5B731]/40 shadow-sm active:scale-95'
                  : 'bg-slate-900/40 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50'
              }`}
              title={
                lastMovement
                  ? `Deshacer: ${lastMovement.type === 'deposito' ? 'Depósito' : 'Retiro'} de ${formatSoles(
                      lastMovement.amount
                    )}`
                  : 'No hay movimientos para deshacer'
              }
            >
              <RotateCcw className="w-4 h-4 shrink-0 text-[#F5B731]" />
              <span>↩ Deshacer último movimiento</span>
            </button>
            {lastMovement && (
              <p className="mt-1 text-[11px] text-slate-400 truncate max-w-xs">
                Último: {lastMovement.type === 'deposito' ? '+' : '-'}
                {formatSoles(lastMovement.amount)} ({lastMovement.timeFormatted})
              </p>
            )}
          </div>
        </div>

        {/* Financial Metrics Strip */}
        <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-6">
          <div className="bg-[#070e20]/60 p-3 rounded-xl border border-blue-900/20">
            <span className="text-[11px] text-slate-400 block font-medium">Saldo inicial</span>
            <span className="text-sm sm:text-base font-bold font-mono tabular-nums text-slate-200">
              {formatSoles(initialBalance)}
            </span>
          </div>

          <div className="bg-[#070e20]/60 p-3 rounded-xl border border-emerald-900/20">
            <span className="text-[11px] text-emerald-400 block font-medium">Depósitos hoy</span>
            <span className="text-sm sm:text-base font-bold font-mono tabular-nums text-emerald-400">
              +{formatSoles(totalDeposits)}
            </span>
          </div>

          <div className="bg-[#070e20]/60 p-3 rounded-xl border border-rose-900/20">
            <span className="text-[11px] text-rose-400 block font-medium">Retiros hoy</span>
            <span className="text-sm sm:text-base font-bold font-mono tabular-nums text-rose-400">
              -{formatSoles(totalWithdrawals)}
            </span>
          </div>

          <div className="bg-[#070e20]/60 p-3 rounded-xl border border-blue-900/20">
            <span className="text-[11px] text-blue-300 block font-medium">Interés diario</span>
            <span className="text-sm sm:text-base font-bold font-mono tabular-nums text-blue-300">
              +{formatInterest(dailyInterest)}
            </span>
          </div>

          <div className="bg-[#070e20]/60 p-3 rounded-xl border border-amber-900/20">
            <span className="text-[11px] text-[#F5B731] block font-medium">Interés mes acum.</span>
            <span className="text-sm sm:text-base font-bold font-mono tabular-nums text-[#F5B731]">
              +{formatInterest(accumulatedInterest)}
            </span>
          </div>

          <div className="bg-[#070e20]/60 p-3 rounded-xl border border-blue-900/20 flex flex-col justify-center">
            <div className="text-[11px] text-slate-400 font-medium">TREA {trea.toFixed(2)}%</div>
            <div className="text-xs font-mono font-bold text-blue-400">
              TRED {formatTredPercentage(tred)}
            </div>
          </div>
        </div>
      </div>

      {/* Two Big Action Boxes: Depósito (Verde) y Retiro (Rojo) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* Depósito Box */}
        <div className="bg-[#0e172e] rounded-2xl border border-emerald-500/30 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ArrowDownCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Registrar Depósito</h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                + Suma al día
              </span>
            </div>

            {depositError && (
              <p className="mt-2 text-xs text-rose-400 font-medium">{depositError}</p>
            )}

            <form onSubmit={handleDepositSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Monto a depositar (S/)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-xl text-emerald-400">
                    S/
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={depositAmount}
                    onChange={(e) => {
                      setDepositAmount(e.target.value);
                      if (depositError) setDepositError(null);
                    }}
                    placeholder="0.00"
                    className="w-full pl-13 pr-4 py-3 bg-[#080e1e] border-2 border-emerald-500/40 rounded-xl text-white text-2xl font-bold font-mono tabular-nums focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={depositNote}
                  onChange={(e) => setDepositNote(e.target.value)}
                  placeholder="Detalle o nota opcional (ej. Ahorro sueldo, Ingreso extra)"
                  className="w-full px-3 py-2 bg-[#080e1e] border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-98 text-white font-bold rounded-xl shadow-lg shadow-emerald-950/40 transition-all text-base cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowDownCircle className="w-5 h-5" />
                <span>Depósito</span>
              </button>
            </form>
          </div>
          <p className="mt-3 text-[11px] text-slate-400 text-center">
            Se acumula al total del día y recalcula el interés al instante.
          </p>
        </div>

        {/* Retiro Box */}
        <div className="bg-[#0e172e] rounded-2xl border border-rose-500/30 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <ArrowUpCircle className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Registrar Retiro</h3>
              </div>
              <span className="text-[11px] font-semibold text-rose-300 bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 rounded-md">
                - Resta al día
              </span>
            </div>

            {withdrawalError && (
              <p className="mt-2 text-xs text-rose-400 font-medium">{withdrawalError}</p>
            )}

            <form onSubmit={handleWithdrawalSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Monto a retirar (S/)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-xl text-rose-400">
                    S/
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={withdrawalAmount}
                    onChange={(e) => {
                      setWithdrawalAmount(e.target.value);
                      if (withdrawalError) setWithdrawalError(null);
                    }}
                    placeholder="0.00"
                    className="w-full pl-13 pr-4 py-3 bg-[#080e1e] border-2 border-rose-500/40 rounded-xl text-white text-2xl font-bold font-mono tabular-nums focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={withdrawalNote}
                  onChange={(e) => setWithdrawalNote(e.target.value)}
                  placeholder="Detalle o nota opcional (ej. Pago servicio, Gastos)"
                  className="w-full px-3 py-2 bg-[#080e1e] border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-98 text-white font-bold rounded-xl shadow-lg shadow-rose-950/40 transition-all text-base cursor-pointer flex items-center justify-center gap-2"
              >
                <ArrowUpCircle className="w-5 h-5" />
                <span>Retiro</span>
              </button>
            </form>
          </div>
          <p className="mt-3 text-[11px] text-slate-400 text-center">
            Avisa si el saldo queda en negativo antes de proceder.
          </p>
        </div>
      </div>
    </div>
  );
};
