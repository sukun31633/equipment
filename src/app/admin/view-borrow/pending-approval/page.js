"use client";

import { useState } from "react";
import { Search, ArrowLeft, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const mockData = [
  { id: 1, image: "/webcam.png", userName: "ไมเคิล ใจดี", equipmentName: "กล้องเว็บแคม", brand: "Facecam", quantity: 1, returnDate: "2025-03-01", status: "🕒 รออนุมัติ" },
  { id: 2, image: "/webcam.png", userName: "สุกัลป์ สวยงาม", equipmentName: "กล้องเว็บแคม", brand: "Facecam", quantity: 2, returnDate: "2025-03-05", status: "🕒 รออนุมัติ" }
];

export default function PendingApprovalPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const filteredData = mockData.filter((item) =>
    item.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-200 to-indigo-600 flex flex-col items-center">
      
      {/* 🔹 Header */}
      <div className="w-full max-w-3xl bg-white p-4 shadow-lg flex items-center justify-between rounded-lg mb-6">
        <div className="flex items-center">
          <button onClick={handleBack} className="text-blue-500 mr-2">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">🕒 รออนุมัติการยืม</h2>
        </div>
      </div>

      {/* 🔹 ค้นหา */}
      <div className="w-full max-w-3xl bg-white p-4 shadow-md rounded-lg mb-6 flex items-center">
        <input
          type="text"
          placeholder="🔍 ค้นหาชื่อผู้ใช้..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border p-3 rounded-l border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition">
          <Search size={20} />
        </button>
      </div>

      {/* 🔹 รายการอุปกรณ์ที่รออนุมัติ */}
      <div className="w-full max-w-3xl space-y-4">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-6 shadow-lg rounded-lg flex justify-between items-center hover:shadow-2xl transition"
            >
              {/* ภาพอุปกรณ์ */}
              <div className="w-24 h-24 flex-shrink-0 border rounded-lg overflow-hidden shadow-md">
                <img
                  src={item.image}
                  alt={item.equipmentName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* รายละเอียดการยืม */}
              <div className="flex-1 px-4">
                <p className="font-bold text-lg">📌 {item.equipmentName}</p>
                <p className="text-gray-800">👤 ผู้ใช้: {item.userName}</p>
                <p className="text-gray-800">🏷️ ยี่ห้อ: {item.brand}</p>
                <p className="text-gray-800">📦 จำนวนที่ยืม: {item.quantity} ชิ้น</p>
                <p className="text-gray-800">📅 วันคืนอุปกรณ์: {item.returnDate}</p>
                <p className="text-blue-600 font-semibold flex items-center">
                 {item.status}
                </p>
              </div>

              {/* ปุ่มอนุมัติ */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-green-600 transition"
                onClick={() => alert("อนุมัติการยืมสำเร็จ")}
              >
                ✅ อนุมัติ
              </motion.button>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-600">⏳ ไม่พบข้อมูล</p>
        )}
      </div>
    </div>
  );
}
