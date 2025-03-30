"use client";

import { useState, useEffect } from "react";
import { Search, ArrowLeft, AlertCircle, Download, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);

export default function OverduePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [reservationRequests, setReservationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  // ฟังก์ชันอัปเดตสถานะ (สำหรับปุ่มคืนอุปกรณ์)
  const updateStatus = async (id, type, action) => {
    if (!confirm("คุณต้องการคืนอุปกรณ์สำหรับรายการนี้หรือไม่?")) return;
    try {
      const res = await fetch("/api/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type, action }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        window.location.reload();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาด:", error);
      alert("❌ ไม่สามารถอัปเดตสถานะได้");
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const borrowRes = await fetch("/api/view-borrow");
        const borrowData = await borrowRes.json();
        const reservationRes = await fetch("/api/view-reservation");
        const reservationData = await reservationRes.json();

        if (borrowData.success) setBorrowRequests(borrowData.data);
        if (reservationData.success) setReservationRequests(reservationData.data);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // กรองเฉพาะรายการที่มีสถานะ "Overdue" สำหรับการยืม
  const filteredBorrowRequests = borrowRequests.filter((item) =>
    item.status === "Overdue" &&
    (item.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.userID.toString().includes(searchTerm))
  );

  // กรองเฉพาะรายการที่มีสถานะ "Overdue" สำหรับการจอง
  const filteredReservationRequests = reservationRequests.filter((item) =>
    item.status === "Overdue" &&
    (item.reserverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     item.userID.toString().includes(searchTerm))
  );

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-red-400 to-red-200 flex flex-col items-center">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl bg-white p-4 shadow-lg flex items-center justify-between rounded-lg mb-6"
      >
        <div className="flex items-center">
          <button onClick={handleBack} className="text-red-500 mr-2">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">
            ⏰ รายการอุปกรณ์ที่เลยกำหนด
          </h2>
        </div>
      </motion.div>

      {/* ค้นหา */}
      <div className="w-full max-w-3xl bg-white p-4 shadow-md rounded-lg mb-6 flex items-center">
        <input
          type="text"
          placeholder="🔍 ค้นหาชื่อผู้ใช้หรือรหัสผู้ใช้..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border p-3 rounded-l border-gray-300 focus:ring-2 focus:ring-red-500 focus:outline-none"
        />
        <button className="bg-red-500 text-white px-4 py-2 rounded-r hover:bg-red-600 transition">
          <Search size={20} />
        </button>
      </div>

      {/* ส่วนแสดงรายการการยืมที่เลยกำหนด */}
      <div className="w-full max-w-3xl space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">📌 รายการยืมที่เลยกำหนด</h3>
        {loading ? (
          <p className="text-center text-gray-600">⏳ กำลังโหลด...</p>
        ) : filteredBorrowRequests.length > 0 ? (
          filteredBorrowRequests.map((item) => (
            <motion.div
              key={item.borrowID}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-6 shadow-lg rounded-lg flex items-center hover:shadow-2xl transition"
            >
              <img
                src={item.image}
                alt={item.equipmentName}
                className="w-24 h-24 object-cover rounded-lg border mr-4"
              />
              <div className="flex-1 px-4">
                <p className="font-bold text-lg">
                  {item.equipmentName} ({item.equipment_code})
                </p>
                <p className="text-gray-800">🆔 รหัสผู้ใช้: {item.userID}</p>
                <p className="text-gray-800">👤 ผู้ใช้: {item.borrowerName}</p>
                <p className="text-gray-800">
                  📅 คืนภายใน: {dayjs(item.endDate).format("DD-MM-YYYY")}
                </p>
                <p className="text-red-600 font-semibold flex items-center">
                  <AlertCircle size={18} className="mr-1" /> {item.status}
                </p>
              </div>
              {/* ปุ่มสำหรับคืนอุปกรณ์ (สำหรับรายการยืม) */}
              <button 
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-yellow-600 transition"
                onClick={() => updateStatus(item.borrowID, "borrow", "return")}
              >
                🔄 คืนอุปกรณ์
              </button>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-600">ไม่พบรายการยืมที่เลยกำหนด</p>
        )}
      </div>

      {/* ส่วนแสดงรายการการจองที่เลยกำหนด */}
      <div className="w-full max-w-3xl space-y-4 mt-6">
        <h3 className="text-xl font-semibold text-gray-800">📌 รายการจองที่เลยกำหนด</h3>
        {loading ? (
          <p className="text-center text-gray-600">⏳ กำลังโหลด...</p>
        ) : filteredReservationRequests.length > 0 ? (
          filteredReservationRequests.map((item) => (
            <motion.div
              key={item.reservationID}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-6 shadow-lg rounded-lg flex items-center hover:shadow-2xl transition"
            >
              <img
                src={item.image}
                alt={item.equipmentName}
                className="w-24 h-24 object-cover rounded-lg border mr-4"
              />
              <div className="flex-1 px-4">
                <p className="font-bold text-lg">
                  {item.equipmentName} ({item.equipment_code})
                </p>
                <p className="text-gray-800">🆔 รหัสผู้ใช้: {item.userID}</p>
                <p className="text-gray-800">👤 ผู้จอง: {item.reserverName}</p>
                <p className="text-gray-800">
                  📅 วันจอง: {dayjs(item.startDate).format("DD-MM-YYYY HH:mm")}
                </p>
                <p className="text-gray-800">
                  📅 วันคืน: {dayjs(item.endDate).format("DD-MM-YYYY")}
                </p>
                <p className="text-red-600 font-semibold flex items-center">
                  <AlertCircle size={18} className="mr-1" /> {item.status}
                </p>
              </div>
              {/* ปุ่มสำหรับคืนอุปกรณ์ (สำหรับรายการจอง) */}
              <button 
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-yellow-600 transition"
                onClick={() => updateStatus(item.reservationID, "reservation", "return")}
              >
                🔄 คืนอุปกรณ์
              </button>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-600">ไม่พบรายการจองที่เลยกำหนด</p>
        )}
      </div>
    </div>
  );
}
