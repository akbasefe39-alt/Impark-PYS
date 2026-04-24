import React from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { getDict } from '../utils';

const ChatDock = ({ chatOpen, setChatOpen, chatTab, setChatTab, aiChat, chatMessages, currentUser, chatInput, setChatInput, sendMessage, chatEndRef, lang }) => {
  const tr = getDict(lang);
  return (
    <div className="fixed bottom-6 right-6 z-[150]">
       {chatOpen ? (
         <div className="w-[400px] h-[600px] bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
            <header className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 justify-between shrink-0">
               <div className="flex gap-6">
                 <button onClick={()=>setChatTab('ai')} className={`text-xs font-semibold uppercase tracking-wider transition-all border-b-2 pt-1 ${chatTab==='ai'?'text-indigo-500 border-indigo-500':'text-zinc-500 border-transparent hover:text-zinc-300'}`}>AI Copilot</button>
                 <button onClick={()=>setChatTab('live')} className={`text-xs font-semibold uppercase tracking-wider transition-all border-b-2 pt-1 ${chatTab==='live'?'text-emerald-500 border-emerald-500':'text-zinc-500 border-transparent hover:text-zinc-300'}`}>{tr('Team', 'Takım')}</button>
               </div>
               <button onClick={()=>setChatOpen(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"><X className="w-5 h-5"/></button>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-zinc-950">
               {chatTab === 'ai' ? (
                 aiChat.map((m, i) => (
                   <div key={i} className={`flex gap-3 ${!m.isAi ? 'flex-row-reverse' : ''} animate-in fade-in`}>
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-1 shadow-sm ${m.isAi ? 'bg-indigo-600' : 'bg-zinc-800'}`}>{m.isAi ? 'AI' : tr('ME', 'BEN')}</div>
                      <div className={`flex-1 min-w-0 ${!m.isAi ? 'text-right' : ''}`}>
                         <p className={`text-[10px] font-semibold uppercase mb-1 ${m.isAi ? 'text-indigo-500' : 'text-zinc-400'}`}>{m.isAi ? 'Cognitive AI' : (currentUser?.name || tr('You', 'Sen'))}</p>
                         <div className={`text-sm py-2 px-3 rounded-md whitespace-pre-wrap leading-relaxed inline-block ${m.isAi ? 'bg-zinc-900 text-zinc-300 border border-zinc-800' : 'bg-indigo-600/10 text-indigo-100 border border-indigo-500/20'}`}>{m.text}</div>
                      </div>
                   </div>
                 ))
               ) : (
                 chatMessages.map(m => (
                   <div key={m.id} className="flex gap-3 animate-in fade-in">
                      <div className="w-8 h-8 rounded-md bg-zinc-800 flex items-center justify-center text-sm font-bold text-emerald-500 shrink-0 mt-1 border border-zinc-700 shadow-sm">{m.sender?.firstName?.[0]}</div>
                      <div className="flex-1 min-w-0">
                         <p className="text-[10px] font-semibold text-zinc-400 uppercase mb-1">{m.sender?.firstName} <span className="text-zinc-600 ml-2 font-mono">{m.timestamp}</span></p>
                         <div className="text-sm text-zinc-300 leading-relaxed bg-zinc-900 py-2 px-3 rounded-md border border-zinc-800 inline-block">{m.content}</div>
                      </div>
                   </div>
                 ))
               )}
               <div ref={chatEndRef} />
            </div>
            <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex gap-2">
               <input className="flex-1 bg-zinc-950 border border-zinc-800 rounded-md px-3 text-sm text-zinc-100 outline-none focus:border-indigo-500 transition-colors placeholder-zinc-600 h-10" placeholder={tr(`Message ${chatTab}...`, `Mesaj gönder: ${chatTab}...`)} value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyPress={e=>e.key==='Enter' && sendMessage()} />
               <button className="w-10 h-10 bg-indigo-600 flex items-center justify-center rounded-md text-white hover:bg-indigo-500 transition-colors shrink-0" onClick={sendMessage}><Send className="w-4 h-4"/></button>
            </div>
         </div>
       ) : (
         <button onClick={()=>setChatOpen(true)} className="w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"><MessageSquare className="w-6 h-6"/></button>
       )}
    </div>
  );
};

export default ChatDock;
