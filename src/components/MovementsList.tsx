/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Movement, formatSoles, formatDateSpanish } from '../utils/savingsEngine';
import { X, ArrowDownRight, ArrowUpRight, Clock, Trash2 } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface MovementsListProps {
  selectedDate: string;
  movements: Movement[];
  onDeleteMovement: (movementId: string) => void;
}

export const MovementsList: React.FC<MovementsListProps> = ({
  selectedDate,
  movements,
  onDeleteMovement,
}) => {
  const [movementToDelete, setMovementToDelete] = useState<Movement | null>(null);

  const dayMovements = movements
    .filter((m) => m.date === selectedDate)
    .sort((a, b) => b.timestamp - a.timestamp);

  const confirmDelete = () => {
    if (movementToDelete) {
      onDeleteMovement(movementToDelete.id);
      setMovementToDelete(null);
    }
  };

  return (
    <div className="bg-[#0e172e] rounded-2xl border border-blue-900/30 shadow-xl p-5 sm:p-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white">
            Movimientos registrados del día
          </h3>
          <p className="text-xs text-blue-300/80 mt-0.5">
            {formatDateSpanish(selectedDate, true)} · {dayMovements.length} operaciones
          </p>
        </div>
      </div>

      {dayMovements.length === 0 ? (
        <div className="py-8 text-center text-slate-500">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-40 text-blue-400" />
          <p className="text-sm font-semibold text-slate-300">
            No hay movimientos registrados para este día
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Los depósitos y retiros que ingreses arriba se listarán aquí en orden cronológico.
          </p>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-slate-800/80">
          {dayMovements.map((m) => (
            <div
              key={m.id}
              className="py-3 flex items-center justify-between gap-4 hover:bg-slate-800/40 px-2 rounded-xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    m.type === 'deposito'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {m.type === 'deposito' ? (
                    <ArrowDownRight className="w-4 h-4" />
                  ) : (
                    <ArrowUpRight className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white capitalize">
                      {m.type === 'deposito' ? 'Depósito' : 'Retiro'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {m.timeFormatted}
                    </span>
                  </div>
                  {m.note && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs sm:max-w-md">
                      {m.note}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-sm sm:text-base font-black font-mono tabular-nums ${
                    m.type === 'deposito' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {m.type === 'deposito' ? '+' : '-'}
                  {formatSoles(m.amount)}
                </span>

                <button
                  type="button"
                  onClick={() => setMovementToDelete(m)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Eliminar este movimiento"
                  aria-label={`Eliminar movimiento de ${m.type} de ${formatSoles(m.amount)}`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(movementToDelete)}
        title="¿Eliminar este movimiento?"
        description={
          movementToDelete
            ? `Se eliminará el ${movementToDelete.type} de ${formatSoles(
                movementToDelete.amount
              )} registrado a las ${movementToDelete.timeFormatted}. Todo el saldo e intereses diarios posteriores se recalcularán automáticamente.`
            : ''
        }
        confirmLabel="Sí, eliminar"
        cancelLabel="Cancelar"
        isDanger={true}
        onConfirm={confirmDelete}
        onCancel={() => setMovementToDelete(null)}
      />
    </div>
  );
};
