import React, { useState } from 'react';
import { Users, Search, Plus, Edit, Trash2, ArrowUpDown, Shield, X, AlertCircle } from 'lucide-react';
import { useAuth, type AuthUser, type UserRole } from '../../../shared/context/AuthContext';

export const UserManagementView: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, user: currentUser } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [itemsPerPage, setItemsPerPage] = useState('10');
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AuthUser | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    role: 'ADMINISTRATOR' as UserRole,
    password: ''
  });
  const [formError, setFormError] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ name: '', username: '', role: 'ADMINISTRATOR', password: '' });
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditModal = (u: AuthUser) => {
    setEditingUser(u);
    setFormData({ name: u.name, username: u.username, role: u.role, password: '' });
    setFormError('');
    setIsFormOpen(true);
  };

  const openDeleteModal = (u: AuthUser) => {
    setUserToDelete(u);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.username.trim()) {
      setFormError('Nama dan Username wajib diisi.');
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      setFormError('Password wajib diisi untuk user baru.');
      return;
    }

    // Check username uniqueness
    const isDuplicate = users.some(u => 
      u.username.toLowerCase() === formData.username.toLowerCase() && 
      u.id !== editingUser?.id
    );

    if (isDuplicate) {
      setFormError('Username sudah digunakan.');
      return;
    }

    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData);
      } else {
        await addUser(formData);
      }
      setIsFormOpen(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Gagal menyimpan user.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.id);
        setIsDeleteOpen(false);
        setUserToDelete(null);
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'Gagal menghapus user.');
        setIsDeleteOpen(false);
      }
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-slate-50 relative animate-in fade-in duration-300">
      {/* ── HEADER (SAP/Odoo style) ── */}
      <div className="bg-gradient-to-r from-[#4C51BF] to-[#667EEA] px-6 py-6 pb-20 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm border border-white/30">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                Manajemen User
              </h1>
              <div className="flex items-center text-white/80 text-sm mt-1 gap-2 font-medium">
                <span className="hover:text-white cursor-pointer transition-colors">Home</span>
                <span>/</span>
                <span className="hover:text-white cursor-pointer transition-colors">User</span>
                <span>/</span>
                <span className="text-white font-bold">Data</span>
              </div>
            </div>
          </div>
          
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white border border-white/40 rounded-lg shadow-sm font-semibold transition-all backdrop-blur-sm"
          >
            <Plus className="w-4 h-4" />
            Entri Data
          </button>
        </div>
      </div>

      {/* ── CONTENT (Overlapping Header) ── */}
      <div className="px-6 -mt-10 pb-12 relative z-10">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[500px]">
          
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-700">Data User</h2>
          </div>

          <div className="p-5 flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                Tampilkan
                <select 
                  value={itemsPerPage} 
                  onChange={(e) => setItemsPerPage(e.target.value)}
                  className="border border-slate-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                data
              </div>

              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                Cari:
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-slate-300 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-64 transition-all"
                    placeholder="Nama, Username, Hak Akses..."
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden flex-1">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                      <div className="flex items-center justify-between">No. <ArrowUpDown className="w-3 h-3 text-slate-400" /></div>
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                      <div className="flex items-center justify-between">Nama User <ArrowUpDown className="w-3 h-3 text-slate-400" /></div>
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                      <div className="flex items-center justify-between">Username <ArrowUpDown className="w-3 h-3 text-slate-400" /></div>
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                      <div className="flex items-center justify-between">Hak Akses <ArrowUpDown className="w-3 h-3 text-slate-400" /></div>
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-700 text-center w-28">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user, idx) => (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-4 py-3 font-medium text-slate-500 text-center">{idx + 1}</td>
                      <td className="px-4 py-3 text-slate-800 font-medium flex items-center gap-2">
                        {user.name}
                        {currentUser?.id === user.id && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded font-bold uppercase tracking-wider">You</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-mono text-xs">{user.username}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                          user.role === 'ADMIN' || user.role === 'KEPALA GUDANG' ? 'bg-blue-50 text-blue-700' :
                          user.role === 'CFO' ? 'bg-emerald-50 text-emerald-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          <Shield className="w-3 h-3" />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => openEditModal(user)}
                            className="p-1.5 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                            title="Edit User"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openDeleteModal(user)}
                            className="p-1.5 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                            title="Hapus User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        Tidak ada data user yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Placeholder */}
            <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
              <div>Menampilkan 1 sampai {filteredUsers.length} dari {filteredUsers.length} data</div>
              <div className="flex items-center gap-1">
                <button className="px-3 py-1 border border-slate-200 rounded text-slate-400 cursor-not-allowed">Sebelumnya</button>
                <button className="px-3 py-1 border border-blue-500 bg-blue-50 text-blue-700 rounded font-medium">1</button>
                <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 text-slate-600">Selanjutnya</button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── FORM MODAL (Create/Edit) ── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {editingUser ? 'Edit User' : 'Entri Data User Baru'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="p-6">
              {formError && (
                <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-rose-50 text-rose-600 text-sm rounded-lg border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Masukkan nama lengkap"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Username</label>
                  <input 
                    type="text" 
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                    placeholder="username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Hak Akses (Role)</label>
                  <select 
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ADMINISTRATOR">Administrator</option>
                    <option value="CFO">CFO / Direktur</option>
                    <option value="KEPALA GUDANG">Kepala Gudang</option>
                    <option value="ADMIN">Admin Gudang</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Password {editingUser && <span className="text-slate-400 font-normal">(Kosongkan jika tidak diubah)</span>}
                  </label>
                  <input 
                    type="text" 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                    placeholder={editingUser ? '••••••••' : 'Masukkan password awal'}
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {isDeleteOpen && userToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 p-6 text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Hapus User?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Apakah Anda yakin ingin menghapus user <strong className="text-slate-700">{userToDelete.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleteOpen(false)}
                className="flex-1 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-sm"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
