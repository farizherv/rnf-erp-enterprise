import { useState, useMemo } from 'react';
import type { Account } from '../types/coa';
import { INITIAL_DUMMY_ACCOUNTS } from '../data/coaInitialData';

export const useChartOfAccounts = () => {
  // --- Data State ---
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_DUMMY_ACCOUNTS);
  
  // --- UI Layout State ---
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    INITIAL_DUMMY_ACCOUNTS.forEach(acc => {
      if (acc.isHeader) initial[acc.id] = true;
    });
    return initial;
  });
  const [showFilter, setShowFilter] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  // --- Filter States ---
  const [searchNo, setSearchNo] = useState('');
  const [searchName, setSearchName] = useState('');
  const [suspendedFilter, setSuspendedFilter] = useState<'All' | 'Yes' | 'No'>('All');
  const [typeFilter, setTypeFilter] = useState<string>('Semua Tipe');

  // --- Modal States ---
  const [isNewAccountModalOpen, setIsNewAccountModalOpen] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [newAccount, setNewAccount] = useState({
    code: '',
    name: '',
    isHeader: false,
    type: 'Kas/Bank',
    currency: 'IDR',
    parentId: ''
  });

  // --- Data Processing (Tree, Balance Roll-up, Filtering) ---
  const processedAccounts = useMemo(() => {
    let calcAccounts = JSON.parse(JSON.stringify(accounts)) as Account[];
    
    // 1. Recursive Depth Calculation
    const getDepth = (parentId?: string): number => {
      if (!parentId) return 0;
      const parent = calcAccounts.find(a => a.id === parentId);
      if (!parent) return 0;
      return getDepth(parent.parentId) + 1;
    };
    calcAccounts.forEach(acc => { acc.depth = getDepth(acc.parentId); });

    // 2. Recursive Balance Roll-up for Headers
    const getBalance = (acc: Account): number => {
      if (!acc.isHeader) return acc.balance;
      const children = calcAccounts.filter(a => a.parentId === acc.id);
      return children.reduce((sum, child) => sum + getBalance(child), 0);
    };
    calcAccounts.forEach(acc => {
      if (acc.isHeader) acc.balance = getBalance(acc);
    });

    // 3. Filtering
    let filtered = calcAccounts.filter(acc => {
      if (searchNo && !acc.code.toLowerCase().includes(searchNo.toLowerCase())) return false;
      if (searchName && !acc.name.toLowerCase().includes(searchName.toLowerCase())) return false;
      if (suspendedFilter === 'Yes' && !acc.suspended) return false;
      if (suspendedFilter === 'No' && acc.suspended) return false;
      if (!acc.isHeader && typeFilter !== 'Semua Tipe') {
        if (!acc.type.includes(typeFilter) && !searchNo && !searchName) return false; 
      }
      return true;
    });
      
    // Auto-include parents of matching children
    const toInclude = new Set<string>();
    filtered.forEach(f => {
      toInclude.add(f.id);
      let curr = f;
      while (curr.parentId) {
        toInclude.add(curr.parentId);
        const parent = calcAccounts.find(a => a.id === curr.parentId);
        if (!parent) break;
        curr = parent;
      }
    });
    filtered = calcAccounts.filter(a => toInclude.has(a.id));
    
    // Auto-expand parents during active search
    if (searchNo || searchName) {
      const newExpanded: Record<string, boolean> = {};
      filtered.forEach(a => { if (a.isHeader) newExpanded[a.id] = true; });
      // We don't call setExpandedNodes here to avoid render loops, 
      // but ideally we return a dynamic 'forceExpanded' map.
      // For now, the existing logic relied on returning filtered.
    }

    return filtered.sort((a, b) => a.code.localeCompare(b.code));
  }, [accounts, searchNo, searchName, suspendedFilter, typeFilter]);

  // --- Actions ---
  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openEditModal = (id: string) => {
    const acc = accounts.find(a => a.id === id);
    if (!acc) return;
    setEditingAccountId(id);
    setNewAccount({
      code: acc.code,
      name: acc.name,
      isHeader: acc.isHeader,
      type: acc.type,
      currency: acc.currency,
      parentId: acc.parentId || ''
    });
    setIsNewAccountModalOpen(true);
    setActiveDropdownId(null);
  };

  const openNewModal = () => {
    setEditingAccountId(null);
    setNewAccount({ code: '', name: '', isHeader: false, type: 'Kas/Bank', currency: 'IDR', parentId: '' });
    setIsNewAccountModalOpen(true);
  };

  const handleDeleteAccount = (id: string) => {
    const acc = accounts.find(a => a.id === id);
    if (!acc) return;

    const hasChildren = accounts.some(a => a.parentId === id);
    if (hasChildren) {
      alert(`[Akses Ditolak]\nAnda tidak dapat menghapus Akun Induk "${acc.name}" karena masih memiliki Sub-Akun (Anak) di bawahnya.\n\nPindahkan atau hapus semua Sub-Akun terlebih dahulu.`);
      return;
    }

    if (window.confirm(`PERINGATAN!\n\nApakah Anda yakin ingin menghapus permanen akun [${acc.code}] ${acc.name}?\nTindakan ini tidak dapat dibatalkan.`)) {
      setAccounts(accounts.filter(a => a.id !== id));
      setActiveDropdownId(null);
    }
  };

  const handleSaveAccount = () => {
    if (!newAccount.code || !newAccount.name) {
      alert("Kode dan Nama Akun wajib diisi!");
      return;
    }
    
    if (accounts.some(a => a.code === newAccount.code && a.id !== editingAccountId)) {
      alert(`Kode Akun ${newAccount.code} sudah digunakan!`);
      return;
    }

    let updatedAccounts = [...accounts];

    if (editingAccountId) {
      updatedAccounts = updatedAccounts.map(acc => 
        acc.id === editingAccountId ? {
          ...acc,
          code: newAccount.code,
          name: newAccount.name,
          type: newAccount.isHeader ? 'Header' : newAccount.type,
          currency: newAccount.currency,
          isHeader: newAccount.isHeader,
          parentId: newAccount.parentId || undefined
        } : acc
      );
    } else {
      const newEntry: Account = {
        id: Date.now().toString(),
        code: newAccount.code,
        name: newAccount.name,
        type: newAccount.isHeader ? 'Header' : newAccount.type,
        currency: newAccount.currency,
        balance: 0,
        isHeader: newAccount.isHeader,
        parentId: newAccount.parentId || undefined
      };
      updatedAccounts.push(newEntry);
    }

    updatedAccounts.sort((a, b) => a.code.localeCompare(b.code));
    setAccounts(updatedAccounts);
    
    if (newAccount.parentId) {
      setExpandedNodes(prev => ({ ...prev, [newAccount.parentId]: true }));
    }

    alert(editingAccountId ? `Perubahan berhasil disimpan!` : `Sukses: Akun berhasil dibuat!`);
    setIsNewAccountModalOpen(false);
    setEditingAccountId(null);
    setNewAccount({ code: '', name: '', isHeader: false, type: 'Kas/Bank', currency: 'IDR', parentId: '' });
  };

  const toggleSuspendStatus = (id: string) => {
    const acc = accounts.find(a => a.id === id);
    if (!acc) return;
    if (acc.isHeader) {
      alert("Akun Header tidak dapat ditangguhkan. Tangguhkan sub-akunnya secara individual.");
      return;
    }
    const msg = acc.suspended 
      ? `Apakah Anda ingin mengaktifkan kembali akun ${acc.name}?`
      : `Apakah Anda ingin menangguhkan akun ${acc.name}? Akun ini tidak akan bisa digunakan di transaksi baru.`;
    
    if (window.confirm(msg)) {
      setAccounts(accounts.map(a => a.id === id ? { ...a, suspended: !a.suspended } : a));
      setActiveDropdownId(null);
    }
  };

  return {
    // Data
    accounts,
    processedAccounts,
    
    // UI State
    showFilter,
    setShowFilter,
    expandedNodes,
    toggleNode,
    selectedId,
    setSelectedId,
    isRefreshing,
    setIsRefreshing,
    activeDropdownId,
    setActiveDropdownId,
    
    // Filter State
    searchNo,
    setSearchNo,
    searchName,
    setSearchName,
    suspendedFilter,
    setSuspendedFilter,
    typeFilter,
    setTypeFilter,
    
    // Modal State
    isNewAccountModalOpen,
    setIsNewAccountModalOpen,
    editingAccountId,
    newAccount,
    setNewAccount,
    
    // Actions
    openNewModal,
    openEditModal,
    handleSaveAccount,
    handleDeleteAccount,
    toggleSuspendStatus
  };
};
