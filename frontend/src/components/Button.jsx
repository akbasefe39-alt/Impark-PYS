import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const base = "px-4 py-2 rounded-md text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:pointer-events-none ";
  const variants = { 
    primary: "bg-indigo-600 text-white hover:bg-indigo-500 border border-indigo-500", 
    success: "bg-emerald-600 text-white hover:bg-emerald-500 border border-emerald-500", 
    danger: "bg-red-600 text-white hover:bg-red-500 border border-red-500", 
    outline: "bg-transparent border border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white",
    ai: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 border border-indigo-500/50 shadow-indigo-500/20" 
  };
  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
