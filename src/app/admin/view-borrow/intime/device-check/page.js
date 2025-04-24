"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(localizedFormat);

export default function DeviceCheckPage() {
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [reservationRequests, setReservationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [status, setStatus] = useState(""); // สถานะอุปกรณ์
  const router = useRouter();
  const searchParams = useSearchParams();

  // รับ query parameters ที่ส่งมาจากหน้าก่อนหน้า
  const queryType = searchParams.get("type"); // 'borrow' หรือ 'reservation'
  const queryId = searchParams.get("id");    // id ของรายการ

  const handleBack = () => {
    router.back();
  };

  // ฟังก์ชันสำหรับตรวจสอบสถานะของอุปกรณ์
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
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

  // กรองเฉพาะรายการที่มีสถานะ Borrowed
  const borrowedBorrowRequests = borrowRequests.filter(
    (item) => item.status === "Borrowed"
  );
  const borrowedReservationRequests = reservationRequests.filter(
    (item) => item.status === "Borrowed"
  );

  // ค้นหารายการที่ตรงกับ query parameters
  useEffect(() => {
    let selectedItem = null;
    if (queryType && queryId) {
      if (queryType === "borrow") {
        selectedItem = borrowedBorrowRequests.find(
          (item) => item.borrowID.toString() === queryId
        );
      } else if (queryType === "reservation") {
        selectedItem = borrowedReservationRequests.find(
          (item) => item.reservationID.toString() === queryId
        );
      }
    }
    if (selectedItem) {
      setSelectedItem(selectedItem);
    }
  }, [queryType, queryId, borrowedBorrowRequests, borrowedReservationRequests]);

  // ฟังก์ชันสำหรับอัปเดตสถานะอุปกรณ์
  const handleDeviceCheck = async () => {
    if (!selectedItem) return;

    // ส่งข้อมูลไปอัปเดตสถานะอุปกรณ์
    try {
      const response = await fetch("/api/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedItem.borrowID || selectedItem.reservationID,
          type: queryType,
          action: "return", // อัพเดตเป็นการคืนอุปกรณ์
          status, // สถานะใหม่ที่เลือก เช่น "Available", "Repair", "Damaged"
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`อัปเดตสถานะอุปกรณ์สำเร็จ!`);
        router.push("/admin/view-borrow");
      } else {
        alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ:", error);
      alert("ไม่สามารถอัปเดตสถานะได้");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-400 to-blue-200 flex flex-col items-center">
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
          <h2 className="text-lg font-semibold text-gray-800">ตรวจสอบอุปกรณ์</h2>
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
          <p className="text-blue-600 font-semibold flex items-center">
            <AlertCircle size={18} className="mr-1" /> {selectedItem.status}
          </p>

          <hr className="my-4" />

          {/* ตรวจสอบสถานะอุปกรณ์ */}
          <div className="mt-4">
            <p className="font-semibold text-gray-800">สถานะของอุปกรณ์:</p>
            <div className="flex space-x-4">
              <button
                onClick={() => handleStatusChange("สมบูรณ์")}
                className={`px-4 py-2 rounded-lg ${
                  status === "สมบูรณ์" ? "bg-green-500" : "bg-gray-300"
                } text-white`}
              >
                สมบูรณ์
              </button>
              <button
                onClick={() => handleStatusChange("ซ่อม")}
                className={`px-4 py-2 rounded-lg ${
                  status === "ซ่อม" ? "bg-yellow-500" : "bg-gray-300"
                } text-white`}
              >
                ซ่อม
              </button>
              <button
                onClick={() => handleStatusChange("พัง")}
                className={`px-4 py-2 rounded-lg ${
                  status === "พัง" ? "bg-red-500" : "bg-gray-300"
                } text-white`}
              >
                พัง
              </button>
            </div>
          </div>

          {/* ปุ่มคืนอุปกรณ์ */}
          <button
          onClick={handleDeviceCheck}
           disabled={!status}
           className={`mt-4 w-full py-2 rounded-lg text-white transition
             ${status
               ? "bg-green-500 hover:bg-green-600 cursor-pointer"
               : "bg-gray-400 cursor-not-allowed"
             }`}
         >
           ตรวจสอบอุปกรณ์
         </button>
        </div>
      ) : (
        <p className="text-center text-gray-600">ไม่พบข้อมูลอุปกรณ์ที่เลือก</p>
      )}
    </div>
  );
}
