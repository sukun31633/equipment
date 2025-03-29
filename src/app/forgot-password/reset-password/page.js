"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get("phone") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!phone) {
      alert("ไม่พบหมายเลขโทรศัพท์ กรุณาลองใหม่");
      router.back();
    }
  }, [phone, router]);

  const handleBack = () => {
    router.back();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ตรวจสอบว่ารหัสผ่านใหม่และยืนยันตรงกันหรือไม่
    if (newPassword !== confirmPassword) {
      alert("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    if (!phone) {
      alert("ไม่พบหมายเลขโทรศัพท์");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/forgot-password/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phone, // ส่งเบอร์โทรจาก query parameter
          newPassword: newPassword,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert("รีเซ็ตรหัสผ่านเรียบร้อยแล้ว");
        router.push("/"); // ย้ายไปหน้าแรก
      } else {
        alert("ไม่สามารถรีเซ็ตรหัสผ่านได้: " + data.message);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน");
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
          <h2 className="text-xl font-bold text-blue-700">รีเซ็ตรหัสผ่าน</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              รหัสผ่านใหม่
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="กรอกรหัสผ่านใหม่"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border p-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-3 text-gray-500 hover:text-blue-700"
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              ยืนยันรหัสผ่าน
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="ยืนยันรหัสผ่าน"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border p-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-3 text-gray-500 hover:text-blue-700"
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "กำลังรีเซ็ตรหัสผ่าน..." : "รีเซ็ตรหัสผ่าน"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
