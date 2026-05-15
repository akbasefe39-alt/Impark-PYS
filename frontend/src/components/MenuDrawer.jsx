import React from 'react';
import { Home, LayoutDashboard, Users, Activity, Key, Building2, CalendarRange, Clock, ClipboardList, Receipt, Banknote, MonitorPlay, Mails, Files, ScrollText, Trash2, LogOut, BarChart, X, Shield } from 'lucide-react';

import { IMPARK_LOGO } from '../assets/logo';

const MenuDrawer = ({ currentTab, setCurrentTab, t, isManager, isAdmin, currentUser, me, sidebarOpen, setEditingItem }) => {
  if (!sidebarOpen) return null;

  const menuItems = [
    { id: 'home', label: t.home || 'Ana Sayfa', allowed: true, icon: Home },
    { id: 'dashboard', label: t.dash, allowed: (currentUser?.canViewDashboard !== false) && (isAdmin || isManager), icon: LayoutDashboard },
    { id: 'raporlar', label: t.raporlar || 'Raporlar & Analiz', allowed: isAdmin || isManager, icon: BarChart },
    { id: 'personel', label: t.staff, allowed: isAdmin || isManager, icon: Users },
    { id: 'performans', label: t.perf, allowed: isAdmin || isManager, icon: Activity },
    { id: 'yetki', label: t.roles, allowed: isAdmin, icon: Key },
    { id: 'departman', label: t.deps, allowed: isAdmin, icon: Building2 },
    { id: 'izin', label: t.leaves, allowed: true, icon: CalendarRange },
    { id: 'mesai', label: t.pdks, allowed: true, icon: Clock },
    { id: 'gorevler', label: t.tasks, allowed: true, icon: ClipboardList },
    { id: 'harcamalar', label: t.exp, allowed: true, icon: Receipt },
    { id: 'maas', label: t.finance, allowed: true, icon: Banknote }, // İçerik backend'den kısıtlı
    { id: 'zimmet', label: t.assets, allowed: true, icon: MonitorPlay }, // İçerik backend'den kısıtlı
    { id: 'duyuru_arşiv', label: t.archived, allowed: true, icon: Mails },
    { id: 'onboarding', label: t.onboarding || 'İşe Giriş/Çıkış', allowed: isAdmin || isManager, icon: ClipboardList },
    { id: 'belgeler', label: t.docs, allowed: true, icon: Files },
    { id: 'logs', label: t.logs, allowed: isAdmin, icon: ScrollText },
    { id: 'security', label: t.security || 'Güvenlik Merkezi', allowed: isAdmin, icon: Shield },
    { id: 'mail', label: t.mail || 'E-Posta Merkezi', allowed: isAdmin, icon: Mails },
    { id: 'trash', label: t.trash, allowed: isAdmin, icon: Trash2 },
  ];

  return (
    <aside className={`
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0 lg:static fixed inset-y-0 left-0
      w-64 bg-zinc-950 flex flex-col shrink-0 z-[100] border-r border-zinc-800 transition-transform duration-300 ease-in-out
    `}>
      <header className="h-16 px-6 flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white p-1 shadow-sm border border-zinc-800">
            <img src={IMPARK_LOGO} alt="IMPARK Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-zinc-100 tracking-tight">İMPARK</span>
            <span className="text-[10px] text-zinc-500 font-medium -mt-1 uppercase tracking-widest">PYS (Yönetim Sistemi)</span>
          </div>
        </div>
        {/* Mobilde Kapatma Butonu */}
        <button onClick={() => setCurrentTab('toggleSidebar')} className="lg:hidden p-2 text-zinc-500 hover:text-zinc-200">
          <X className="w-5 h-5" /> 
        </button>
      </header>
      <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="text-[11px] font-semibold text-zinc-500 uppercase mb-3 px-2">{t.apps}</div>
        {menuItems.filter(i => i.allowed).map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button key={item.id} onClick={() => { setCurrentTab(item.id); if(window.innerWidth < 1024) setCurrentTab('toggleSidebar'); }} className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-3 transition-colors outline-none text-sm font-medium ${isActive ? 'bg-indigo-600/10 text-indigo-500' : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'}`}>
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-500' : 'text-zinc-500'}`} />
              {item.label}
            </button>
          );
        })}
      </div>
      <footer className="p-4 bg-zinc-950 flex items-center gap-3 border-t border-zinc-800">
        <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-sm font-semibold text-zinc-300 shrink-0 overflow-hidden cursor-pointer" onClick={() => setEditingItem({ ...me, type: 'personel' })}>
           {me?.profilePicture ? <img src={me.profilePicture} className="w-full h-full object-cover" alt="Profile"/> : currentUser?.name?.[0]}
        </div>
        <div className="flex-1 min-w-0">
           <p className="text-sm font-medium text-zinc-200 truncate leading-tight">{currentUser?.name}</p>
           <p className="text-[11px] text-zinc-500 capitalize truncate">{me?.unvan || currentUser?.role}</p>
        </div>
        <button onClick={() => {localStorage.removeItem('token'); window.location.reload();}} className="text-zinc-500 hover:text-red-500 p-2 rounded-md hover:bg-zinc-900 transition-colors">
          <LogOut className="w-4 h-4" />
        </button>
      </footer>
    </aside>
  );
};

export default MenuDrawer;
