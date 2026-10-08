import React from 'react';
import { useChartOfAccounts } from '../hooks/useChartOfAccounts';
import { COAToolbar } from './coa/COAToolbar';
import { COAFilterSidebar } from './coa/COAFilterSidebar';
import { COATable } from './coa/COATable';
import { COAFormModal } from './coa/COAFormModal';

interface ChartOfAccountsProps {
  onBack: () => void;
}

export const ChartOfAccounts: React.FC<ChartOfAccountsProps> = ({ onBack }) => {
  const {
    accounts,
    processedAccounts,
    showFilter,
    setShowFilter,
    expandedNodes,
    toggleNode,
    selectedId,
    setSelectedId,
    isRefreshing,
    setIsRefreshing,
    searchNo,
    setSearchNo,
    searchName,
    setSearchName,
    suspendedFilter,
    setSuspendedFilter,
    typeFilter,
    setTypeFilter,
    isNewAccountModalOpen,
    setIsNewAccountModalOpen,
    editingAccountId,
    newAccount,
    setNewAccount,
    openNewModal,
    openEditModal,
    handleSaveAccount,
    handleDeleteAccount,
    toggleSuspendStatus
  } = useChartOfAccounts();

  return (
    <div className="w-full h-full flex flex-col bg-white border border-slate-200 rounded-lg font-sans text-sm animate-in fade-in duration-200 overflow-hidden shadow-md print:shadow-none print:border-none print:overflow-visible print:block print:h-auto">
      
      {/* 1. TOP ACTION TOOLBAR */}
      <COAToolbar 
        selectedId={selectedId}
        accounts={accounts}
        showFilter={showFilter}
        setShowFilter={setShowFilter}
        isRefreshing={isRefreshing}
        setIsRefreshing={setIsRefreshing}
        openNewModal={openNewModal}
        openEditModal={openEditModal}
        handleDeleteAccount={handleDeleteAccount}
        toggleSuspendStatus={toggleSuspendStatus}
      />

      {/* 2. SPLIT PANE WORKSPACE */}
      <div className="flex flex-1 overflow-hidden bg-slate-50 print:bg-white print:overflow-visible print:block print:h-auto">
        
        {/* LEFT PANE: Filter Panel */}
        {showFilter && (
          <COAFilterSidebar 
            setShowFilter={setShowFilter}
            searchNo={searchNo}
            setSearchNo={setSearchNo}
            searchName={searchName}
            setSearchName={setSearchName}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            suspendedFilter={suspendedFilter}
            setSuspendedFilter={setSuspendedFilter}
          />
        )}

        {/* RIGHT PANE: Modern Data Grid */}
        <COATable 
          processedAccounts={processedAccounts}
          expandedNodes={expandedNodes}
          selectedId={selectedId}
          toggleNode={toggleNode}
          setSelectedId={setSelectedId}
        />
      </div>

      {/* MODAL AKUN BARU / EDIT */}
      <COAFormModal 
        isNewAccountModalOpen={isNewAccountModalOpen}
        setIsNewAccountModalOpen={setIsNewAccountModalOpen}
        editingAccountId={editingAccountId}
        newAccount={newAccount}
        setNewAccount={setNewAccount}
        accounts={accounts}
        handleSaveAccount={handleSaveAccount}
      />
    </div>
  );
};
