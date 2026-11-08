/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  DayRecord,
  formatSoles,
  formatInterest,
  exportToCsv,
  formatMonthKeySpanish,
} from '../utils/savingsEngine';
import { Download, FileSpreadsheet, Edit3, ChevronRight, Filter } from 'lucide-react';

interface ExcelTableProps {
  days: DayRecord[];
  todayDate: string;
  onSelectDay: (day: DayRecord) => void;
}

export const ExcelTable: React.FC<ExcelTableProps> = ({
  days,
  todayDate,
  onSelectDay,
}) => {
  const months = Array.from(new Set(days.map((d) => d.date.substring(0, 7)))).sort().reverse();
  const currentMonthKey = todayDate.substring(0, 7);

  const [selectedMonth, setSelectedMonth] = useState<string>(
    months.includes(currentMonthKey) ? currentMonthKey : months[0] || 'all'
  );

  const filteredDays = selectedMonth === 'all'
    ? days
    : days.filter((d) => d.date.substring(0, 7) === selectedMonth);

  const handleDownloadCsv = () => {
    const csvData = exportToCsv(filteredDays);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const label = selectedMonth === 'all' ? 'completo' : selectedMonth;
    link.href = url;
    link.setAttribute('download', `faguer_ahorros_soles_${label}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#0e172e] rounded-2xl border border-blue-900/30 shadow-xl overflow-hidden">
      {/* Header toolbar */}
      <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Tabla Diaria (Registro Excel Bancario)
            </h3>
          </div>
          <p className="text-xs text-blue-300/80 mt-1">
            Toca cualquier día para revisar operaciones o corregir montos pasados. Hoy está resaltado en dorado.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Month selector */}
          <div className="flex items-center gap-1.5 bg-[#080e1e] border border-blue-900/40 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-blue-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent font-medium text-slate-200 focus:outline-none cursor-pointer"
            >
              {months.map((m) => (
                <option key={m} value={m} className="bg-[#0e172e] text-white">
                  {formatMonthKeySpanish(m)} {m === currentMonthKey ? '(Mes actual)' : ''}
                </option>
              ))}
              <option value="all" className="bg-[#0e172e] text-white">
                Ver todos los meses ({days.length} días)
              </option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/40 rounded-xl transition-colors cursor-pointer shadow-sm"
            title="Descargar este periodo en formato Excel CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar CSV</span>
          </button>
        </div>
      </div>

      {/* Table container with responsive horizontal scroll and sticky header */}
      <div className="overflow-x-auto max-h-[600px]">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead className="sticky top-0 bg-[#080e1e] text-slate-400 uppercase tracking-wider text-[11px] font-bold border-b border-slate-800 z-10 shadow-md">
            <tr>
              <th className="py-3 px-3 sm:px-4 whitespace-nowrap">Fecha</th>
              <th className="py-3 px-3 sm:px-4 text-right whitespace-nowrap text-slate-400">Saldo inicial</th>
              <th className="py-3 px-3 sm:px-4 text-right whitespace-nowrap text-emerald-400">Depósitos</th>
              <th className="py-3 px-3 sm:px-4 text-right whitespace-nowrap text-rose-400">Retiros</th>
              <th className="py-3 px-3 sm:px-4 text-right whitespace-nowrap text-white font-black">Saldo cierre</th>
              <th className="py-3 px-3 sm:px-4 text-right whitespace-nowrap text-blue-300">Interés diario</th>
              <th className="py-3 px-3 sm:px-4 text-right whitespace-nowrap text-[#F5B731] font-bold">Interés acum.</th>
              <th className="py-3 px-2 text-center whitespace-nowrap text-slate-600">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredDays.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                  No hay registros disponibles para el período seleccionado.
                </td>
              </tr>
            ) : (
              filteredDays.map((d) => {
                const isToday = d.date === todayDate;
                return (
                  <tr
                    key={d.date}
                    onClick={() => onSelectDay(d)}
                    className={`transition-colors cursor-pointer group ${
                      isToday
                        ? 'bg-[#F5B731]/15 hover:bg-[#F5B731]/25 text-white border-y-2 border-[#F5B731]/80 font-semibold'
                        : 'hover:bg-slate-800/50 text-slate-300'
                    }`}
                  >
                    {/* Fecha */}
                    <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs">{d.date}</span>
                        {isToday && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F5B731] text-slate-950 px-1.5 py-0.2 rounded font-sans">
                            Hoy
                          </span>
                        )}
                        {d.isMonthEnd && (
                          <span className="text-[9px] uppercase tracking-wider bg-blue-900/60 text-blue-300 px-1 py-0.2 rounded font-sans">
                            Fin de mes
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Saldo inicial */}
                    <td className="py-2.5 px-3 sm:px-4 text-right font-mono tabular-nums whitespace-nowrap text-slate-400">
                      {formatSoles(d.initialBalance)}
                    </td>

                    {/* Depósitos */}
                    <td className="py-2.5 px-3 sm:px-4 text-right font-mono tabular-nums whitespace-nowrap font-medium text-emerald-400">
                      {d.deposits > 0 ? `+${formatSoles(d.deposits)}` : 'S/ 0.00'}
                    </td>

                    {/* Retiros */}
                    <td className="py-2.5 px-3 sm:px-4 text-right font-mono tabular-nums whitespace-nowrap font-medium text-rose-400">
                      {d.withdrawals > 0 ? `-${formatSoles(d.withdrawals)}` : 'S/ 0.00'}
                    </td>

                    {/* Saldo de cierre */}
                    <td className="py-2.5 px-3 sm:px-4 text-right font-mono tabular-nums whitespace-nowrap font-black text-white">
                      {formatSoles(d.closingBalance)}
                    </td>

                    {/* Interés diario */}
                    <td className="py-2.5 px-3 sm:px-4 text-right font-mono tabular-nums whitespace-nowrap text-blue-300 font-medium">
                      +{formatInterest(d.dailyInterest)}
                    </td>

                    {/* Interés acumulado */}
                    <td className="py-2.5 px-3 sm:px-4 text-right font-mono tabular-nums whitespace-nowrap font-bold text-[#F5B731]">
                      +{formatInterest(d.accumulatedInterest)}
                    </td>

                    {/* Acción / Click indicator */}
                    <td className="py-2.5 px-2 text-center text-slate-600 group-hover:text-blue-400 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <Edit3 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer info */}
      <div className="p-3 bg-[#080e1e] border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>
          Mostrando {filteredDays.length} días. Base bancaria 360 días para el cálculo de interés diario.
        </span>
        <span className="text-[11px] text-blue-400 font-medium">
          Toca cualquier fila para corregir o agregar movimientos.
        </span>
      </div>
    </div>
  );
};
