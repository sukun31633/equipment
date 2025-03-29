"use client";

import { Phone, Mail, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactUsPage() {
  const handleBack = () => {
    window.history.back();
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
          <h2 className="text-xl font-bold text-blue-700">ติดต่อแจ้งปัญหา</h2>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">ติดต่อเรา</h3>
          
          {/* ปุ่มโทรออก */}
          <motion.a 
            href="tel:023126300" 
            whileHover={{ scale: 1.05 }}
            className="flex items-center border p-3 rounded-lg mb-3 border-gray-300 bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition shadow-lg"
          >
            <Phone className="text-white mr-3" size={24} />
            <span className="text-white font-medium">เบอร์โทรศัพท์: 02-312-6300 ต่อ 1219</span>
          </motion.a>
          
          {/* ปุ่มส่งอีเมล */}
          <motion.a 
            href="mailto:apichart.pai@hcu.ac.th" 
            whileHover={{ scale: 1.05 }}
            className="flex items-center border p-3 rounded-lg border-gray-300 bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition shadow-lg"
          >
            <Mail className="text-white mr-3" size={24} />
            <span className="text-white font-medium">อีเมล์: apichart.pai@hcu.ac.th</span>
          </motion.a>
          
        </div>
        <p className="text-sm text-black text-center">📅 เวลาทำการ: จันทร์ - ศุกร์, 8:30 - 17:00 น.</p>
      </motion.div>
    </div>
  );
}