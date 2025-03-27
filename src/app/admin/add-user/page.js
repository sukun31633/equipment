"use client";

import { useState } from "react";
import { Eye, EyeOff, ArrowLeft, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AddUserPage() {
  const router = useRouter();

  // State สำหรับฟอร์มข้อมูล
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [userType, setUserType] = useState("นักศึกษา");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Build payload object
    const payload = {
      firstName,
      lastName,
      phone,
      email,
      idNumber,
      userType,
      password,
    };

    try {
      const res = await fetch("/api/add-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        alert("บันทึกข้อมูลเรียบร้อยแล้ว");
        router.back();
      } else {
        alert("เกิดข้อผิดพลาด: " + data.message);
      }
    } catch (error) {
      console.error("Error saving user:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex flex-col items-center p-6 pb-24">
      {/* Header Section */}
      <div className="w-full max-w-4xl bg-white p-4 shadow-lg flex items-center justify-between rounded-lg mb-6">
        <div className="flex items-center">
          <button onClick={handleBack} className="text-blue-500 hover:text-blue-700 transition">
            <ArrowLeft size={26} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800 ml-4">➕ เพิ่มข้อมูลผู้ใช้งาน</h2>
        </div>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="w-full max-w-4xl bg-white p-6 shadow-md rounded-lg">
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700">ชื่อ</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="🔹 ชื่อ"
            className="w-full border p-3 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700">นามสกุล</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="🔹 นามสกุล"
            className="w-full border p-3 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700">เบอร์โทร</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="🔹 เบอร์โทร"
            className="w-full border p-3 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700">อีเมล์</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="🔹 อีเมล์"
            className="w-full border p-3 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700">รหัสประจำตัว</label>
          <input
            type="text"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            placeholder="🔹 รหัสประจำตัว"
            className="w-full border p-3 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
            required
          />
        </div>
        {/* Dropdown: ประเภทผู้ใช้งาน */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700">ประเภทผู้ใช้งาน</label>
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            className="w-full border p-3 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
          >
            <option>นักศึกษา</option>
            <option>อาจารย์</option>
            <option>เจ้าหน้าที่</option>
          </select>
        </div>
        {/* Input: รหัสผ่าน */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700">รหัสผ่าน</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="🔒 กรอกรหัสผ่าน"
              className="w-full border p-3 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
              required
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
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-lg hover:from-blue-600 hover:to-indigo-600 transition text-lg font-semibold shadow-md"
        >
          ✅ บันทึกข้อมูล
        </button>
      </form>
    </div>
  );
}
