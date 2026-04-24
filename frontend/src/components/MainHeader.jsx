import React from 'react';
import Button from './Button';
import { Menu, Globe, Bell, User, Download, Sun, Moon } from 'lucide-react';
import { getDict } from '../utils';
import { IMPARK_LOGO } from '../assets/logo';

const MainHeader = ({ currentTab, searchTerm, setSearchTerm, statusFilter, setStatusFilter, depFilter, setDepFilter, departmanlar, setShowAddDrawer, sidebarOpen, setSidebarOpen, lang, setLang, theme, setTheme, notifOpen, setNotifOpen, profileOpen, setProfileOpen, notifications, setEditingItem, me, onExport, handleImport }) => {
  const tr = getDict(lang);

  const getStatusOptions = (tab) => {
    switch (tab) {
      case 'izin':
      case 'harcamalar': return ['Beklemede', 'Onaylandı', 'Reddedildi'];
      case 'maas': return ['Beklemede', 'Ödendi'];
      default: return [];
    }
  };
  const statusOptions = getStatusOptions(currentTab);
  
  const showDepFilter = ['personel', 'maas', 'mesai', 'yetki', 'gorevler'].includes(currentTab);

  return (
    <header className="h-auto min-h-16 py-2 md:py-0 border-b border-zinc-800 flex flex-col md:flex-row items-center justify-between px-4 md:px-6 bg-zinc-950 shrink-0 z-50 gap-3">
      <div className="flex items-center justify-between w-full md:w-auto gap-3">
        <div className="flex items-center gap-3">
          {!sidebarOpen && (
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white p-1 border border-zinc-800 animate-in fade-in zoom-in duration-300">
              <img src={IMPARK_LOGO} alt="IMPARK Logo" className="w-full h-full object-contain" />
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-zinc-400 hover:text-zinc-100 transition-colors p-2 md:p-1.5 bg-zinc-900 rounded-md border border-zinc-800">
            <Menu className="w-5 h-5 md:w-4 h-4" />
          </button>
          <h2 className="text-sm md:text-base font-semibold text-zinc-100 capitalize tracking-tight px-1 truncate max-w-[120px] md:max-w-none">{currentTab.replace('_', ' ')}</h2>
        </div>
        
        {/* Mobilde Yeni İşlem Butonu Sola Alındı */}
        <div className="md:hidden">
          {setShowAddDrawer && (['logs', 'trash'].includes(currentTab) ? (me?.role === 'admin' || me?.role === 'superadmin') : true) && (
            <Button variant="success" onClick={() => setShowAddDrawer(true)} className="h-8 px-3 text-xs">{tr('New', 'Yeni')}</Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto justify-end overflow-visible pb-1 md:pb-0">
        {onExport && (
          <button title={tr('Export CSV', 'CSV Dışa Aktar')} onClick={onExport} className="hidden sm:block text-zinc-400 hover:text-zinc-100 transition-colors p-2 bg-zinc-900 rounded-md border border-zinc-800 shrink-0">
            <Download className="w-4 h-4" />
          </button>
        )}
        
        {currentTab === 'personel' && (
          <label className="hidden sm:flex items-center bg-zinc-900 border border-zinc-800 rounded-md px-2 py-1 cursor-pointer hover:border-zinc-700 transition-all shrink-0">
            <Download className="w-4 h-4 text-emerald-500 mr-1.5" />
            <span className="text-[10px] md:text-xs font-semibold text-zinc-300 mr-1 md:mr-2">{tr('Import', 'İçeri Aktar')}</span>
            <input type="file" accept=".csv" className="hidden" onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                 const reader = new FileReader();
                 reader.onload = (event) => {
                   handleImport(event.target.result);
                   e.target.value = '';
                 };
                 reader.readAsText(file);
              }
            }} />
          </label>
        )}

        {showDepFilter && (
          <select
            className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] md:text-xs px-2 md:px-3 py-1.5 md:py-2 rounded-md focus:border-indigo-500 outline-none shrink-0"
            value={depFilter}
            onChange={e => setDepFilter(e.target.value)}
          >
            <option value="All">{tr('Dept.', 'Birim')}</option>
            {departmanlar?.map(d => <option key={d.id} value={d.id}>{d.ad}</option>)}
          </select>
        )}

        {statusOptions.length > 0 && (
          <select
            className="bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px] md:text-xs px-2 md:px-3 py-1.5 md:py-2 rounded-md focus:border-indigo-500 outline-none shrink-0"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">{tr('Status', 'Durum')}</option>
            {statusOptions.map(opt => <option key={opt} value={opt}>{tr(opt === 'Beklemede' ? 'Pending' : opt === 'Onaylandı' ? 'Approved' : opt === 'Reddedildi' ? 'Rejected' : opt === 'Ödendi' ? 'Paid' : opt, opt)}</option>)}
          </select>
        )}

        <div className="relative flex-1 md:flex-none min-w-[120px]">
          <input
            className="bg-zinc-900 text-xs md:text-sm px-3 md:px-4 py-1.5 md:py-2 rounded-md w-full md:w-48 lg:w-64 border border-zinc-800 focus:border-indigo-500 transition-all outline-none text-zinc-100 placeholder-zinc-600"
            placeholder={tr('Search...', 'Ara...')}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="text-zinc-400 hover:text-zinc-100 transition-colors p-2 bg-zinc-900 rounded-md border border-zinc-800">
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 md:w-4 h-4" /> : <Moon className="w-3.5 h-3.5 md:w-4 h-4" />}
          </button>

          <button onClick={() => setLang(lang === 'TR' ? 'EN' : 'TR')} className="hidden md:flex text-zinc-400 hover:text-zinc-100 transition-colors p-2 bg-zinc-900 rounded-md border border-zinc-800 items-center gap-1.5 font-medium text-xs w-12 md:w-14 justify-center">
             {lang}
          </button>

          <div className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
              className="text-zinc-400 hover:text-zinc-100 transition-colors p-2 bg-zinc-900 rounded-md border border-zinc-800 relative"
            >
              <Bell className="w-3.5 h-3.5 md:w-4 h-4" />
              {notifications?.filter(n => !n.isRead).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-500 text-white text-[8px] md:text-[9px] font-bold rounded-full w-3.5 h-3.5 md:w-4 h-4 flex items-center justify-center border border-zinc-950 animate-pulse">
                  {notifications.filter(n => !n.isRead).length}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-3 w-[290px] md:w-96 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] animate-in fade-in slide-in-from-top-3 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950/50">
                   <div className="flex items-center gap-2">
                     <Bell className="w-4 h-4 text-indigo-400" />
                     <h4 className="text-sm font-bold text-zinc-100">{tr('Notifications', 'Bildirimler')}</h4>
                   </div>
                </div>
                <div className="max-h-64 md:max-h-80 overflow-y-auto custom-scrollbar divide-y divide-zinc-800/50">
                  {notifications?.length === 0 ? (
                    <div className="text-[10px] md:text-xs text-zinc-500 text-center py-6">{tr('No notifications', 'Bildirim yok')}</div>
                  ) : notifications.map(n => (
                    <div key={n.id} className={`px-4 py-3 ${!n.isRead ? 'bg-indigo-950/10' : ''}`}>
                       <p className="text-[11px] font-bold text-zinc-200">{n.title || n.baslik}</p>
                       <p className="text-[10px] text-zinc-400 mt-0.5">{n.message || n.mesaj}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }} className="text-zinc-400 hover:text-zinc-100 transition-colors p-2 bg-zinc-900 rounded-md border border-zinc-800">
              <User className="w-3.5 h-3.5 md:w-4 h-4" />
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-3 w-44 md:w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-1.5 z-[100] animate-in fade-in slide-in-from-top-2">
                <button onClick={() => { setEditingItem({ ...me, type: 'personel' }); setProfileOpen(false); }} className="w-full text-left px-4 py-2.5 text-[11px] md:text-xs font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-lg transition-colors">{tr('Profile', 'Profil')}</button>
                <button onClick={() => { localStorage.removeItem('token'); window.location.reload(); }} className="w-full text-left px-4 py-2.5 text-[11px] md:text-xs font-medium text-red-500 hover:bg-zinc-800 hover:text-red-400 rounded-lg transition-colors border-t border-zinc-800/50 mt-1">{tr('Logout', 'Çıkış')}</button>
              </div>
            )}
          </div>

          <div className="hidden md:block">
            {setShowAddDrawer && (['logs', 'trash'].includes(currentTab) ? (me?.role === 'admin' || me?.role === 'superadmin') : true) && (
              <Button variant="success" onClick={() => setShowAddDrawer(true)} className="h-9 ml-1">{tr('New Record', 'Yeni İşlem')}</Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default MainHeader;
