import React, { useState, useEffect } from 'react';
import { JournalList } from './JournalList';
import { JournalVoucherForm } from './JournalVoucherForm';
import { useJournals } from '../context/JournalContext';
import type { JournalVoucherPayload } from '../types/journal';

interface JournalManagerProps {
  initialView?: 'list' | 'form';
  initialMode?: 'create' | 'edit' | 'view';
  initialId?: string | null;
  onBack?: () => void;
  onOpenTab?: (tab: string) => void;
}

export const JournalManager: React.FC<JournalManagerProps> = ({ 
  initialView = 'list', 
  initialMode = 'create', 
  initialId = null,
  onBack, 
  onOpenTab 
}) => {
  const { journals, addJournal, updateJournal, voidJournal, deleteJournal } = useJournals();
  
  const [activeView, setActiveView] = useState<'list' | 'form'>(initialView);
  const [editingId, setEditingId] = useState<string | null>(initialId);
  const [formMode, setFormMode] = useState<'create' | 'edit' | 'view'>(initialMode);

  // Sync with props if they change (e.g. tab reuse)
  useEffect(() => {
    setActiveView(initialView);
    setFormMode(initialMode);
    setEditingId(initialId);
  }, [initialView, initialMode, initialId]);

  const handleCreateNew = () => {
    if (onOpenTab) {
      onOpenTab('Jurnal Baru');
    } else {
      setEditingId(null);
      setFormMode('create');
      setActiveView('form');
    }
  };

  const handleView = (id: string) => {
    if (onOpenTab) {
      onOpenTab(`Daftar Jurnal : ${id} (Lihat)`);
    } else {
      setEditingId(id);
      setFormMode('view');
      setActiveView('form');
    }
  };

  const handleEdit = (id: string) => {
    if (onOpenTab) {
      onOpenTab(`Daftar Jurnal : ${id} (Ubah)`);
    } else {
      setEditingId(id);
      setFormMode('edit');
      setActiveView('form');
    }
  };

  const handleDuplicate = (id: string) => {
    const source = journals.find(j => j.voucher_no === id);
    if (!source) return;
    
    const newVoucherNo = `JV-202606-000${journals.length + 1}`;
    const duplicate: JournalVoucherPayload = {
      ...source,
      voucher_no: newVoucherNo,
      transaction_date: new Date().toISOString().split('T')[0],
      status: 'DRAFT',
      description: `[Copy] ${source.description}`
    };
    
    // Standar Odoo: Tidak langsung save ke DB, melainkan lempar ke Form untuk direview
    if (onOpenTab) {
      localStorage.setItem(`copyData_${newVoucherNo}`, JSON.stringify(duplicate));
      onOpenTab(`Daftar Jurnal : ${newVoucherNo} (Salin)`);
    } else {
      localStorage.setItem(`copyData_${newVoucherNo}`, JSON.stringify(duplicate));
      setEditingId(newVoucherNo);
      setFormMode('create');
      setActiveView('form');
    }
  };

  const handleVoid = (id: string) => {
    voidJournal(id);
  };

  const handleDelete = (id: string) => {
    deleteJournal(id);
  };

  const handleSave = (payload: JournalVoucherPayload, postImmediately: boolean) => {
    payload.status = postImmediately ? 'POSTED' : 'DRAFT';
    
    if (formMode === 'create') {
      addJournal(payload);
    } else {
      updateJournal(payload);
    }
    
    // Jika komponen ini dijalankan sebagai Tab "Jurnal Baru", onBack akan menutup tab
    if (onBack && initialView === 'form') {
      onBack();
      // Buka tab daftar jurnal agar user bisa lihat hasilnya
      if (onOpenTab) onOpenTab('Daftar Jurnal');
    } else {
      setActiveView('list');
    }
  };

  if (activeView === 'list') {
    return (
      <JournalList 
        journals={journals}
        onCreateNew={handleCreateNew}
        onView={handleView}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onVoid={handleVoid}
        onDelete={handleDelete}
      />
    );
  }

  let selectedJournal = undefined;
  
  if (editingId) {
    if (formMode === 'create') {
       // Cek apakah ini hasil Copy (Salin Transaksi)
       const copyData = localStorage.getItem(`copyData_${editingId}`);
       if (copyData) {
         selectedJournal = JSON.parse(copyData);
         localStorage.removeItem(`copyData_${editingId}`); // Clear after use
       }
    } else {
       selectedJournal = journals.find(j => j.voucher_no === editingId);
    }
  }

  return (
    <JournalVoucherForm 
      initialData={selectedJournal}
      mode={formMode}
      onBack={() => {
        if (initialView === 'form' && onBack) {
          onBack(); // Tutup tab jika ini memang tab form
        } else {
          setActiveView('list'); // Kembali ke list jika dalam tab manager
        }
      }}
      onOpenTab={onOpenTab}
      onSave={(data) => handleSave(data, false)}
      onPost={(data) => handleSave(data, true)}
    />
  );
};
