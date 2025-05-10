"use client";

import { useState, useEffect } from "react";
import { Search, ArrowLeft, Download ,Loader2} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);

export default function ApprovedReservationPage() {
  const [searchTerm, setSearchTerm] = useState("");
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
        const reservationRes = await fetch("/api/view-reservation");
        const reservationData = await reservationRes.json();
        if (reservationData.success) {
          setReservationRequests(reservationData.data);
        }
      } catch (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูล:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, []);

    // Full-screen loader
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-200 to-indigo-600">
        <Loader2 size={64} className="animate-spin text-white" />
      </div>
    );
  }

  // กรองเฉพาะรายการจองที่มีสถานะ "Approved"
  const filteredReservationRequests = reservationRequests.filter(
    (item) =>
      item.status === "Approved" &&
      (item.reserverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.userID.toString().includes(searchTerm))
  );

  // เพิ่มการนิยาม updateStatus ใน component นี้
  const updateStatus = async (id, type, action) => {
    let confirmMessage = "";
    let newStatus = "";
  
    if (action === "approve") {
      // สำหรับการยืม ถ้าอนุมัติ ให้เปลี่ยนเป็น "Borrowed"
      // สำหรับการจอง ถ้าอนุมัติ (แต่ไม่ได้รับอุปกรณ์แล้ว) ให้เปลี่ยนเป็น "Approved"
      confirmMessage = "คุณต้องการอนุมัติรายการนี้หรือไม่?";
      newStatus = type === "borrow" ? "Borrowed" : "Approved";
    } else if (action === "confirm") {
      // สำหรับการจอง เมื่อผู้จองรับอุปกรณ์แล้ว
      confirmMessage = "คุณต้องการยืนยันว่ามารับอุปกรณ์แล้วหรือไม่?";
      newStatus = "Borrowed";
    } else if (action === "reject" || action === "cancel") {
      confirmMessage = "คุณต้องการปฏิเสธรายการนี้หรือไม่?";
      newStatus = "Rejected";
    }
  
    if (!confirm(confirmMessage)) return;
  
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

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-200 to-indigo-600 flex flex-col items-center">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl bg-white p-4 shadow-lg flex items-center justify-between rounded-lg mb-6"
      >
        <div className="flex items-center">
          <button onClick={handleBack} className="text-blue-500 mr-2">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">
            📌 รายการจองที่ได้รับอนุมัติ
          </h2>
        </div>
      </motion.div>

      {/* ค้นหา */}
      <div className="w-full max-w-3xl bg-white p-4 shadow-md rounded-lg mb-6 flex items-center">
        <input
          type="text"
          placeholder="🔍 ค้นหาชื่อผู้จองหรือรหัสผู้ใช้..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border p-3 rounded-l border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition">
          <Search size={20} />
        </button>
      </div>

      {/* รายการจองที่ได้รับอนุมัติ */}
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
                <p className="text-gray-800">
                  ⚠ หมายเหตุ: {item.usageReason || "ไม่มี"}
                </p>
                <p className="text-gray-800">
                  📍 ที่เก็บอุปกรณ์: {item.location || "ไม่ระบุ"}
                </p>
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

              <motion.button
  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
  onClick={() =>
    updateStatus(item.reservationID, "reservation", "confirm")
  }
>
  ✅ รับอุปกรณ์แล้ว
</motion.button>
<motion.button
  className="bg-red-400 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition ml-2"
  onClick={() =>
    updateStatus(item.reservationID, "reservation", "reject")
  }
>
  ❌ ปฏิเสธ
</motion.button>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-600">
            ⏳ ไม่พบรายการจองที่ได้รับอนุมัติ
          </p>
        )}
      </div>
    </div>
  );
}
