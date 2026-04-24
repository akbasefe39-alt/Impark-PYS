import React from 'react';
import { Settings, Eye, EyeOff, Save, X } from 'lucide-react';
import Button from './Button';

/**
 * A generic UI customizer that allows users to toggle visibility of items in a list.
 * Replaces DashboardCustomizer and HomeCustomizer to reduce redundancy.
 */
const GenericCustomizer = ({ 
  title, 
  description, 
  items, 
  layout, 
  setLayout, 
  onSave, 
  onClose, 
  tr 
}) => {
  const isToggled = (id) => layout.includes(id);

  const toggle = (id) => {
    if (isToggled(id)) {
      setLayout(layout.filter(i => i !== id));
    } else {
      setLayout([...layout, id]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[1001] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 p-8 rounded-2xl w-full max-w-lg shadow-2xl space-y-6">
        <header className="flex justify-between items-center pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">{title}</h2>
              <p className="text-xs text-zinc-500 mt-1">{description}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="grid grid-cols-1 gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          {items.map(item => (
            <div 
              key={item.id} 
              onClick={() => toggle(item.id)}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group ${isToggled(item.id) ? 'bg-indigo-500/5 border-indigo-500/30' : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'}`}
            >
              <span className={`text-sm font-semibold ${isToggled(item.id) ? 'text-indigo-400' : 'text-zinc-400'}`}>{item.label}</span>
              <div className={`p-2 rounded-lg transition-colors ${isToggled(item.id) ? 'bg-indigo-500 text-white shadow-lg' : 'bg-zinc-800 text-zinc-500 group-hover:text-zinc-300'}`}>
                {isToggled(item.id) ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </div>
            </div>
          ))}
        </div>

        <footer className="pt-6 border-t border-zinc-800 flex gap-4">
           <Button variant="outline" className="flex-1" onClick={onClose}>{tr('Cancel', 'İptal')}</Button>
           <Button className="flex-1 gap-2" onClick={onSave}><Save className="w-4 h-4" /> {tr('Save Layout', 'Görünümü Kaydet')}</Button>
        </footer>
      </div>
    </div>
  );
};

export default GenericCustomizer;
