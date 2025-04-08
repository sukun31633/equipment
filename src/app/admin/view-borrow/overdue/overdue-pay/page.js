"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);

export default function OverduePayPage() {
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [reservationRequests, setReservationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  // รับ query parameters ที่ส่งมาจากหน้าก่อนหน้า
  const queryType = searchParams.get("type");
  const queryId = searchParams.get("id");

  const handleBack = () => {
    router.back();
  };

  // ดึงข้อมูลจาก API เมื่อ component mount
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

  // กรองเฉพาะรายการที่มีสถานะ Overdue
  const overdueBorrowRequests = borrowRequests.filter(
    (item) => item.status === "Overdue"
  );
  const overdueReservationRequests = reservationRequests.filter(
    (item) => item.status === "Overdue"
  );

  // ค้นหารายการที่ตรงกับ query parameters
  let selectedItem = null;
  if (queryType && queryId) {
    if (queryType === "borrow") {
      selectedItem = overdueBorrowRequests.find(
        (item) => item.borrowID.toString() === queryId
      );
    } else if (queryType === "reservation") {
      selectedItem = overdueReservationRequests.find(
        (item) => item.reservationID.toString() === queryId
      );
    }
  }

  // ฟังก์ชันคำนวณจำนวนวันที่เกินกำหนด
  const calculateOverdueDays = (endDateStr) => {
    const now = dayjs();
    const due = dayjs(endDateStr);
    if (now.isAfter(due)) {
      return now.diff(due, "day");
    }
    return 0;
  };

  let overdueDays = 0;
  let penaltyFee = 0;
  if (selectedItem) {
    overdueDays = calculateOverdueDays(selectedItem.endDate);
    penaltyFee = overdueDays * 50;
  }

  // ฟังก์ชันสำหรับชำระค่าปรับ
  const handlePayment = async () => {
    if (!selectedItem) return;
    if (!confirm(`คุณต้องการชำระค่าปรับรวม ${penaltyFee} บาทหรือไม่?`)) return;
  
    try {
      // เรียก API อัปเดตสถานะเป็น "Returned"
      const response = await fetch("/api/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedItem.borrowID || selectedItem.reservationID,
          type: queryType,  // borrow หรือ reservation
          action: "return"  // action สำหรับการคืน
        }),
      });
  
      const data = await response.json();
  
      if (data.success) {
        // แสดงข้อความแจ้งเตือนหากสำเร็จ
        alert(`ชำระค่าปรับ ${penaltyFee} บาทสำเร็จแล้ว!`);
        // นำทางไปยังหน้าที่ต้องการ (เช่น หน้า home หรือหน้าอื่นๆ)
        router.push("/admin/view-borrow");
      } else {
        alert(data.message || "เกิดข้อผิดพลาดในการชำระค่าปรับ");
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการชำระค่าปรับ:", error);
      alert("❌ ไม่สามารถชำระค่าปรับได้");
    }
  };

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
          <h2 className="text-lg font-semibold text-gray-800">💰 ชำระค่าปรับ</h2>
        </div>
      </motion.div>

      {loading ? (
        <p className="text-center text-gray-600">⏳ กำลังโหลด...</p>
      ) : selectedItem ? (
        <div className="w-full max-w-3xl bg-white p-6 shadow-lg rounded-lg">
          {/* แสดงรายละเอียดรายการที่เลือก */}
          <img
            src={selectedItem.image}
            alt={selectedItem.equipmentName}
            className="w-24 h-24 object-cover rounded-lg border mb-4"
          />
          <p className="font-bold text-lg">
            {selectedItem.equipmentName} ({selectedItem.equipment_code})
          </p>
          <p className="text-gray-800">🆔 รหัสผู้ใช้: {selectedItem.userID}</p>
          <p className="text-gray-800">
            👤 {queryType === "borrow" ? "ผู้ใช้" : "ผู้จอง"}:{" "}
            {selectedItem.borrowerName || selectedItem.reserverName}
          </p>
          <p className="text-gray-800">
            📅 กำหนดคืน: {dayjs(selectedItem.endDate).format("DD-MM-YYYY")}
          </p>
          <p className="text-red-600 font-semibold flex items-center">
            <AlertCircle size={18} className="mr-1" /> {selectedItem.status}
          </p>

          <hr className="my-4" />

          {/* แสดงจำนวนวันที่เกินและค่าปรับ */}
          <div>
            <p className="text-gray-800">
              จำนวนวันที่เกินกำหนด: <span className="font-bold">{overdueDays}</span> วัน
            </p>
            <p className="text-gray-800">
              ค่าปรับรวม: <span className="font-bold">{penaltyFee}</span> บาท
            </p>
          </div>

          <button
            onClick={handlePayment}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
          >
            ชำระค่าปรับ
          </button>
        </div>
      ) : (
        <p className="text-center text-gray-600">ไม่พบรายการที่เลือกสำหรับชำระค่าปรับ</p>
      )}
    </div>
  );
}
