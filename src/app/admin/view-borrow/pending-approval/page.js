"use client";

import { useState, useEffect } from "react";
import { Search, ArrowLeft, Download, Loader2 } from "lucide-react";
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
  const [loadingAction, setLoadingAction] = useState({ id: null, action: null });
  const router = useRouter();

  const handleBack = () => router.back();

  useEffect(() => {
    async function fetchRequests() {
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
      } catch (err) {
        console.error("Error fetching:", err);
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

  const filteredBorrow = borrowRequests.filter(
    (it) =>
      it.status === "Pending" &&
      (it.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        it.userID.toString().includes(searchTerm))
  );
  const filteredReserve = reservationRequests.filter(
    (it) =>
      it.status === "Pending" &&
      (it.reserverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        it.userID.toString().includes(searchTerm))
  );

  const updateStatus = async (id, type, action, userID, equipmentName) => {
    const ok = confirm(
      action === "approve"
        ? "คุณต้องการอนุมัติรายการนี้หรือไม่?"
        : "คุณต้องการปฏิเสธรายการนี้หรือไม่?"
    );
    if (!ok) return;

    let reason = "";
    if (action === "reject") {
      reason = prompt("กรุณากรอกหมายเหตุในการปฏิเสธรายการนี้:")?.trim() || "";
      if (!reason) {
        alert("❌ คุณต้องกรอกหมายเหตุก่อนปฏิเสธ");
        return;
      }
    }

    setLoadingAction({ id, action });
    try {
      const url = action === "approve" ? "/api/update-status" : "/api/reject-request";
      const body = action === "approve"
        ? { id, type, action }
        : { id, type, reason };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (data.success) {
        // notify
        await fetch("/api/notifications/approvalStatus", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userID,
            equipmentName,
            status: action === "approve" ? "approved" : "rejected",
            type,
          }),
        });
        alert(data.message);
        window.location.reload();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("❌ ไม่สามารถอัปเดตสถานะได้");
    } finally {
      setLoadingAction({ id: null, action: null });
    }
  };

  const renderItem = (item, idKey, nameKey, type) => (
    <motion.div
      key={item[idKey]}
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
        <p className="text-gray-800">
          👤 {type === "borrow" ? item.borrowerName : item.reserverName}
        </p>
        {type === "borrow" && (
          <>
            <p className="text-gray-800">
              📚 รหัสวิชา: {item.courseCode || "ไม่มีข้อมูล"}
            </p>
            <p className="text-gray-800">
              📜 รายละเอียด: {item.description || "ไม่มีข้อมูล"}
            </p>
          </>
        )}
        <p className="text-gray-800">
          📅 {type === "borrow"
            ? `วันคืน: ${dayjs(item.endDate).format("DD-MM-YYYY")}`
            : `วันจอง: ${dayjs(item.startDate).format("DD-MM-YYYY HH:mm")}`}
        </p>
        {type === "reservation" && (
          <p className="text-gray-800">
            📅 วันคืน: {dayjs(item.endDate).format("DD-MM-YYYY")}
          </p>
        )}
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
      {["approve", "reject"].map((act) => (
        <motion.button
          key={act}
          disabled={loadingAction.id === item[idKey]}
          className={`flex items-center px-4 py-2 rounded-lg ml-2 transition ${
            loadingAction.id === item[idKey] && loadingAction.action === act
              ? "cursor-wait " + (act === "approve" ? "bg-green-400" : "bg-red-300")
              : act === "approve"
              ? "bg-green-500 hover:bg-green-600"
              : "bg-red-400 hover:bg-red-600"
          } text-white`}
          onClick={() =>
            updateStatus(
              item[idKey],
              type,
              act,
              item.userID,
              item.equipmentName
            )
          }
        >
          {loadingAction.id === item[idKey] && loadingAction.action === act ? (
            <Loader2 className="animate-spin mr-2" size={18} />
          ) : null}
          {loadingAction.id === item[idKey] && loadingAction.action === act
            ? act === "approve"
              ? "กำลังอนุมัติ..."
              : "กำลังปฏิเสธ..."
            : act === "approve"
            ? "✅ อนุมัติ"
            : "❌ ปฏิเสธ"}
        </motion.button>
      ))}
    </motion.div>
  );

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-blue-200 to-indigo-600 flex flex-col items-center">
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
            🕒 รายการยืม/จองที่รออนุมัติ
          </h2>
        </div>
      </motion.div>

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

      <div className="w-full max-w-3xl space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">📌 รายการยืมที่รออนุมัติ</h3>
        {loading
          ? <p className="text-center text-gray-600">⏳ กำลังโหลด...</p>
          : filteredBorrow.map((it) => renderItem(it, "borrowID", "borrowerName", "borrow"))
        }
      </div>

      <div className="w-full max-w-3xl space-y-4 mt-6">
        <h3 className="text-xl font-semibold text-gray-800">📌 รายการจองที่รออนุมัติ</h3>
        {loading
          ? <p className="text-center text-gray-600">⏳ กำลังโหลด...</p>
          : filteredReserve.map((it) => renderItem(it, "reservationID", "reserverName", "reservation"))
        }
      </div>
    </div>
  );
}
