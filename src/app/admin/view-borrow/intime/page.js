"use client";

import { useState } from "react";
import { Search, ArrowLeft, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

const mockBorrows = [
  {
    id: 1,
    borrower: "นางสาวพรทิพย์ ใจดี",
    equipmentName: "แว่น VR",
    brand: "Oculus Quest",
    quantity: 2,
    returnDate: "25/02/2568",
    status: "✅ อยู่ในเวลากำหนด",
    image: "/vr3.jpeg"
  },
  {
    id: 2,
    borrower: "นายสมชาย แสนดี",
    equipmentName: "แว่น VR",
    brand: "Oculus Quest",
    quantity: 1,
    returnDate: "26/02/2568",
    status: "✅ อยู่ในเวลากำหนด",
    image: "/vr3.jpeg"
  }
];

export default function InTimePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const filteredBorrows = mockBorrows.filter((borrow) =>
    borrow.borrower.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-400 to-blue-200 flex flex-col items-center">
      
      {/* 🔹 Header */}
      <div className="w-full max-w-3xl bg-white p-4 shadow-lg flex items-center justify-between rounded-lg mb-6">
        <div className="flex items-center">
          <button onClick={handleBack} className="text-blue-500 mr-2">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">🕒 อุปกรณ์อยู่ในเวลากำหนด</h2>
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

      {/* 🔹 รายการอุปกรณ์ */}
      <div className="w-full max-w-3xl space-y-4">
        {filteredBorrows.length > 0 ? (
          filteredBorrows.map((borrow) => (
            <motion.div
              key={borrow.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-6 shadow-lg rounded-lg flex justify-between items-center hover:shadow-2xl transition"
            >
              {/* ภาพอุปกรณ์ */}
              <div className="w-24 h-24 flex-shrink-0 border rounded-lg overflow-hidden shadow-md">
                <img
                  src={borrow.image}
                  alt={borrow.equipmentName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* รายละเอียดการยืม */}
              <div className="flex-1 px-4">
                <p className="font-bold text-lg">📌 {borrow.equipmentName}</p>
                <p className="text-gray-800">👤 ผู้ใช้: {borrow.borrower}</p>
                <p className="text-gray-800">🏷️ ยี่ห้อ: {borrow.brand}</p>
                <p className="text-gray-800">📦 จำนวนที่ยืม: {borrow.quantity} ชิ้น</p>
                <p className="text-gray-800">📅 คืนภายใน: {borrow.returnDate}</p>
                <p className="text-green-600 font-semibold flex items-center">
                  <CheckCircle size={18} className="mr-1" /> {borrow.status}
                </p>
              </div>

              {/* ปุ่มคืนอุปกรณ์ */}
              <button 
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-yellow-600 transition"
                onClick={() => alert("คืนอุปกรณ์สำเร็จ")}
              >
                🔄 คืนอุปกรณ์
              </button>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-600">⏳ ไม่พบข้อมูลการยืม</p>
        )}
      </div>
    </div>
  );
}
