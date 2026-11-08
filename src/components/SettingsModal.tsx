/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  SavingsConfig,
  calculateTred,
  formatTredPercentage,
  getLocalDateString,
} from '../utils/savingsEngine';
import {
  Sliders,
  Percent,
  Download,
  Upload,
  RotateCcw,
  Check,
  AlertTriangle,
  Info,
  Calendar,
  Smartphone,
  CalendarClock,
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';
import { PWAInstallButton } from './PWAInstallButton';

interface SettingsModalProps {
  config: SavingsConfig;
  onUpdateConfig: (updated: Partial<SavingsConfig>) => void;
  onAddRateChange: (effectiveDate: string, newTrea: number) => void;
  onExportBackup: () => void;
  onImportBackup: (jsonStr: string) => boolean;
  onResetAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  config,
  onUpdateConfig,
  onAddRateChange,
  onExportBackup,
  onImportBackup,
  onResetAllData,
}) => {
  const today = getLocalDateString();
  const [newTreaInput, setNewTreaInput] = useState(config.currentTrea.toString());
  const [effectiveDate, setEffectiveDate] = useState(today);
  const [monthlyDepositAmount, setMonthlyDepositAmount] = useState(
    config.monthlyRecurringDeposit ? config.monthlyRecurringDeposit.amount.toString() : '0'
  );
  const [monthlyDepositActive, setMonthlyDepositActive] = useState(
    Boolean(config.monthlyRecurringDeposit?.active)
  );
  const [rateSuccessMessage, setRateSuccessMessage] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const parsedTrea = parseFloat(newTreaInput) || 0;
  const computedTred = calculateTred(parsedTrea);

  const handleApplyRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedTrea < 0) return;
    onAddRateChange(effectiveDate, parsedTrea);
    setRateSuccessMessage(
      `Tasa actualizada a ${parsedTrea}% aplicada desde ${effectiveDate}. Los días anteriores conservan su tasa histórica.`
    );
    setTimeout(() => setRateSuccessMessage(null), 5000);
  };

  const handleCapitalizeToggle = (checked: boolean) => {
    onUpdateConfig({ capitalizeMonthlyInterest: checked });
  };

  const handleMonthlyDepositSave = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(monthlyDepositAmount) || 0;
    onUpdateConfig({
      monthlyRecurringDeposit: {
        active: monthlyDepositActive,
        amount: amount,
        dayOfMonth: 'lastDay',
      },
    });
    setRateSuccessMessage('Configuración de depósito mensual guardada con éxito.');
    setTimeout(() => setRateSuccessMessage(null), 4000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = onImportBackup(content);
      if (success) {
        setImportSuccess('¡Datos restaurados con éxito desde la copia de seguridad!');
      } else {
        setImportError('El archivo no tiene un formato válido de copia de seguridad.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Title Card */}
      <div className="bg-[#0e172e] rounded-2xl border border-blue-900/30 p-5 sm:p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-blue-500/40 p-0.5">
            <img
              src="/public/assets/aistudio/logo_c553cfe5.jpg"
              alt="FAGUER"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Configuración de Tasas y Cuenta</h2>
            <p className="text-xs text-blue-300/80 mt-0.5">
              Control financiero FAGUER · TREA, TRED automática, capitalización y PWA.
            </p>
          </div>
        </div>
      </div>

      {/* 1. Rates Management Card */}
      <div className="bg-[#0e172e] rounded-2xl border border-blue-900/30 p-5 sm:p-6 shadow-xl space-y-5">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Percent className="w-4 h-4 text-blue-400" />
            <span>Tasa de Rendimiento Efectiva Anual (TREA)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ingresa la tasa anual de tu banco. La tasa diaria (TRED) se calculará sola con la fórmula oficial en base 360 días.
          </p>
        </div>

        {rateSuccessMessage && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{rateSuccessMessage}</span>
          </div>
        )}

        <form onSubmit={handleApplyRate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                TREA (o TEA) del banco
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newTreaInput}
                  onChange={(e) => setNewTreaInput(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#080e1e] border border-blue-900/40 rounded-xl font-mono text-base font-bold text-white focus:outline-none focus:border-blue-400"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-sm text-slate-500">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                TRED calculada (Automática)
              </label>
              <div className="px-3 py-2.5 bg-[#080e1e] border border-blue-900/40 rounded-xl font-mono text-base font-bold text-blue-400 flex items-center justify-between">
                <span>{formatTredPercentage(computedTred)}</span>
                <span className="text-[10px] text-slate-500 uppercase font-sans font-semibold">
                  No editable
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Vigente desde
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#080e1e] border border-blue-900/40 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-blue-400"
                required
              />
            </div>
          </div>

          <div className="p-3 bg-[#080e1e] rounded-xl text-xs text-slate-300 flex items-start gap-2.5 border border-blue-900/30">
            <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">Fórmula bancaria oficial (base 360 días):</span>
              <code className="text-[#F5B731] font-mono text-[11px] block mt-0.5">
                TRED = (1 + TREA)^(1/360) − 1
              </code>
              <span className="text-slate-400 text-[11px] block mt-0.5">
                Ejemplo: Con TREA 4.5% → TRED es 0.01223%. Para un saldo de S/ 60 el interés diario es S/ 0.00734.
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-md shadow-blue-950/40"
            >
              Aplicar y Guardar Tasa
            </button>
          </div>
        </form>

        {config.rateHistory && config.rateHistory.length > 0 && (
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Historial de tasas registradas
            </h4>
            <div className="space-y-1.5 text-xs">
              {config.rateHistory.map((r, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-[#080e1e] rounded-xl text-slate-300 border border-blue-900/20"
                >
                  <span className="font-mono text-slate-400">{r.effectiveDate}</span>
                  <span className="font-semibold text-white">TREA {r.trea.toFixed(2)}%</span>
                  <span className="font-mono text-blue-400">
                    TRED {formatTredPercentage(calculateTred(r.trea))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Capitalization of Interest Switch */}
      <div className="bg-[#0e172e] rounded-2xl border border-blue-900/30 p-5 sm:p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-1">
          Capitalización Mensual de Intereses
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Define si los intereses generados se incorporan al capital el último día de cada mes.
        </p>

        <label className="flex items-start gap-4 p-4 bg-[#080e1e] rounded-xl border border-blue-900/30 cursor-pointer hover:border-blue-700/50 transition-colors">
          <input
            type="checkbox"
            checked={config.capitalizeMonthlyInterest}
            onChange={(e) => handleCapitalizeToggle(e.target.checked)}
            className="mt-1 h-5 w-5 text-blue-600 rounded border-slate-700 bg-slate-900 focus:ring-blue-500 cursor-pointer"
          />
          <div>
            <span className="font-semibold text-white text-sm block">
              Capitalizar el interés al cierre de mes (el último día del mes)
            </span>
            <span className="text-xs text-slate-400 block mt-1 leading-relaxed">
              <strong className="text-slate-300">Desactivado por defecto:</strong> El interés se acumula y se visualiza sin sumarse al saldo diario (igual a tu Excel).
              <br />
              <strong className="text-blue-300">Si lo activas:</strong> El último día del mes (ej. 30 o 31), el interés total generado se acredita como abono de intereses en ese mismo día de cierre, para que el mes siguiente empiece con dicho saldo acumulado.
            </span>
          </div>
        </label>
      </div>

      {/* 3. Depósito mensual programado (el último día del mes) */}
      <div className="bg-[#0e172e] rounded-2xl border border-blue-900/30 p-5 sm:p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <CalendarClock className="w-4 h-4 text-[#F5B731]" />
          <span>Depósito Mensual Programado</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Como solicitaste, el depósito mensual se aplica de forma automática el <strong>último día del mes</strong> (no el día 1).
        </p>

        <form onSubmit={handleMonthlyDepositSave} className="space-y-4 bg-[#080e1e] p-4 rounded-xl border border-blue-900/30">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={monthlyDepositActive}
              onChange={(e) => setMonthlyDepositActive(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded border-slate-700 bg-slate-900 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-xs font-semibold text-white">
              Activar depósito mensual recurrente automático
            </span>
          </label>

          {monthlyDepositActive && (
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Monto mensual a depositar (S/)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-sm text-slate-400">
                    S/
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={monthlyDepositAmount}
                    onChange={(e) => setMonthlyDepositAmount(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white focus:outline-none focus:border-blue-400"
                    placeholder="500.00"
                  />
                </div>
              </div>

              <div className="pt-4 sm:pt-5">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  Guardar Depósito Mensual
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* 4. PWA Installation Section */}
      <div className="bg-[#0e172e] rounded-2xl border border-blue-900/30 p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-400" />
            <span>Instalar FAGUER como Aplicación (PWA)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Instálala en tu celular o computadora para abrirla al instante, usarla sin internet y sin barra de navegador.
          </p>
        </div>
        <div className="shrink-0">
          <PWAInstallButton />
        </div>
      </div>

      {/* 5. Backup and Restore (JSON) */}
      <div className="bg-[#0e172e] rounded-2xl border border-blue-900/30 p-5 sm:p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-base font-bold text-white">
            Respaldo y Restauración de Datos
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Guarda todos tus movimientos y configuraciones en un archivo para no perderlos si cambias de celular o navegador.
          </p>
        </div>

        {importSuccess && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{importSuccess}</span>
          </div>
        )}

        {importError && (
          <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{importError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 border border-blue-900/30 rounded-xl bg-[#080e1e] flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white">Crear Copia de Seguridad</h4>
              <p className="text-xs text-slate-400 mt-1">
                Descarga un archivo .json con todos los movimientos e intereses calculados.
              </p>
            </div>
            <button
              type="button"
              onClick={onExportBackup}
              className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl text-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar copia de seguridad (JSON)</span>
            </button>
          </div>

          <div className="p-4 border border-blue-900/30 rounded-xl bg-[#080e1e] flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white">Restaurar Copia</h4>
              <p className="text-xs text-slate-400 mt-1">
                Sube un archivo .json previamente descargado para restaurar tu cuenta.
              </p>
            </div>
            <label className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-200 font-medium rounded-xl text-xs transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Seleccionar archivo JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* 6. Danger Zone */}
      <div className="bg-[#0e172e] rounded-2xl border border-rose-900/30 p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-rose-400">Reiniciar cuenta</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Borra todos los movimientos registrados y vuelve al asistente de configuración inicial.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsResetConfirmOpen(true)}
          className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/40 text-rose-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer shrink-0"
        >
          Reiniciar todos los datos
        </button>
      </div>

      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="¿Estás seguro de reiniciar todo?"
        description="Esta acción eliminará todos los registros de depósitos, retiros e intereses de la cuenta. Te recomendamos descargar una copia de seguridad antes de continuar."
        confirmLabel="Sí, reiniciar todo"
        cancelLabel="Cancelar"
        isDanger={true}
        onConfirm={() => {
          setIsResetConfirmOpen(false);
          onResetAllData();
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
