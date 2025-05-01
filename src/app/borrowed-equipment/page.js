"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Search, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import NavigationBar from "@/app/components/NavigationBar";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);

export default function BorrowedEquipmentPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [reservationRequests, setReservationRequests] = useState([]);
  const [loading, setLoading] = useState(true);


  // ฟังก์ชันสำหรับอัปเดตสถานะ (สำหรับปุ่ม "ยกเลิกการจอง")
  const updateStatus = async (id, type, action) => {
    if (!confirm("คุณต้องการยกเลิกการจองสำหรับรายการนี้หรือไม่?")) return;
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

  // รวมข้อมูลจากการยืมและการจอง
  const combinedRequests = [...borrowRequests, ...reservationRequests];

  // กรองเฉพาะรายการที่มีสถานะเป็น Pending, Approved, Borrowed, หรือ Overdue
  let filteredRequests = combinedRequests.filter((item) =>
    ["Pending", "Approved", "Borrowed", "Overdue"].includes(item.status) &&
    ((item.equipmentName || "").toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // ถ้ามี session ให้กรองเฉพาะรายการที่ตรงกับ userID ที่เข้าสู่ระบบ
  if (session && session.user && session.user.id) {
    filteredRequests = filteredRequests.filter(
      (item) => item.userID.toString() === session.user.id.toString()
    );
  }

  // mapping สถานะจากภาษาอังกฤษเป็นภาษาไทย
  const statusMap = {
    Pending: "รออนุมัติ",
    Approved: "มารับอุปกรณ์",
    Borrowed: "กำลังยืมอุปกรณ์",
    Overdue: "เลยกำหนดการยืม"
  };

  const statusClasses = {
    Pending: "bg-yellow-100 text-yellow-800",
    Approved: "bg-blue-100 text-blue-800",
    Borrowed: "bg-green-100 text-green-800",
    Overdue: "bg-red-100 text-red-800"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center p-6 pb-24 w-full">
      {/* Header */}
      <div className="w-full max-w-4xl p-4 bg-white shadow-lg flex items-center justify-between rounded-lg">
        <h2 className="text-2xl font-bold text-blue-700">📦 รายการอุปกรณ์</h2>
      </div>

      {/* Search */}
      <div className="w-full max-w-4xl mt-6 flex items-center bg-white p-4 shadow-md rounded-lg">
        <input
          type="text"
          placeholder="🔍 ค้นหาชื่ออุปกรณ์"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border p-3 rounded-l focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition">
          <Search size={20} />
        </button>
      </div>

      {/* แสดงรายการอุปกรณ์ทั้งหมด */}
      <div className="w-full max-w-4xl mt-6 space-y-6">
        {loading ? (
          <p className="text-center text-gray-600">กำลังโหลด...</p>
        ) : filteredRequests.length > 0 ? (
          filteredRequests.map((item) => {
            // กำหนดประเภท: ถ้ามี borrowerName แปลว่าเป็นการยืม, ไม่เช่นนั้นเป็นการจอง
            const type = item.borrowerName ? "borrow" : "reservation";
            const userName = item.borrowerName || item.reserverName || "";
            // สำหรับรายการการจอง ให้แสดงทั้งวันจอง (startDate) และวันรับคืน (endDate)
            // สำหรับรายการการยืม ให้แสดงวันรับคืน (endDate หรือ dueDate)
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
                      📅 วันรับคืน: {dayjs(item.endDate).format("DD-MM-YYYY")}
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

            return (
              <motion.div
                key={
                  type === "borrow"
                    ? `borrow-${item.borrowID}`
                    : `reservation-${item.reservationID}`
                }
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
                  <p className="text-gray-800">🏷️ ยี่ห้อ: {item.brand}</p>
                  <p className="text-gray-800">🆔 รหัสผู้ใช้: {item.userID}</p>
                  <p className="text-gray-800">👤 ผู้ใช้: {userName}</p>
                  {dateInfo}
                  <p className="text-gray-800">
                    <span className={`inline-flex items-center px-3 py-1 font-semibold rounded-full shadow-sm  ${statusClasses[item.status]}`}>{statusMap[item.status]}</span>
                  </p>
                </div>
                {/* แสดงปุ่ม "ยกเลิกการจอง" เฉพาะสำหรับรายการการจองที่มีสถานะ Pending หรือ Approved */}
                {type === "reservation" &&
                  (item.status === "Pending" || item.status === "Approved") && (
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600 transition"
                      onClick={() =>
                        updateStatus(item.reservationID, "reservation", "reject")
                      }
                    >
                      ❌ ยกเลิกการจอง
                    </button>
                  )}
              </motion.div>
            );
          })
        ) : (
          <p className="text-center text-gray-600">ไม่พบรายการอุปกรณ์</p>
        )}
      </div>

      {/* Navigation Bar */}
      <NavigationBar />
    </div>
  );
}
