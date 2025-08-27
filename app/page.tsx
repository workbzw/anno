'use client';

import { useState } from "react";
import Navbar from './components/Navbar';
import PageContent from './components/PageContent';
import { useSafariScrollFix } from './hooks/useSafariScrollFix';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('home');
  
  // 使用自定义 Hook 修复 Safari 弹性滚动
  useSafariScrollFix();

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{ overscrollBehavior: 'none' }}>
      <Navbar currentPage={currentPage} onPageChange={handlePageChange} />
      <PageContent currentPage={currentPage} />
    </div>
  );
}
