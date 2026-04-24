import React from 'react';
import { Users, CalendarClock, Building, HandCoins, Activity, BarChart, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

export const StatWidget = ({ label, value, icon: Icon, color, tr }) => (
  <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 shadow-sm flex items-center justify-between group animate-in fade-in zoom-in duration-300">
    <div>
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-semibold text-zinc-100 mt-1">{value}</p>
    </div>
    <div className={`p-3 rounded-lg bg-zinc-800/50 border border-zinc-800/50 ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
  </div>
);

export const DepartmentPieWidget = ({ data, tr }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
    <h3 className="text-zinc-100 font-semibold mb-6 flex items-center gap-2">
      <Building className="w-5 h-5 text-indigo-500" /> {tr('Department Spread', 'Departman Dağılımı')}
    </h3>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data || []} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
            {(data || []).map((e, index) => <Cell key={`cell-${index}`} fill={['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'][index % 5]} />)}
          </Pie>
          <RechartsTooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} itemStyle={{ color: '#e4e4e7' }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const ExpenseBarWidget = ({ data, tr }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
    <h3 className="text-zinc-100 font-semibold mb-6 flex items-center gap-2">
      <Activity className="w-5 h-5 text-emerald-500" /> {tr('Expense Distribution', 'Finansal Gider Analizi')}
    </h3>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={data || []}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
          <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={val => `₺${val / 1000}k`} />
          <RechartsTooltip cursor={{ fill: '#27272a' }} contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }} />
          <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  </div>
);
