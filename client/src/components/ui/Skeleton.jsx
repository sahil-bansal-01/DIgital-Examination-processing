import React from 'react';

export const Skeleton = ({ className = '', rounded = 'rounded-xl' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-200 ${rounded} ${className}`}
    />
  );
};

export default Skeleton;
