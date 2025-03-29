"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone");

  // ฟังก์ชันสำหรับแปลงเบอร์โทร (เหมือนใน request-otp)
  function formatPhone(phone) {
    phone = phone.trim();
    if (phone.startsWith("0")) {
      return "+66" + phone.slice(1);
    }
    return phone;
  }

  useEffect(() => {
    if (!phone) {
      alert("ไม่พบหมายเลขโทรศัพท์ กรุณาลองใหม่");
      router.back();
    }
  }, [phone, router]);

  const handleBack = () => {
    router.back();
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      alert("กรุณากรอกรหัส OTP");
      return;
    }
    setLoading(true);
    try {
      // ใช้ฟังก์ชัน formatPhone เพื่อให้เบอร์ตรงกันกับที่เก็บใน otpStorage
      const formattedPhone = formatPhone(phone);
      const res = await fetch("/api/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone, otp }),
      });
      const data = await res.json();
      if (data.success) {
        alert("รหัส OTP ถูกต้อง! กรุณาตั้งรหัสผ่านใหม่");
        router.push(`/forgot-password/reset-password?phone=${encodeURIComponent(formattedPhone)}`);
      } else {
        alert("รหัส OTP ไม่ถูกต้องหรือหมดอายุ: " + data.message);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("เกิดข้อผิดพลาดในการตรวจสอบ OTP");
    } finally {
      setLoading(false);
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
          disabled={loading}
          className={`w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "กำลังตรวจสอบ..." : "ยืนยันรหัส"}
        </motion.button>
      </motion.div>
    </div>
  );
}
