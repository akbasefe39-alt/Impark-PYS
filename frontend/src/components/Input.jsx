import React from 'react';

const Input = ({ type, className = '', ...props }) => (
  <input 
     type={type} 
     className={`w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-md text-sm text-zinc-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder-zinc-500 ${className}`} 
     style={['date', 'time', 'month'].includes(type) ? { colorScheme: 'dark' } : {}}
     {...props} 
  />
);

export default Input;
