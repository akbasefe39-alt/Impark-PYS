import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, BarChart, Bar } from 'recharts';
import { Users, Banknote, CalendarClock, Briefcase, Activity, Target } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
const PIE_COLORS = ['#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'];

const ReportsDashboard = ({ personeller = [], departmanlar = [], izinler = [], maaslar = [], tasks = [], expenses = [], tr }) => {
  // --- METRİKLER (KPI) ---
  const kpis = useMemo(() => {
    const payrollTotal = (maaslar || []).reduce((sum, m) => sum + (Number(m?.temelMaas) || 0) + (Number(m?.prim) || 0), 0);
    const expenseTotal = (expenses || []).reduce((sum, e) => sum + (Number(e?.miktar) || 0), 0);
    const activeStaff = (personeller || []).length;
    const pendingTasks = (tasks || []).filter(t => t?.durum !== 'Tamamlandı').length;
    const completedTasks = (tasks || []).filter(t => t?.durum === 'Tamamlandı').length;

    return { payrollTotal, expenseTotal, activeStaff, pendingTasks, completedTasks };
  }, [maaslar, expenses, personeller, tasks]);

  // --- GİDER / MAAŞ TREND (Area Chart) ---
  const monthlyTrend = useMemo(() => {
    const dataMap = {};

    // Maaşları Ekle
    (maaslar || []).forEach(m => {
       if (!m?.odemeTarihi) return;
       const d = new Date(m.odemeTarihi);
       if (isNaN(d.getTime())) return;
       const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
       if (!dataMap[key]) dataMap[key] = { name: key, Payroll: 0, Expenses: 0 };
       dataMap[key].Payroll += (Number(m.temelMaas) || 0) + (Number(m.prim) || 0);
    });

    // Harcamaları Ekle
    (expenses || []).forEach(e => {
       if (!e?.tarih) return;
       const d = new Date(e.tarih);
       if (isNaN(d.getTime())) return;
       const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
       if (!dataMap[key]) dataMap[key] = { name: key, Payroll: 0, Expenses: 0 };
       dataMap[key].Expenses += (Number(e.miktar) || 0);
    });

    return Object.values(dataMap).sort((a, b) => a.name.localeCompare(b.name));
  }, [maaslar, expenses]);

  // --- DEMOGRAFİK (Pie Charts) ---
  const genderData = useMemo(() => {
    const counts = { 'Erkek': 0, 'Kadın': 0, 'Belirtilmedi': 0 };
    (personeller || []).forEach(p => {
       if (!p) return;
       counts[p.cinsiyet === 'Erkek' ? 'Erkek' : p.cinsiyet === 'Kadın' ? 'Kadın' : 'Belirtilmedi']++;
    });
    return Object.keys(counts).filter(k => counts[k] > 0).map(k => ({ name: k, value: counts[k] }));
  }, [personeller]);

  // --- DEPARTMAN BAZLI GÖREVLER (Stacked Bar Chart) ---
  const deptTasksData = useMemo(() => {
    const map = {};
    (departmanlar || []).forEach(d => { if(d) map[d.id] = { name: d.ad || 'Bilinmiyor', Tamamlanan: 0, Bekleyen: 0 }; });

    (tasks || []).forEach(t => {
      if (t?.personel?.departman?.id && map[t.personel.departman.id]) {
         if (t.durum === 'Tamamlandı') {
            map[t.personel.departman.id].Tamamlanan++;
         } else {
            map[t.personel.departman.id].Bekleyen++;
         }
      }
    });

    return Object.values(map).filter(v => v.Tamamlanan > 0 || v.Bekleyen > 0);
  }, [tasks, departmanlar]);


  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="flex justify-between items-center bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm">
         <div>
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-3">
              <Activity className="w-7 h-7 text-indigo-500" />
              {tr('Detailed Analytics & Reports', 'Analitik ve Detaylı Raporlar')}
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              {tr('Track financial trends, demographics and task distributions across departments.', 'Finansal trendleri, demografileri ve departman görev ilerlemelerini analiz edin.')}
            </p>
         </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex flex-col justify-center">
           <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-zinc-500 uppercase">{tr('Total Payroll Cost', 'Toplam Maaş Maliyeti')}</p>
              <Banknote className="w-4 h-4 text-emerald-500" />
           </div>
           <p className="text-3xl font-bold text-emerald-400 mt-2">₺{kpis?.payrollTotal?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex flex-col justify-center">
           <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-zinc-500 uppercase">{tr ? tr('Total Expenses', 'Şirket Giderleri') : 'Şirket Giderleri'}</p>
              <Activity className="w-4 h-4 text-rose-500" />
           </div>
           <p className="text-3xl font-bold text-rose-400 mt-2">₺{kpis?.expenseTotal?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex flex-col justify-center">
           <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-zinc-500 uppercase">{tr('Active Staff', 'Aktif Çalışanlar')}</p>
              <Users className="w-4 h-4 text-indigo-500" />
           </div>
           <p className="text-3xl font-bold text-indigo-400 mt-2">{kpis.activeStaff}</p>
        </div>
        <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex flex-col justify-center">
           <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-zinc-500 uppercase">{tr('Completed Tasks', 'Tamamlanan Görev')}</p>
              <Target className="w-4 h-4 text-sky-500" />
           </div>
           <p className="text-3xl font-bold text-sky-400 mt-2">{kpis.completedTasks} <span className="text-sm font-medium text-zinc-500">/ {kpis.pendingTasks + kpis.completedTasks}</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CHART 1: Area Trend (Takes 2 columns) */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm">
           <h3 className="text-zinc-100 font-semibold mb-6 pb-4 border-b border-zinc-800/50 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" /> {tr('Monthly Financial Trend', 'Aylık Finans Trendi (Maaş vs Gider)')}
           </h3>
           {monthlyTrend.length > 0 ? (
             <div className="h-72 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={monthlyTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                   <defs>
                     <linearGradient id="colorPayroll" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                   <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `₺${v/1000}k`}/>
                   <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                   <RechartsTooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} itemStyle={{ fontSize: 13 }} labelStyle={{ color: '#a1a1aa', marginBottom: 4 }} />
                   <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                   <Area type="monotone" dataKey="Payroll" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPayroll)" name={tr('Payroll', 'Maaş Ödemesi')} />
                   <Area type="monotone" dataKey="Expenses" stroke="#ec4899" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" name={tr('Office Expenses', 'Diğer Giderler')} />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
           ) : (
             <div className="h-72 flex items-center justify-center text-zinc-500 text-sm">{tr('Not enough data to display trend.', 'Trend analizi için yeterli finansal veri yok.')}</div>
           )}
        </div>

        {/* CHART 2: Demographics PIE (Takes 1 column) */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm">
           <h3 className="text-zinc-100 font-semibold mb-6 pb-4 border-b border-zinc-800/50 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" /> {tr('Gender Distribution', 'Cinsiyet Dağılımı')}
           </h3>
           {genderData.length > 0 ? (
             <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={genderData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                     {genderData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                     ))}
                   </Pie>
                   <RechartsTooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} />
                   <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px' }} />
                 </PieChart>
               </ResponsiveContainer>
             </div>
           ) : (
             <div className="h-64 flex items-center justify-center text-zinc-500 text-sm">Veri Yok</div>
           )}
        </div>

        {/* CHART 3: Tasks by Department (Takes full row) */}
        <div className="lg:col-span-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-sm mt-4">
           <h3 className="text-zinc-100 font-semibold mb-6 pb-4 border-b border-zinc-800/50 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-500" /> {tr('Tasks by Department', 'Departmanlara Göre Görev Dağılımı')}
           </h3>
           {deptTasksData.length > 0 ? (
             <div className="h-80 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={deptTasksData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} barSize={35}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                   <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                   <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                   <RechartsTooltip cursor={{fill: '#27272a', opacity: 0.4}} contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} />
                   <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                   <Bar dataKey="Tamamlanan" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                   <Bar dataKey="Bekleyen" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                 </BarChart>
               </ResponsiveContainer>
             </div>
           ) : (
             <div className="h-80 flex items-center justify-center text-zinc-500 text-sm">{tr('No task data available.', 'Kayıtlı görev verisi bulunamadı.')}</div>
           )}
        </div>
        
      </div>
    </div>
  );
};

export default ReportsDashboard;
