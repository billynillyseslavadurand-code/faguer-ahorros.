/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  DayRecord,
  Movement,
  formatSoles,
  formatInterest,
  formatDateSpanish,
} from '../utils/savingsEngine';
import { X, Plus, Trash2, ArrowDownRight, ArrowUpRight, AlertCircle } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface DayEditModalProps {
  isOpen: boolean;
  dayRecord: DayRecord | null;
  movements: Movement[];
  onClose: () => void;
  onAddMovementForDate: (
    date: string,
    type: 'deposito' | 'retiro',
    amount: number,
    note?: string
  ) => void;
  onDeleteMovement: (movementId: string) => void;
}

export const DayEditModal: React.FC<DayEditModalProps> = ({
  isOpen,
  dayRecord,
  movements,
  onClose,
  onAddMovementForDate,
  onDeleteMovement,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [type, setType] = useState<'deposito' | 'retiro'>('deposito');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [movementToDelete, setMovementToDelete] = useState<Movement | null>(null);

  if (!isOpen || !dayRecord) return null;

  const dayMovements = movements.filter((m) => m.date === dayRecord.date);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Ingresa un monto válido mayor a 0');
      return;
    }
    onAddMovementForDate(dayRecord.date, type, num, note.trim() || undefined);
    setAmount('');
    setNote('');
    setIsAdding(false);
    setError(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="day-edit-title"
    >
      <div className="bg-[#0e172e] rounded-3xl shadow-2xl border border-blue-900/40 max-w-xl w-full p-6 sm:p-7 my-8 text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
              Detalle y edición de fecha
            </span>
            <h2 id="day-edit-title" className="text-lg sm:text-xl font-bold text-white mt-0.5">
              {formatDateSpanish(dayRecord.date, true)}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice of cascading recalculation */}
        <div className="mt-4 p-3 bg-blue-950/40 border border-blue-800/40 rounded-xl flex items-start gap-2.5 text-xs text-blue-300">
          <AlertCircle className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
          <span>
            Cualquier cambio en este día recalcula en cadena todos los días posteriores,
            actualizando automáticamente saldos e intereses acumulados.
          </span>
        </div>

        {/* Day Summary Grid */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-[#080e1e] rounded-xl text-center border border-blue-900/30">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Saldo inicial</span>
            <span className="text-xs sm:text-sm font-bold font-mono tabular-nums text-slate-200">
              {formatSoles(dayRecord.initialBalance)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-400 block font-medium">Depósitos</span>
            <span className="text-xs sm:text-sm font-bold font-mono tabular-nums text-emerald-400">
              +{formatSoles(dayRecord.deposits)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-rose-400 block font-medium">Retiros</span>
            <span className="text-xs sm:text-sm font-bold font-mono tabular-nums text-rose-400">
              -{formatSoles(dayRecord.withdrawals)}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-white block font-medium">Saldo cierre</span>
            <span className="text-xs sm:text-sm font-black font-mono tabular-nums text-white">
              {formatSoles(dayRecord.closingBalance)}
            </span>
          </div>
          <div className="col-span-2 pt-2 border-t border-slate-800 text-left sm:text-center">
            <span className="text-[10px] text-slate-400 block">Interés diario</span>
            <span className="text-xs font-semibold font-mono tabular-nums text-blue-300">
              +{formatInterest(dayRecord.dailyInterest)} (TRED {(dayRecord.tred * 100).toFixed(5)}%)
            </span>
          </div>
          <div className="col-span-2 pt-2 border-t border-slate-800 text-left sm:text-center">
            <span className="text-[10px] text-slate-400 block">Interés acumulado mes</span>
            <span className="text-xs font-bold font-mono tabular-nums text-[#F5B731]">
              +{formatInterest(dayRecord.accumulatedInterest)}
            </span>
          </div>
        </div>

        {/* List of movements for this specific day */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Operaciones de esta fecha ({dayMovements.length})
            </h3>
            {!isAdding && (
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-blue-300 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar operación</span>
              </button>
            )}
          </div>

          {/* Add form */}
          {isAdding && (
            <form
              onSubmit={handleAddSubmit}
              className="p-4 mb-4 bg-[#080e1e] border border-blue-900/40 rounded-2xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Nueva operación en este día</span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
              </div>

              {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType('deposito')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl cursor-pointer transition-colors ${
                    type === 'deposito'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 border border-slate-700'
                  }`}
                >
                  + Depósito
                </button>
                <button
                  type="button"
                  onClick={() => setType('retiro')}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl cursor-pointer transition-colors ${
                    type === 'retiro'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 border border-slate-700'
                  }`}
                >
                  - Retiro
                </button>
              </div>

              <div>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Monto en Soles (S/)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-900 border border-slate-700 rounded-xl text-white font-mono tabular-nums focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Nota o descripción (opcional)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs cursor-pointer shadow-md"
              >
                Guardar y Recalcular
              </button>
            </form>
          )}

          {dayMovements.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-3 text-center">
              No hubo depósitos ni retiros registrados en esta fecha.
            </p>
          ) : (
            <div className="divide-y divide-slate-800/80 max-h-52 overflow-y-auto">
              {dayMovements.map((m) => (
                <div
                  key={m.id}
                  className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-800/40 px-2 rounded-xl"
                >
                  <div className="flex items-center gap-2">
                    {m.type === 'deposito' ? (
                      <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-rose-400" />
                    )}
                    <div>
                      <span className="font-semibold text-white capitalize">
                        {m.type === 'deposito' ? 'Depósito' : 'Retiro'}
                      </span>
                      {m.note && <span className="text-slate-400 ml-1.5">({m.note})</span>}
                      <span className="text-slate-500 font-mono ml-2">{m.timeFormatted}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono font-bold ${
                        m.type === 'deposito' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {m.type === 'deposito' ? '+' : '-'}
                      {formatSoles(m.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => setMovementToDelete(m)}
                      className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar movimiento"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={Boolean(movementToDelete)}
        title="¿Eliminar este movimiento histórico?"
        description={
          movementToDelete
            ? `Se eliminará el ${movementToDelete.type} de ${formatSoles(
                movementToDelete.amount
              )}. Todos los saldos e intereses posteriores se recalcularán automáticamente en cadena.`
            : ''
        }
        confirmLabel="Sí, eliminar y recalcular"
        cancelLabel="Cancelar"
        isDanger={true}
        onConfirm={() => {
          if (movementToDelete) {
            onDeleteMovement(movementToDelete.id);
            setMovementToDelete(null);
          }
        }}
        onCancel={() => setMovementToDelete(null)}
      />
    </div>
  );
};
