"use client";

import { useState } from "react";
import { Eye, EyeOff, ArrowLeft, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddUserPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex flex-col items-center p-6 pb-24">
      
      {/* 🔹 Header Section */}
      <div className="w-full max-w-4xl bg-white p-4 shadow-lg flex items-center justify-between rounded-lg mb-6">
        <div className="flex items-center">
          <button onClick={handleBack} className="text-blue-500 hover:text-blue-700 transition">
            <ArrowLeft size={26} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800 ml-4">➕ เพิ่มข้อมูลผู้ใช้งาน</h2>
        </div>
      </div>

      {/* 🔹 Form Section */}
      <div className="w-full max-w-4xl bg-white p-6 shadow-md rounded-lg">
        {["ชื่อ", "นามสกุล", "เบอร์โทร", "อีเมล์", "รหัสประจำตัว"].map((label) => (
          <div className="mb-4" key={label}>
            <label className="block text-sm font-semibold mb-1 text-gray-700">{label}</label>
            <input
              type="text"
              placeholder={`🔹 ${label}`}
              className="w-full border p-3 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
            />
          </div>
        ))}

        {/* Dropdown: ประเภทผู้ใช้งาน */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700">ประเภทผู้ใช้งาน</label>
          <select className="w-full border p-3 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800">
            <option>🎓 นักศึกษา</option>
            <option>📚 อาจารย์</option>
            <option>🏢 เจ้าหน้าที่</option>
          </select>
        </div>

        {/* Input: รหัสผ่าน */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700">🔑 รหัสผ่าน</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="🔒 กรอกรหัสผ่าน"
              className="w-full border p-3 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-blue-500 hover:text-blue-700 transition"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </div>
        </div>

        {/* ปุ่มบันทึก */}
        <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition text-lg font-semibold shadow-md">
          ✅ บันทึกข้อมูล
        </button>
      </div>
    </div>
  );
}
