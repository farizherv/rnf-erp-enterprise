import { useState, useEffect } from 'react';
import type { ReportParameters, DatePreset, SavedFilterProfile } from '../types/reportParameters';

export const useReportParameters = () => {
  const [params, setParams] = useState<ReportParameters>({
    branches: ['ALL'],
    datePreset: 'THIS_MONTH',
    periodFrom: '',
    periodTo: '',
    comparePeriodFrom: '',
    comparePeriodTo: '',
    compareTo: 'NONE',
    ledger: '0L',
    scenario: 'ACT',
    costCenters: ['ALL'],
    businessArea: 'ALL',
    currency: 'IDR',
    includeUnposted: false,
    hideZeroBalance: true,
  });

  const defaultProfiles: SavedFilterProfile[] = [
    {
      id: 'prof-1',
      name: 'Default Audit View (All Branches)',
      params: {
        branches: ['ALL'],
        datePreset: 'THIS_YEAR',
        periodFrom: '2026-01-01',
        periodTo: '2026-12-31',
        compareTo: 'PREV_YEAR',
        ledger: '0L',
        scenario: 'ACT',
        costCenters: ['ALL'],
        businessArea: 'ALL',
        currency: 'IDR',
        includeUnposted: false,
        hideZeroBalance: true,
      }
    }
  ];

  const [savedProfiles, setSavedProfiles] = useState<SavedFilterProfile[]>(() => {
    const saved = localStorage.getItem('erp_saved_variants');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultProfiles;
      }
    }
    return defaultProfiles;
  });

  // Save to localStorage whenever profiles change
  useEffect(() => {
    localStorage.setItem('erp_saved_variants', JSON.stringify(savedProfiles));
  }, [savedProfiles]);

  // Helper to calculate dates based on preset
  useEffect(() => {
    if (params.datePreset === 'CUSTOM') return;

    const today = new Date('2026-06-17'); // Using mock current date for demo
    let from = new Date(today);
    let to = new Date(today);

    switch (params.datePreset) {
      case 'TODAY':
        break;
      case 'THIS_WEEK':
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
        from = new Date(today.setDate(diff));
        to = new Date(from);
        to.setDate(to.getDate() + 6);
        break;
      case 'THIS_MONTH':
        from = new Date(today.getFullYear(), today.getMonth(), 1);
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'LAST_MONTH':
        from = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        to = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'THIS_QUARTER':
        const q = Math.floor(today.getMonth() / 3);
        from = new Date(today.getFullYear(), q * 3, 1);
        to = new Date(today.getFullYear(), q * 3 + 3, 0);
        break;
      case 'LAST_QUARTER':
        const lq = Math.floor(today.getMonth() / 3) - 1;
        from = new Date(today.getFullYear(), lq * 3, 1);
        to = new Date(today.getFullYear(), lq * 3 + 3, 0);
        break;
      case 'YTD':
      case 'THIS_YEAR':
        from = new Date(today.getFullYear(), 0, 1);
        to = new Date(today.getFullYear(), 11, 31);
        if (params.datePreset === 'YTD') to = new Date('2026-06-17'); // up to today
        break;
    }

    // Format to YYYY-MM-DD
    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    
    setParams(prev => ({
      ...prev,
      periodFrom: formatDate(from),
      periodTo: formatDate(to)
    }));
  }, [params.datePreset]);

  const loadProfile = (profileId: string) => {
    const profile = savedProfiles.find(p => p.id === profileId);
    if (profile) {
      setParams(profile.params);
    }
  };

  const saveCurrentAsProfile = (name: string) => {
    const newProfile: SavedFilterProfile = {
      id: `prof-${Date.now()}`,
      name,
      params: { ...params }
    };
    setSavedProfiles([...savedProfiles, newProfile]);
  };

  return {
    params,
    setParams,
    savedProfiles,
    loadProfile,
    saveCurrentAsProfile
  };
};
