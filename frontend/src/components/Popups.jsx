import React from 'react';
import Button from './Button';
import api from '../api';
import { getDict } from '../utils';

const Popups = ({ toast, unreadAnnouncement, currentUser, setUnreadAnnouncement, fetchData, lang }) => {
  const tr = getDict(lang);
  return (
    <>
      {toast.show && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-8 z-[1000] w-[90%] md:w-auto px-6 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-4 md:slide-in-from-right-4 border text-sm font-medium ${toast.type === 'error' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
           {toast.message}
        </div>
      )}

      {unreadAnnouncement && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[800] flex items-center justify-center p-4 xl:p-0 animate-in fade-in duration-200">
           <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-xl max-w-xl w-full flex flex-col shadow-2xl">
              <h2 className="text-xl font-semibold text-zinc-100 mb-2">{tr('Announcement', 'Duyuru')}</h2>
              <h3 className="text-sm font-medium text-indigo-400 mb-6">{unreadAnnouncement.baslik}</h3>
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                 <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{unreadAnnouncement.icerik}</p>
              </div>
              <div className="text-xs text-zinc-500 font-medium mb-8 pt-4 border-t border-zinc-800 flex justify-between">
                <span>{tr('Published by:', 'Yayınlayan:')} {unreadAnnouncement.yapanKisi}</span>
                <span>{tr('Date:', 'Tarih:')} {unreadAnnouncement.tarih}</span>
              </div>
              <Button className="w-full" onClick={async () => { 
                await api.post(`/users/duyuru-oku/${unreadAnnouncement.id}`, { userId: currentUser.id }); 
                setUnreadAnnouncement(null); 
                fetchData(currentUser.id, currentUser.role); 
              }}>{tr('Acknowledge', 'Anladım')}</Button>
           </div>
        </div>
      )}
    </>
  );
};

export default Popups;
