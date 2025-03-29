"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleRequestPassword = async () => {
    if (!phoneNumber.trim()) {
      alert("กรุณากรอกหมายเลขโทรศัพท์");
      return;
    }
  
    try {
      // เรียก API เพื่อขอ OTP
      const res = await fetch("/api/forgot-password/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber }),
      });
      const data = await res.json();
  
      if (data.success) {
        alert("ส่ง OTP แล้ว");
        // แล้วค่อยไปหน้า verify-otp โดยส่งเบอร์โทรไปด้วย
        router.push(`/forgot-password/verify-otp?phone=${encodeURIComponent(phoneNumber)}`);
      } else {
        alert("ส่ง OTP ไม่สำเร็จ: " + data.message);
      }
    } catch (error) {
      console.error("Error requesting OTP:", error);
      alert("เกิดข้อผิดพลาดในการส่ง OTP");
    }
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
          <h2 className="text-xl font-bold text-blue-700">ลืมรหัสผ่าน</h2>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-1 text-gray-700">
            หมายเลขโทรศัพท์
          </label>
          <input
            type="text"
            placeholder="กรอกหมายเลขโทรศัพท์"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full border p-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50"
          />
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg"
          onClick={handleRequestPassword}
        >
          ขอรหัสผ่าน
        </motion.button>
      </motion.div>
    </div>
  );
}
