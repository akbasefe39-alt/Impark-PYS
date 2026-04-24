import React from 'react';

const EmptyState = ({ message, icon: Icon }) => (
  <div className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-zinc-500 border border-zinc-800 border-dashed rounded-lg bg-zinc-900/30 text-sm">
    {Icon && <Icon className="w-8 h-8 mb-3 text-zinc-600 opacity-50" />}
    <p>{message}</p>
  </div>
);

export default EmptyState;
