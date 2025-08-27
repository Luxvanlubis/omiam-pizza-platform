"use client";

import React from 'react';
import WaitlistManagement from '@/components/reservation/WaitlistManagement';

const WaitlistPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <WaitlistManagement />
    </div>
  );
};

export default WaitlistPage;