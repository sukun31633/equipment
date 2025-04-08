"use client";

import { useState, useEffect } from 'react';
import Image from "next/image";
import { Search, ArrowLeft, Clock, Package, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminNavigationBar from "@/app/components/AdminNavigationBar";
import { motion } from "framer-motion";
import dayjs from "dayjs";

const statusMap = {
  Pending: "รออนุมัติ",
  Approved: "มารับอุปกรณ์",
  Borrowed: "กำลังยืมอุปกรณ์",
  Overdue: "เลยกำหนดการยืม",
  Returned: "คืนแล้ว",
  Rejected: "ถูกปฏิเสธ"
};

export default function BorrowedEquipmentPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [reservationRequests, setReservationRequests] = useState([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // ดึงข้อมูลจาก API ทั้งสอง
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

  // รวมข้อมูลจากการยืมและการจอง
  const combinedRequests = [...borrowRequests, ...reservationRequests];

  // กรองเฉพาะรายการที่มีสถานะเป็น Pending, Approved, Borrowed, Overdue, Returned, Rejected
  const allowedStatuses = ["Pending", "Approved", "Borrowed", "Overdue", "Returned", "Rejected"];
  const filteredRequests = combinedRequests.filter((item) =>
    allowedStatuses.includes(item.status) &&
    (
      ((item.borrowerName || item.reserverName) || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      item.userID.toString().includes(searchTerm)
    )
  );

  // ฟังก์ชันสำหรับลบข้อมูลทั้งหมด (ทั้งตาราง borrowing และ reservation)
  const handleDeleteAll = async () => {
    if (!confirm("⚠️ คุณต้องการลบข้อมูลทั้งหมดหรือไม่?")) return;
    try {
      const res = await fetch("/api/delete-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        window.location.reload();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดในการลบข้อมูล:", error);
      alert("❌ เกิดข้อผิดพลาดในการลบข้อมูล");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center p-6 pb-24 w-full">
      {/* Header */}
      <div className="w-full max-w-4xl p-4 bg-white shadow-lg flex items-center justify-between rounded-lg">

        <h2 className="text-2xl font-bold text-blue-700">📦 รายการอุปกรณ์</h2>
      </div>

      {/* Status Filters (คงเดิม) */}
      <div className="flex justify-around w-full max-w-4xl bg-white shadow-md p-3 rounded-lg mt-6">
        {[
          { label: "รออนุมัติ", icon: Clock, path: "pending-approval", color: "text-yellow-500" },
          { label: "รอรับอุปกรณ์", icon: Package, path: "waiting-for-delivery", color: "text-blue-500" },
          { label: "อยู่ในกำหนด", icon: CheckCircle, path: "intime", color: "text-green-500" },
          { label: "เลยกำหนด", icon: AlertCircle, path: "overdue", color: "text-red-500" },
        ].map(({ label, icon: Icon, path, color }, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`${color} flex flex-col items-center font-semibold text-sm hover:text-blue-700 transition-all`}
            onClick={() => router.push(`/admin/view-borrow/${path}`)}
          >
            <Icon size={28} className="mb-1" />
            {label}
          </motion.button>
        ))}
      </div>

      {/* Search Bar + DeleteAll Button */}
      <div className="w-full max-w-4xl mt-6 bg-white p-4 shadow-md rounded-lg flex items-center gap-2">
        {/* ส่วน Search Bar */}
        <div className="flex items-center flex-1">
          <input
            type="text"
            placeholder="🔍 ค้นหาชื่ออุปกรณ์, ชื่อผู้ใช้ หรือรหัสผู้ใช้..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border p-3 rounded-l focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition">
            <Search size={20} />
          </button>
        </div>
        {/* ปุ่มลบข้อมูลทั้งหมด */}
        <button
          onClick={handleDeleteAll}
          className="flex items-center bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-600 transition"
        >
          <Trash2 size={20} className="mr-1" />
          ลบข้อมูลทั้งหมด (กรณีต้องการลบข้อมูลผู้ใช้งาน)
        </button>
      </div>

      {/* แสดงรายการอุปกรณ์ */}
      <div className="w-full max-w-4xl mt-6 space-y-6">
        {loading ? (
          <p className="text-center text-gray-600">กำลังโหลด...</p>
        ) : filteredRequests.length > 0 ? (
          filteredRequests.map((item) => {
            // กำหนดประเภท: ถ้ามี borrowerName แปลว่าเป็นการยืม, ไม่เช่นนั้นเป็นการจอง
            const type = item.borrowerName ? "borrow" : "reservation";
            const userName = item.borrowerName || item.reserverName || "";
            let dateInfo = null;
            if (type === "reservation") {
              dateInfo = (
                <>
                  {item.startDate && (
                    <p className="text-gray-800">
                      📅 วันจอง: {dayjs(item.startDate).format("DD-MM-YYYY HH:mm")}
                    </p>
                  )}
                  {item.endDate && (
                    <p className="text-gray-800">
                      📅 วันรับคืน: {dayjs(item.endDate).format("DD-MM-YYYY HH:mm")}
                    </p>
                  )}
                </>
              );
            } else {
              const returnDate = item.endDate || item.dueDate || "";
              if (returnDate) {
                dateInfo = (
                  <p className="text-gray-800">
                    📅 วันรับคืน: {dayjs(returnDate).format("DD-MM-YYYY")}
                  </p>
                );
              }
            }

            const key = type === "borrow" ? `borrow-${item.borrowID}` : `reservation-${item.reservationID}`;

            return (
              <motion.div
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-white p-6 shadow-xl rounded-xl flex items-center hover:shadow-2xl transition"
              >
                <div className="w-24 h-24 relative bg-gray-200 rounded-lg mr-6 flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.equipmentName}
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-lg">
                    {type === "borrow"
                      ? `หมายเลขการยืม: ${item.borrowID}`
                      : `หมายเลขการจอง: ${item.reservationID}`}
                  </p>
                  <p className="text-gray-800">
                    🔹 ชื่ออุปกรณ์: {item.equipmentName} ({item.equipment_code})
                  </p>
                  <p className="text-gray-800">🆔 รหัสผู้ใช้: {item.userID}</p>
                  <p className="text-gray-800">👤 ผู้ใช้: {userName}</p>
                  {dateInfo}
                  <p className="text-gray-800">
                    ⚠ สถานะ: {statusMap[item.status] || item.status}
                  </p>
                </div>
              </motion.div>
            );
          })
        ) : (
          <p className="text-center text-gray-600">ไม่พบรายการอุปกรณ์</p>
        )}
      </div>

      {/* Navigation Bar */}
      <AdminNavigationBar />
    </div>
  );
}
