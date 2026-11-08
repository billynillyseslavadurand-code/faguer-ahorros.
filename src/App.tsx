/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  SavingsConfig,
  Movement,
  DayRecord,
  getLocalDateString,
  calculateLedger,
  exportToCsv,
  formatSoles,
} from './utils/savingsEngine';
import {
  SavingsAppState,
  loadSavingsState,
  saveSavingsState,
  downloadJsonBackup,
  parseJsonBackup,
  getDefaultState,
} from './utils/savingsStorage';
import { UserProfile, getStoredUser, saveCurrentUser } from './utils/userAuth';
import { Header } from './components/Header';
import { InitialSetupModal } from './components/InitialSetupModal';
import { DailyOperationsCard } from './components/DailyOperationsCard';
import { MovementsList } from './components/MovementsList';
import { ExcelTable } from './components/ExcelTable';
import { DayEditModal } from './components/DayEditModal';
import { HistoryView } from './components/HistoryView';
import { SettingsModal } from './components/SettingsModal';
import { ConfirmModal } from './components/ConfirmModal';
import { AuthModal } from './components/AuthModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(getStoredUser);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [appState, setAppState] = useState<SavingsAppState>(() => {
    const user = getStoredUser();
    return loadSavingsState(user?.uid);
  });

  const [activeTab, setActiveTab] = useState<'principal' | 'historial' | 'configuracion'>('principal');
  const [selectedDayRecord, setSelectedDayRecord] = useState<DayRecord | null>(null);

  // Negative balance withdrawal confirmation state
  const [negativeWithdrawalPrompt, setNegativeWithdrawalPrompt] = useState<{
    amount: number;
    projectedBalance: number;
    note?: string;
  } | null>(null);

  // Save to localStorage whenever state changes, mapped to the active user
  useEffect(() => {
    saveSavingsState(appState, currentUser?.uid);
  }, [appState, currentUser]);

  // Today's date from local device clock
  const todayDate = useMemo(() => getLocalDateString(), []);

  // Compute the entire financial ledger and monthly summaries
  const ledger = useMemo(() => {
    return calculateLedger(appState.config, appState.movements, todayDate);
  }, [appState.config, appState.movements, todayDate]);

  // Today's specific day record
  const todayRecord = useMemo(() => {
    return ledger.daysByDate.get(todayDate);
  }, [ledger, todayDate]);

  // Most recent movement overall (for Undo functionality)
  const lastMovement = useMemo(() => {
    if (appState.movements.length === 0) return undefined;
    return [...appState.movements].sort((a, b) => b.timestamp - a.timestamp)[0];
  }, [appState.movements]);

  // User Profile actions
  const handleLogin = (profile: UserProfile) => {
    setCurrentUser(profile);
    saveCurrentUser(profile);
    // Load this specific user's savings state
    const userState = loadSavingsState(profile.uid);
    setAppState(userState);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveCurrentUser(null);
    const guestState = loadSavingsState(undefined);
    setAppState(guestState);
  };

  // Add a movement
  const handleAddMovement = (
    type: 'deposito' | 'retiro',
    amount: number,
    note?: string,
    targetDate?: string
  ) => {
    const dateToUse = targetDate || todayDate;
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const newMovement: Movement = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: dateToUse,
      timestamp: Date.now(),
      timeFormatted,
      type,
      amount,
      note,
    };

    setAppState((prev) => ({
      ...prev,
      movements: [...prev.movements, newMovement],
    }));
  };

  // Undo last movement
  const handleUndoLastMovement = () => {
    if (!lastMovement) return;
    setAppState((prev) => ({
      ...prev,
      movements: prev.movements.filter((m) => m.id !== lastMovement.id),
    }));
  };

  // Delete a specific movement by ID
  const handleDeleteMovement = (movementId: string) => {
    setAppState((prev) => ({
      ...prev,
      movements: prev.movements.filter((m) => m.id !== movementId),
    }));

    if (selectedDayRecord) {
      setTimeout(() => {
        const updatedLedger = calculateLedger(
          appState.config,
          appState.movements.filter((m) => m.id !== movementId),
          todayDate
        );
        const updatedDay = updatedLedger.daysByDate.get(selectedDayRecord.date);
        if (updatedDay) {
          setSelectedDayRecord(updatedDay);
        }
      }, 0);
    }
  };

  // Onboarding setup completion
  const handleSaveInitialSetup = (newConfig: {
    startDate: string;
    initialBalance: number;
    trea: number;
    capitalizeMonthlyInterest: boolean;
  }) => {
    setAppState({
      isConfigured: true,
      config: {
        startDate: newConfig.startDate,
        initialBalance: newConfig.initialBalance,
        currentTrea: newConfig.trea,
        capitalizeMonthlyInterest: newConfig.capitalizeMonthlyInterest,
        monthlyRecurringDeposit: {
          active: false,
          amount: 0,
          dayOfMonth: 'lastDay',
        },
        rateHistory: [{ effectiveDate: newConfig.startDate, trea: newConfig.trea }],
      },
      movements: [],
    });
  };

  // Add a new TREA rate from effectiveDate
  const handleAddRateChange = (effectiveDate: string, newTrea: number) => {
    setAppState((prev) => {
      const filteredRules = prev.config.rateHistory.filter(
        (r) => r.effectiveDate !== effectiveDate
      );
      const updatedRules = [...filteredRules, { effectiveDate, trea: newTrea }].sort(
        (a, b) => a.effectiveDate.localeCompare(b.effectiveDate)
      );

      return {
        ...prev,
        config: {
          ...prev.config,
          currentTrea: newTrea,
          rateHistory: updatedRules,
        },
      };
    });
  };

  // Update configuration properties
  const handleUpdateConfig = (partial: Partial<SavingsConfig>) => {
    setAppState((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        ...partial,
      },
    }));
  };

  // Backup and restore
  const handleExportBackup = () => {
    downloadJsonBackup(appState, currentUser?.email);
  };

  const handleImportBackup = (jsonStr: string): boolean => {
    const parsed = parseJsonBackup(jsonStr);
    if (parsed) {
      setAppState(parsed);
      return true;
    }
    return false;
  };

  // Reset all data
  const handleResetAllData = () => {
    const def = getDefaultState();
    setAppState(def);
    saveSavingsState(def, currentUser?.uid);
  };

  // Export current month to Excel
  const handleExportCurrentMonth = () => {
    const currentMonthKey = todayDate.substring(0, 7);
    const monthDays = ledger.days.filter((d) => d.date.substring(0, 7) === currentMonthKey);
    const csv = exportToCsv(monthDays.length > 0 ? monthDays : ledger.days);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', `faguer_ahorros_${currentMonthKey}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Keep selectedDayRecord in sync when ledger recalculates
  useEffect(() => {
    if (selectedDayRecord) {
      const freshRecord = ledger.daysByDate.get(selectedDayRecord.date);
      if (freshRecord) {
        setSelectedDayRecord(freshRecord);
      }
    }
  }, [ledger, selectedDayRecord]);

  return (
    <div className="min-h-screen bg-[#080e1e] text-slate-100 flex flex-col font-sans pb-16 md:pb-0">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExportCurrentMonth={handleExportCurrentMonth}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-5">
        {activeTab === 'principal' && (
          <div className="space-y-5">
            {/* Pantalla Principal: Date, Big Balance, Green Deposit, Red Withdrawal, Undo */}
            <DailyOperationsCard
              todayDate={todayDate}
              todayRecord={todayRecord}
              lastMovement={lastMovement}
              onAddMovement={(type, amount, note) => handleAddMovement(type, amount, note)}
              onUndoLastMovement={handleUndoLastMovement}
              onRequestNegativeWithdrawalConfirm={(amount, projectedBalance, note) => {
                setNegativeWithdrawalPrompt({ amount, projectedBalance, note });
              }}
            />

            {/* Movimientos del día */}
            <MovementsList
              selectedDate={todayDate}
              movements={appState.movements}
              onDeleteMovement={handleDeleteMovement}
            />

            {/* Tabla Diaria Excel */}
            <ExcelTable
              days={ledger.days}
              todayDate={todayDate}
              onSelectDay={(day) => setSelectedDayRecord(day)}
            />
          </div>
        )}

        {activeTab === 'historial' && (
          <HistoryView
            monthSummaries={ledger.monthSummaries}
            days={ledger.days}
            todayDate={todayDate}
            onSelectDayForEdit={(day) => setSelectedDayRecord(day)}
          />
        )}

        {activeTab === 'configuracion' && (
          <SettingsModal
            config={appState.config}
            onUpdateConfig={handleUpdateConfig}
            onAddRateChange={handleAddRateChange}
            onExportBackup={handleExportBackup}
            onImportBackup={handleImportBackup}
            onResetAllData={handleResetAllData}
          />
        )}
      </main>

      {/* Desktop Footer */}
      <footer className="bg-[#0b142c] border-t border-blue-900/40 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md overflow-hidden bg-slate-900 border border-blue-500/40 flex items-center justify-center p-0.5">
              <img src="/public/assets/aistudio/logo_c553cfe5.jpg" alt="FAGUER" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-slate-200">FAGUER</span>
            <span>· Control Diario de Ahorros e Intereses en Soles (S/)</span>
          </div>
          <span className="text-[11px] text-blue-300/80">
            Cálculo oficial base 360 días · Funciona sin conexión (PWA)
          </span>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Offline Status Banner */}
      <OfflineIndicator />

      {/* Onboarding Setup Modal */}
      <InitialSetupModal
        isOpen={!appState.isConfigured}
        onSave={handleSaveInitialSetup}
      />

      {/* Day inspection & edit modal */}
      <DayEditModal
        isOpen={Boolean(selectedDayRecord)}
        dayRecord={selectedDayRecord}
        movements={appState.movements}
        onClose={() => setSelectedDayRecord(null)}
        onAddMovementForDate={(date, type, amount, note) => {
          handleAddMovement(type, amount, note, date);
        }}
        onDeleteMovement={handleDeleteMovement}
      />

      {/* User Login & Account Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        currentUser={currentUser}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* Negative withdrawal confirmation modal */}
      <ConfirmModal
        isOpen={Boolean(negativeWithdrawalPrompt)}
        title="¿Confirmar retiro con saldo en negativo?"
        description={
          negativeWithdrawalPrompt
            ? `Estás retirando ${formatSoles(
                negativeWithdrawalPrompt.amount
              )}, pero tu saldo actual dejará la cuenta en ${formatSoles(
                negativeWithdrawalPrompt.projectedBalance
              )}. ¿Deseas continuar de todas formas?`
            : ''
        }
        confirmLabel="Sí, continuar con el retiro"
        cancelLabel="Cancelar retiro"
        isDanger={true}
        onConfirm={() => {
          if (negativeWithdrawalPrompt) {
            handleAddMovement(
              'retiro',
              negativeWithdrawalPrompt.amount,
              negativeWithdrawalPrompt.note
            );
            setNegativeWithdrawalPrompt(null);
          }
        }}
        onCancel={() => setNegativeWithdrawalPrompt(null)}
      />
    </div>
  );
}
