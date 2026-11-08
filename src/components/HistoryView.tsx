/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  MonthSummary,
  DayRecord,
  formatSoles,
  formatInterest,
  exportToCsv,
} from '../utils/savingsEngine';
import {
  Calendar,
  Lock,
  Unlock,
  Download,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface HistoryViewProps {
  monthSummaries: MonthSummary[];
  days: DayRecord[];
  todayDate: string;
  onSelectDayForEdit: (day: DayRecord) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  monthSummaries,
  days,
  todayDate,
  onSelectDayForEdit,
}) => {
  const [expandedMonth, setExpandedMonth] = useState<string | null>(
    monthSummaries.length > 0 ? monthSummaries[monthSummaries.length - 1].yearMonth : null
  );
  const [unlockedMonths, setUnlockedMonths] = useState<Set<string>>(new Set());
  const [monthToUnlock, setMonthToUnlock] = useState<string | null>(null);

  const toggleMonth = (yearMonth: string) => {
    setExpandedMonth(expandedMonth === yearMonth ? null : yearMonth);
  };

  const handleExportAll = () => {
    const csv = exportToCsv(days);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `faguer_historial_completo_${todayDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportMonth = (mSummary: MonthSummary) => {
    const monthDays = days.filter((d) => d.date.substring(0, 7) === mSummary.yearMonth);
    const csv = exportToCsv(monthDays);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `faguer_historial_${mSummary.yearMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleConfirmUnlock = () => {
    if (monthToUnlock) {
      setUnlockedMonths(new Set([...unlockedMonths, monthToUnlock]));
      setMonthToUnlock(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header of History */}
      <div className="bg-[#0e172e] rounded-2xl border border-blue-900/30 p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-white">
              Historial de Cierres y Renovaciones Mensuales
            </h2>
          </div>
          <p className="text-xs text-blue-300/80 mt-1">
            Cada fin de mes FAGUER archiva automáticamente el período con su resumen financiero.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportAll}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 shadow-md shadow-blue-950/50"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Exportar Todo el Historial (Excel)</span>
        </button>
      </div>

      {/* Month list */}
      <div className="space-y-4">
        {monthSummaries.map((m) => {
          const isExpanded = expandedMonth === m.yearMonth;
          const isUnlocked = unlockedMonths.has(m.yearMonth) || !m.isClosed;
          const monthDays = days.filter((d) => d.date.substring(0, 7) === m.yearMonth);

          return (
            <div
              key={m.yearMonth}
              className="bg-[#0e172e] rounded-2xl border border-blue-900/30 shadow-xl overflow-hidden transition-all"
            >
              {/* Summary Card Header */}
              <div
                onClick={() => toggleMonth(m.yearMonth)}
                className="p-5 sm:p-6 cursor-pointer hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${
                        m.isClosed
                          ? 'bg-slate-800 text-slate-300 border border-slate-700'
                          : 'bg-blue-600/25 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {m.yearMonth.split('-')[1]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-white">
                          {m.label}
                        </h3>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            m.isClosed
                              ? 'bg-slate-800 text-slate-400 border border-slate-700'
                              : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {m.isClosed ? 'Mes archivado' : 'En curso'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {m.startDate} al {m.endDate} · {m.dayCount} días registrados
                      </p>
                    </div>
                  </div>

                  {/* High level KPI row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs sm:text-sm">
                    <div className="bg-[#080e1e]/60 p-2.5 rounded-xl border border-blue-900/20">
                      <span className="text-[10px] text-slate-400 block font-medium">Saldo inicial</span>
                      <span className="font-mono tabular-nums font-bold text-slate-200">
                        {formatSoles(m.initialBalance)}
                      </span>
                    </div>

                    <div className="bg-[#080e1e]/60 p-2.5 rounded-xl border border-blue-900/20">
                      <span className="text-[10px] text-slate-400 block font-medium">Saldo final</span>
                      <span className="font-mono tabular-nums font-black text-white">
                        {formatSoles(m.closingBalance)}
                      </span>
                    </div>

                    <div className="bg-[#080e1e]/60 p-2.5 rounded-xl border border-amber-900/20">
                      <span className="text-[10px] text-[#F5B731] block font-medium">Interés del mes</span>
                      <span className="font-mono tabular-nums font-bold text-[#F5B731]">
                        +{formatInterest(m.totalInterest)}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportMonth(m);
                        }}
                        className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/40 rounded-xl transition-colors cursor-pointer"
                        title="Exportar este mes a CSV"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <div className="text-slate-400">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submetrics breakdown */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Total depositado:</span>
                    <strong className="text-emerald-400 font-mono">
                      {formatSoles(m.totalDeposits)}
                    </strong>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
                    <span>Total retirado:</span>
                    <strong className="text-rose-400 font-mono">
                      {formatSoles(m.totalWithdrawals)}
                    </strong>
                  </div>

                  <div>
                    <span>TREA promedio:</span>{' '}
                    <strong className="text-blue-300 font-mono">
                      {m.averageTrea.toFixed(2)}%
                    </strong>
                  </div>
                </div>
              </div>

              {/* Expandable Daily Breakdown Table */}
              {isExpanded && (
                <div className="border-t border-slate-800 bg-[#080e1e]/60 p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Detalle diario de {m.label}
                    </span>

                    {m.isClosed && (
                      <div className="flex items-center gap-2">
                        {isUnlocked ? (
                          <span className="inline-flex items-center gap-1 text-xs text-[#F5B731] bg-amber-500/10 px-2.5 py-1 rounded-lg border border-[#F5B731]/40">
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Edición habilitada</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setMonthToUnlock(m.yearMonth)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                          >
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Habilitar edición de mes archivado</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="overflow-x-auto bg-[#0e172e] rounded-xl border border-blue-900/30 max-h-96">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="sticky top-0 bg-[#080e1e] text-slate-400 font-bold border-b border-slate-800">
                        <tr>
                          <th className="py-2.5 px-3 whitespace-nowrap">Fecha</th>
                          <th className="py-2.5 px-3 text-right whitespace-nowrap">Saldo inicial</th>
                          <th className="py-2.5 px-3 text-right whitespace-nowrap text-emerald-400">Depósitos</th>
                          <th className="py-2.5 px-3 text-right whitespace-nowrap text-rose-400">Retiros</th>
                          <th className="py-2.5 px-3 text-right whitespace-nowrap text-white font-black">Saldo cierre</th>
                          <th className="py-2.5 px-3 text-right whitespace-nowrap text-blue-300">Interés diario</th>
                          <th className="py-2.5 px-3 text-right whitespace-nowrap text-[#F5B731] font-bold">Interés acum.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80 font-mono">
                        {monthDays.map((d) => (
                          <tr
                            key={d.date}
                            onClick={() => {
                              if (isUnlocked) {
                                onSelectDayForEdit(d);
                              } else {
                                setMonthToUnlock(m.yearMonth);
                              }
                            }}
                            className={`hover:bg-slate-800/50 transition-colors cursor-pointer ${
                              d.date === todayDate ? 'bg-[#F5B731]/15 text-white font-bold' : 'text-slate-300'
                            }`}
                          >
                            <td className="py-2.5 px-3 font-sans whitespace-nowrap">{d.date}</td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap text-slate-400">
                              {formatSoles(d.initialBalance)}
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap text-emerald-400">
                              {d.deposits > 0 ? `+${formatSoles(d.deposits)}` : 'S/ 0.00'}
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap text-rose-400">
                              {d.withdrawals > 0 ? `-${formatSoles(d.withdrawals)}` : 'S/ 0.00'}
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap font-black text-white">
                              {formatSoles(d.closingBalance)}
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap text-blue-300">
                              +{formatInterest(d.dailyInterest)}
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap font-bold text-[#F5B731]">
                              +{formatInterest(d.accumulatedInterest)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <ConfirmModal
        isOpen={Boolean(monthToUnlock)}
        title="¿Habilitar edición de mes archivado?"
        description="Este mes ya fue cerrado. Si modificas sus depósitos o retiros, todos los saldos iniciales e intereses de los meses posteriores se recalcularán automáticamente para mantener la coherencia financiera."
        confirmLabel="Entendido, habilitar edición"
        cancelLabel="Mantener protegido"
        onConfirm={handleConfirmUnlock}
        onCancel={() => setMonthToUnlock(null)}
      />
    </div>
  );
};
