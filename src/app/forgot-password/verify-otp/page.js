"use client";

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState('');
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleVerifyOtp = () => {
    // เมื่อตรวจสอบรหัส OTP สำเร็จ ให้เปลี่ยนไปยังหน้ารีเซ็ตรหัสผ่าน
    router.push('/forgot-password/reset-password');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-500 p-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-6 bg-white shadow-2xl rounded-2xl backdrop-blur-lg bg-opacity-90 border border-gray-300"
      >
        <div className="flex items-center mb-6">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleBack}
            className="text-blue-600 mr-3 hover:text-blue-800"
          >
            <ArrowLeft size={26} />
          </motion.button>
          <h2 className="text-xl font-bold text-blue-700">ยืนยันรหัส OTP</h2>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold mb-1 text-gray-700">รหัส OTP</label>
          <input
            type="text"
            placeholder="กรอกรหัส OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full border p-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 text-center text-lg tracking-widest"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleVerifyOtp}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg"
        >
          ยืนยันรหัส
        </motion.button>
      </motion.div>
    </div>
  );
}