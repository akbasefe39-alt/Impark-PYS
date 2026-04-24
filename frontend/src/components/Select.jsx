import React from 'react';

const Select = ({ children, className = '', ...props }) => (
  <select className={`w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all cursor-pointer ${className}`} {...props}>
    {children}
  </select>
);

export default Select;
