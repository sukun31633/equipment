"use client";

import { useState, useEffect } from "react";
import { Search, ArrowLeft, CheckCircle,Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);

export default function OverduePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [reservationRequests, setReservationRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // กดย้อนกลับ
  const handleBack = () => {
    history.back();
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const borrowRes = await fetch("/api/view-borrow");
        const { success: bSucc, data: bData } = await borrowRes.json();
        const reservationRes = await fetch("/api/view-reservation");
        const { success: rSucc, data: rData } = await reservationRes.json();

        if (bSucc) setBorrowRequests(bData);
        if (rSucc) setReservationRequests(rData);
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

    if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-200 to-indigo-600">
        <Loader2 size={64} className="animate-spin text-white" />
      </div>
    );
  }

  // กรองเฉพาะ status = Borrowed และตรงกับ searchTerm
  const filteredBorrowRequests = borrowRequests.filter(
    (item) =>
      item.status === "Borrowed" &&
      (item.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.userID.toString().includes(searchTerm))
  );
  const filteredReservationRequests = reservationRequests.filter(
    (item) =>
      item.status === "Borrowed" &&
      (item.reserverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.userID.toString().includes(searchTerm))
  );

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-400 to-blue-200 flex flex-col items-center">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl bg-white p-4 shadow-lg flex items-center rounded-lg mb-6"
      >
        <button onClick={handleBack} className="text-blue-500 mr-2">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-semibold text-gray-800">
          ⏰ รายการอุปกรณ์ที่อยู่ในกำหนด
        </h2>
      </motion.div>

      {/* Search */}
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

      {/* Borrow Requests */}
      <div className="w-full max-w-3xl space-y-4">
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
                <p className="text-green-600 font-semibold flex items-center">
                  <CheckCircle size={18} className="mr-1" /> {item.status}
                </p>
              </div>

              {/* ลิงก์ไปตรวจสอบอุปกรณ์ก่อนคืน */}
              <Link
  href={{
    pathname: "/admin/view-borrow/intime/device-check",  // เปลี่ยนให้ตรงกับ path ที่ถูกต้อง
    query: { type: "borrow", id: item.borrowID }, // ใช้ query parameters ตามที่ต้องการ
  }}
>
  <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition">
    🔄 ตรวจสอบอุปกรณ์ก่อนคืน
  </button>
</Link>

            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-600">
            ไม่พบรายการยืมที่ได้รับการยืนยันรับ
          </p>
        )}
      </div>

      {/* Reservation Requests */}
      <div className="w-full max-w-3xl space-y-4 mt-6">
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
                <p className="text-green-600 font-semibold flex items-center">
                  <CheckCircle size={18} className="mr-1" /> {item.status}
                </p>
              </div>

              {/* ลิงก์ไปตรวจสอบอุปกรณ์ก่อนคืน (สำหรับจอง) */}
              <Link
                href={{
                  pathname: "/admin/view-borrow/intime/device-check",
                  query: { type: "reservation", id: item.reservationID },
                }}
              >
                <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition">
                  🔄 ตรวจสอบอุปกรณ์ก่อนคืน
                </button>
              </Link>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-600">
            ไม่พบรายการจองที่ได้รับการยืนยันรับ
          </p>
        )}
      </div>
    </div>
  );
}
