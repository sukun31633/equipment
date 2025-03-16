"use client";

import { useState, useEffect } from "react";
import { Search, ArrowLeft, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);

export default function PendingApprovalPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [reservationRequests, setReservationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    async function fetchRequests() {
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

    fetchRequests();
  }, []);

  const updateStatus = async (id, type, action) => {
    if (!confirm(`คุณต้องการ${action === "approve" ? "อนุมัติ" : "ปฏิเสธ"} รายการนี้หรือไม่?`)) return;

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

  const filteredBorrowRequests = borrowRequests.filter(
    (item) =>
      item.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userID.toString().includes(searchTerm)
  );

  const filteredReservationRequests = reservationRequests.filter(
    (item) =>
      item.reserverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.userID.toString().includes(searchTerm)
  );

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-200 to-indigo-600 flex flex-col items-center">
      {/* 🔹 Header */}
      <div className="w-full max-w-3xl bg-white p-4 shadow-lg flex items-center justify-between rounded-lg mb-6">
        <div className="flex items-center">
          <button onClick={handleBack} className="text-blue-500 mr-2">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">🕒 รออนุมัติการยืม/จอง</h2>
        </div>
      </div>

      {/* 🔹 ค้นหา */}
      <div className="w-full max-w-3xl bg-white p-4 shadow-md rounded-lg mb-6 flex items-center">
        <input
          type="text"
          placeholder="🔍 ค้นหาชื่อผู้ใช้หรือรหัสผู้ใช้..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border p-3 rounded-l border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition">
          <Search size={20} />
        </button>
      </div>

      {/* 🔹 รายการการยืมที่รออนุมัติ */}
      <div className="w-full max-w-3xl space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">📌 รายการยืมที่รออนุมัติ</h3>
        {loading ? (
          <p>⏳ กำลังโหลด...</p>
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
                <p className="font-bold text-lg">{item.equipmentName} ({item.equipment_code})</p>
                <p className="text-gray-800">🆔 รหัสผู้ใช้: {item.userID}</p>
                <p className="text-gray-800">👤 ผู้ยืม: {item.borrowerName}</p>
                <p className="text-gray-800">📚 รหัสวิชา: {item.courseCode || "ไม่มีข้อมูล"}</p>
                <p className="text-gray-800">📜 รายละเอียด: {item.description || "ไม่มีข้อมูล"}</p>
                <p className="text-gray-800">📅 วันคืน: {dayjs(item.dueDate).format("DD-MM-YYYY")}</p>
                <p className="text-gray-800">⚠ หมายเหตุ: {item.usageReason || "ไม่มี"}</p>
                <p className="text-gray-800">📍 ที่เก็บอุปกรณ์: {item.location || "ไม่ระบุ"}</p>

                {/* 🔹 ปุ่มดาวน์โหลดเอกสาร */}
                {item.document && (
                  <a
                    href={item.document}
                    download
                    className="text-blue-500 flex items-center mt-2 hover:text-blue-700 transition"
                  >
                    <Download size={20} className="mr-1" /> ดาวน์โหลดเอกสาร
                  </a>
                )}
              </div>

              {/* 🔹 ปุ่มอนุมัติ */}
              <motion.button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                onClick={() => updateStatus(item.borrowID, "borrow", "approve")}>
                ✅ อนุมัติ
              </motion.button>
              <motion.button className="bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition ml-2"
                onClick={() => updateStatus(item.borrowID, "borrow", "reject")}>
                ❌ ปฏิเสธ
              </motion.button>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-600">⏳ ไม่พบข้อมูลการยืมที่รออนุมัติ</p>
        )}
      </div>

      {/* 🔹 รายการการจองที่รออนุมัติ */}
<div className="w-full max-w-3xl space-y-4 mt-6">
  <h3 className="text-xl font-semibold text-gray-800">📌 รายการจองที่รออนุมัติ</h3>
  {loading ? (
    <p>⏳ กำลังโหลด...</p>
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
          <p className="font-bold text-lg">{item.equipmentName} ({item.equipment_code})</p>
          <p className="text-gray-800">🆔 รหัสผู้ใช้: {item.userID}</p>
          <p className="text-gray-800">👤 ผู้จอง: {item.reserverName}</p>
          <p className="text-gray-800">📚 รหัสวิชา: {item.courseCode || "ไม่มีข้อมูล"}</p>
          <p className="text-gray-800">📜 รายละเอียด: {item.description || "ไม่มีข้อมูล"}</p>
          <p className="text-gray-800">📅 วันจอง: {dayjs(item.startDate).format("DD-MM-YYYY HH:mm")}</p>
          <p className="text-gray-800">📅 วันคืน: {dayjs(item.endDate).format("DD-MM-YYYY")}</p>
          <p className="text-gray-800">⚠ หมายเหตุ: {item.usageReason || "ไม่มี"}</p>
          <p className="text-gray-800">📍 ที่เก็บอุปกรณ์: {item.location || "ไม่ระบุ"}</p>

          {/* 🔹 ปุ่มดาวน์โหลดเอกสาร */}
          {item.document && (
            <a
              href={item.document}
              download
              className="text-blue-500 flex items-center mt-2 hover:text-blue-700 transition"
            >
              <Download size={20} className="mr-1" /> ดาวน์โหลดเอกสาร
            </a>
          )}
        </div>


        <motion.button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                onClick={() => updateStatus(item.reservationID, "reservation", "approve")}>
                ✅ อนุมัติ
              </motion.button>
              <motion.button className="bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition ml-2"
                onClick={() => updateStatus(item.reservationID, "reservation", "reject")}>
                ❌ ปฏิเสธ
        </motion.button>
              
      </motion.div>
    ))
  ) : (
    <p className="text-center text-gray-600">⏳ ไม่พบข้อมูลการจองที่รออนุมัติ</p>
  )}
</div>

    </div>
  );
}
