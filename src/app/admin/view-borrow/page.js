"use client";

import { useState, useEffect } from 'react';
import Image from "next/image";
import { Search, ArrowLeft, Clock, Package, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import AdminNavigationBar from "@/app/components/AdminNavigationBar";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { Loader2 } from "lucide-react";  // ← เพิ่ม Loader2 สำหรับ spinner

const statusMap = {
  Pending: "รออนุมัติ",
  Approved: "มารับอุปกรณ์",
  Borrowed: "กำลังยืมอุปกรณ์",
  Overdue: "เลยกำหนดการยืม",
  Returned: "คืนแล้ว",
  Rejected: "ถูกปฏิเสธ"
};
  // เพิ่มคลาสสีของ badge ตามสถานะ
  const statusClasses = {
    Pending: "bg-yellow-100 text-yellow-800",
    Approved: "bg-blue-100 text-blue-800",
    Borrowed: "bg-green-100 text-green-800",
    Overdue: "bg-red-100 text-red-800",
    Returned: "bg-gray-100 text-gray-800",
    Rejected: "bg-pink-100 text-pink-800"
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

    // ขณะที่กำลังโหลด แสดง spinner เต็มหน้าจอ
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-indigo-600">
        <Loader2 size={64} className="animate-spin text-white" />
      </div>
    );
  }

  // รวมข้อมูลจากการยืมและการจอง
  const combinedRequests = [...borrowRequests, ...reservationRequests];
const allowedStatuses = ["Pending", "Approved", "Borrowed", "Overdue", "Returned", "Rejected"];
const lowerSearch = searchTerm.toLowerCase();
const filteredRequests = combinedRequests.filter((item) => {
  // เฉพาะสถานะที่ต้องการ
  if (!allowedStatuses.includes(item.status)) return false;

  // เตรียมข้อความสำหรับค้นหา
  const eqName   = (item.equipmentName   || "").toLowerCase();
  const userName = (item.borrowerName || item.reserverName || "").toLowerCase();
  const userId   = item.userID.toString().toLowerCase();

  // ตรวจสอบคำค้นใน 3 ฟิลด์
  return (
    eqName.includes(lowerSearch) ||
    userName.includes(lowerSearch) ||
    userId.includes(lowerSearch)
  );
});

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
      <div>
    <h2 className="text-2xl font-bold text-blue-700">📦 รายการอุปกรณ์</h2>
  </div>
      <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xl font-medium">
    หน้าสำหรับ: เจ้าหน้าที่
  </div>
  <button
    onClick={() => {
      localStorage.clear();  // เคลียร์ข้อมูลใน localStorage
      router.push("/"); // กลับหน้า login
    }}
    className="text-sm bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
  >
    ออกจากระบบ
  </button>
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
            {/* ปุ่มดูประวัติผู้ใช้ */}
    <button
      onClick={() =>
        router.push(`/admin/view-borrow/user-history`)
      }
      className="flex items-center bg-indigo-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-indigo-600 transition"
    >
      <ArrowLeft className="transform rotate-180 mr-2" size={16} />
      ประวัติผู้ใช้
    </button>
        {/* ปุ่มลบข้อมูลทั้งหมด */}
        <button
          onClick={handleDeleteAll}
          className="flex items-center bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-600 transition"
        >
          <Trash2 size={20} className="mr-1" />
          ลบรายการข้อมูลทั้งหมด
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

      // ตรวจสอบว่าหากเป็นการจองจะแสดงวันเริ่มและวันรับคืน
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
                📅 วันรับคืน: {dayjs(item.endDate).format("DD-MM-YYYY ")}
              </p>
            )}
          </>
        );
      } else {
        const returnDate = item.endDate || item.dueDate || "";
        
        // แสดงวันเริ่มยืมก่อนวันรับคืน
        const startDate = item.startDate || "";
        if (startDate) {
          dateInfo = (
            <>
              <p className="text-gray-800">
                📅 วันเริ่มยืม: {dayjs(startDate).format("DD-MM-YYYY")}
              </p>
              {returnDate && (
                <p className="text-gray-800">
                  📅 วันรับคืน: {dayjs(returnDate).format("DD-MM-YYYY")}
                </p>
              )}
            </>
          );
        } else if (returnDate) {
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
            <span className={`inline-flex items-center px-3 py-1 font-semibold rounded-full shadow-sm ${statusClasses[item.status]}`}>
                      {statusMap[item.status] || item.status}
                    </span>
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
