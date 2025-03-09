"use client";

import { useState } from 'react';
import { Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import AdminNavigationBar from '@/app/components/AdminNavigationBar';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function BorrowingInfoPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearch = () => {
    console.log('ค้นหาผู้ใช้งาน:', searchTerm);
  };

  const navigateToPage = (page) => {
    router.push(`/admin/view-borrow/${page}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center p-6"> 
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl p-6 bg-white shadow-lg flex flex-col items-center rounded-lg"
      >
        <h2 className="text-2xl font-bold text-blue-700 mb-4">ข้อมูลการยืม</h2>
        <div className="flex w-full max-w-lg items-center bg-gray-100 p-2 rounded-lg shadow-sm">
          <input
            type="text"
            placeholder="🔍 ค้นหาผู้ใช้..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border-none p-3 rounded-l-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700"
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-r-lg hover:from-blue-600 hover:to-indigo-600 shadow-md"
          >
            <Search size={24} />
          </motion.button>
        </div>
      </motion.div>

      {/* Status Filters */}
      <div className="flex justify-around w-full max-w-4xl bg-white shadow-md p-3 rounded-lg mt-6">
        {[
          { label: "รออนุมัติ", icon: Clock, path: "pending-approval", color: "text-yellow-500" },
          { label: "อยู่ในกำหนด", icon: CheckCircle, path: "intime", color: "text-green-500" },
          { label: "เลยกำหนด", icon: AlertCircle, path: "overdue", color: "text-red-500" },
        ].map(({ label, icon: Icon, path, color }, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`${color} flex flex-col items-center font-semibold text-sm hover:text-blue-700 transition-all`}
            onClick={() => navigateToPage(path)}
          >
            <Icon size={28} className="mb-1" />
            {label}
          </motion.button>
        ))}
      </div>

      {/* Borrowing Information */}
      <div className="w-full max-w-4xl mt-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 shadow-xl rounded-lg flex items-center justify-between"
        >
          <div className="flex items-center">
            <img
              src="/iotras.jpg"
              alt="ภาพอุปกรณ์"
              className="w-20 h-20 object-cover rounded-md shadow-md"
            />
            <div className="ml-4">
              <p className="text-lg font-semibold text-gray-800">สมชาย ใจดี</p>
              <p className="text-gray-600">อุปกรณ์: Raspberry Pi</p>
              <p className="text-gray-600">จำนวน: 2</p>
              <p className="text-gray-600">กำหนดคืน: 10/10/2025</p>
              <p className="text-yellow-500 font-semibold">รอการคืน</p>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition-all"
          >
            ลบ
          </motion.button>
        </motion.div>
      </div>
      <AdminNavigationBar />
    </div>
  );
}
