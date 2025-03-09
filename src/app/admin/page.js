"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    console.log('Login with:', phoneNumber, password);
    router.push('/admin/view-borrow');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-6 bg-white shadow-xl rounded-xl"
      >
        <div className="flex flex-col items-center mb-6">
          <Image 
              src="/Hcu.png" 
              alt="LOGO มหาวิทยาลัย" 
              width={100} 
              height={100} 
              className="object-contain"
            />
          <h2 className="text-2xl font-bold mt-2 text-blue-700">แอดมิน</h2>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700">รหัสบุคลากร</label>
          <input
            type="text"
            placeholder="รหัสบุคลากร"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full border p-3 rounded border-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700">รหัสผ่าน</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="กรอกรหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-3 rounded border-blue-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-blue-500 hover:text-blue-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
        <div className="flex justify-end mb-4 text-sm">
          <a href="/forgot-password" className="text-blue-500 hover:underline">ลืมรหัสผ่าน?</a>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition"
          onClick={handleLogin}
        >
          ลงชื่อเข้าใช้
        </motion.button>
      </motion.div>
    </div>
  );
}
