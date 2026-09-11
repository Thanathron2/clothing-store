import React from 'react';

const GlassCard = ({ children, className = '', ...props }) => {
  return (
    <div className={`glass-container ${className}`} {...props}>
      {children}
    </div>
  );
};

export default GlassCard;
