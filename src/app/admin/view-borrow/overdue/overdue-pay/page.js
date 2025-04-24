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
  const [selectedItem, setSelectedItem] = useState(null);
  const [status, setStatus] = useState(""); // สถานะอุปกรณ์
  const [penaltyFee, setPenaltyFee] = useState(0); // ค่าปรับ
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryType = searchParams.get("type");
  const queryId = searchParams.get("id");

  const handleBack = () => router.back();

  const calculateOverdueDays = (endDateStr) => {
    const now = dayjs();
    const due = dayjs(endDateStr);
    return now.isAfter(due) ? now.diff(due, "day") : 0;
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [borrowRes, reservationRes] = await Promise.all([
          fetch("/api/view-borrow"),
          fetch("/api/view-reservation"),
        ]);
        const borrowData = await borrowRes.json();
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

  const overdueBorrow = borrowRequests.filter((i) => i.status === "Overdue");
  const overdueReserve = reservationRequests.filter((i) => i.status === "Overdue");

  useEffect(() => {
    let item = null;
    if (queryType === "borrow") {
      item = overdueBorrow.find((i) => i.borrowID.toString() === queryId);
    } else if (queryType === "reservation") {
      item = overdueReserve.find((i) => i.reservationID.toString() === queryId);
    }
    if (item) setSelectedItem(item);
  }, [queryType, queryId, overdueBorrow, overdueReserve]);

  useEffect(() => {
    if (selectedItem) {
      const days = calculateOverdueDays(selectedItem.endDate);
      setPenaltyFee(days * 50);
    }
  }, [selectedItem]);

  const handlePayment = async () => {
    if (!selectedItem) return;
    if (!status) {
      alert("❌ กรุณาเลือกสถานะอุปกรณ์ก่อนคืน");
      return;
    }
    if (!confirm(`คุณต้องการชำระค่าปรับ ${penaltyFee} บาท และคืนอุปกรณ์หรือไม่?`)) {
      return;
    }

    try {
      const res = await fetch("/api/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedItem.borrowID || selectedItem.reservationID,
          type: queryType,
          action: "return",
          status,            // ส่งสถานะอุปกรณ์มาด้วย
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`ชำระค่าปรับ ${penaltyFee} บาท สำเร็จ!`);
        router.push("/admin/view-borrow");
      } else {
        alert(data.message || "❌ เกิดข้อผิดพลาดในการคืนอุปกรณ์");
      }
    } catch (error) {
      console.error(error);
      alert("❌ ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-red-400 to-red-200 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl bg-white p-4 shadow-lg rounded-lg mb-6 flex items-center"
      >
        <button onClick={handleBack} className="text-red-500 mr-2">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-lg font-semibold text-gray-800">
          💰 ชำระค่าปรับ & คืนอุปกรณ์
        </h2>
      </motion.div>

      {loading ? (
        <p className="text-gray-600">⏳ กำลังโหลด...</p>
      ) : selectedItem ? (
        <div className="w-full max-w-3xl bg-white p-6 shadow-lg rounded-lg">
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
            👤 {queryType === "borrow" ? "ผู้ยืม" : "ผู้จอง"}:{" "}
            {selectedItem.borrowerName || selectedItem.reserverName}
          </p>
          <p className="text-gray-800">
            📅 กำหนดคืน: {dayjs(selectedItem.endDate).format("DD-MM-YYYY")}
          </p>
          <p className="text-red-600 flex items-center font-semibold">
            <AlertCircle size={18} className="mr-1" /> {selectedItem.status}
          </p>

          <hr className="my-4" />

          <div className="mb-4">
            <p className="text-gray-800">
              เกินกำหนด: <strong>{penaltyFee / 50}</strong> วัน
            </p>
            <p className="text-gray-800">
              ค่าปรับ: <strong>{penaltyFee}</strong> บาท
            </p>
          </div>

          <div className="mb-4">
            <p className="font-semibold text-gray-800">สถานะอุปกรณ์:</p>
            <div className="flex space-x-4">
              {["สมบูรณ์", "ซ่อม", "พัง"].map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  className={`px-4 py-2 rounded-lg text-white ${
                    status === s ? (s === "สมบูรณ์" ? "bg-green-500" :
                                    s === "ซ่อม" ? "bg-yellow-500" : "bg-red-500")
                                 : "bg-gray-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={!status}
            className={`mt-4 w-full py-2 rounded-lg text-white ${
              status
                ? "bg-green-500 hover:bg-green-600 transition"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            ชำระค่าปรับ & คืนอุปกรณ์
          </button>
        </div>
      ) : (
        <p className="text-gray-600">ไม่พบข้อมูลอุปกรณ์</p>
      )}
    </div>
  );
}
