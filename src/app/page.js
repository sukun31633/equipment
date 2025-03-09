"use client";

import { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [userID, setUserID] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    setErrorMessage("");

    if (!userID || !password) {
      setErrorMessage("⚠️ กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const res = await signIn("credentials", {
      redirect: false, // ❌ ไม่ให้ Redirect
      userID,
      password,
    });

    if (!res || res.error) {
      setErrorMessage(res.error || "❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    } else {
      router.push("/home"); // ✅ ถ้าสำเร็จให้ไปหน้า home
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-indigo-400 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 bg-white shadow-xl rounded-2xl backdrop-blur-lg bg-opacity-90 border border-gray-200 relative"
      >
        <div className="flex flex-col items-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Image 
              src="/Hcu.png" 
              alt="LOGO มหาวิทยาลัย" 
              width={100} 
              height={100} 
              className="object-contain drop-shadow-lg"
            />
          </motion.div>
          <h2 className="text-2xl font-bold mt-2 text-blue-700">เข้าสู่ระบบ</h2>
        </div>

        {/* ✅ แสดง Popup แจ้งเตือน ถ้าข้อมูลผิดพลาด */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-md"
          >
            {errorMessage}
          </motion.div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700">รหัสผู้ใช้งาน</label>
          <input
            type="text"
            placeholder="กรอกรหัสนักศึกษา/อาจารย์"
            value={userID}
            onChange={(e) => setUserID(e.target.value)}
            className="w-full border p-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700">รหัสผ่าน</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-3 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50"
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-500 hover:text-blue-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>
        </div>
        <div className="flex justify-between mb-4 text-sm">
          <a href="/contact" className="text-blue-600 hover:underline">ติดต่อแจ้งปัญหา</a>
          <a href="/forgot-password" className="text-blue-600 hover:underline">ลืมรหัสผ่าน?</a>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all shadow-md"
          onClick={handleLogin}
        >
          ลงชื่อเข้าใช้
        </motion.button>
      </motion.div>
    </div>
  );
}