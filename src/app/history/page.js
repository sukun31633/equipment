"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import NavigationBar from "../components/NavigationBar";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";

const statusMap = {
  Returned: "คืนแล้ว",
  Rejected: "ถูกปฏิเสธ",
};

export default function BorrowingHistoryPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [borrowRequests, setBorrowRequests] = useState([]);
  const [reservationRequests, setReservationRequests] = useState([]);
  const [loading, setLoading] = useState(true);



  // ฟังก์ชันดึงข้อมูลจาก API ทั้งสอง
  const fetchData = async () => {
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
  };

  useEffect(() => {
    fetchData();
  }, []);

  // รวมข้อมูลจากทั้งการยืมและการจอง
  const combinedRequests = [...borrowRequests, ...reservationRequests];

  // กรองเฉพาะรายการที่มีสถานะ Returned หรือ Rejected
  let filteredRequests = combinedRequests.filter((item) =>
    ["Returned", "Rejected"].includes(item.status)
  );

  // ถ้ามี session ให้กรองเฉพาะรายการที่ตรงกับ userID ของผู้ใช้ที่เข้าสู่ระบบ
  if (session && session.user && session.user.id) {
    filteredRequests = filteredRequests.filter(
      (item) => item.userID.toString() === session.user.id.toString()
    );
  }

  // ฟิลเตอร์เพิ่มเติมจาก searchTerm โดยค้นหาจากชื่ออุปกรณ์หรือรหัสผู้ใช้
  filteredRequests = filteredRequests.filter((item) => {
    const equipmentName = item.equipmentName.toLowerCase();
    const lowerSearch = searchTerm.toLowerCase();
    return equipmentName.includes(lowerSearch) ;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center p-6 pb-24 w-full">
      {/* Header */}
      <div className="w-full max-w-4xl p-4 bg-white shadow-lg flex items-center justify-between rounded-lg">
        <h2 className="text-2xl font-bold text-blue-700">📜 ประวัติการยืม</h2>
      </div>

      {/* Search Bar */}
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

      {/* Display Borrowing History */}
      <div className="w-full max-w-4xl mt-6 space-y-6">
        {loading ? (
          <p className="text-center text-gray-600">กำลังโหลด...</p>
        ) : filteredRequests.length > 0 ? (
          filteredRequests.map((item) => {
            // กำหนดประเภท: ถ้ามี borrowerName แปลว่าเป็นการยืม, ไม่เช่นนั้นเป็นการจอง
            const type = item.borrowerName ? "borrow" : "reservation";
            const userName = item.borrowerName || item.reserverName || "";
            // สำหรับการยืม ให้แสดงวันรับคืน (endDate หรือ dueDate)
            // สำหรับการจอง ให้แสดงวันจอง (startDate) และวันรับคืน (endDate)
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
                  {item.status === "Rejected" ? (
  <p className="mt-2 text-red-600">
    📌 เหตุผล: {item.rejection_reason || "ไม่มีรายละเอียดเพิ่มเติม"}
  </p>
) : null}


                </div>
              </motion.div>
            );
          })
        ) : (
          <p className="text-center text-gray-600">ไม่พบประวัติการยืม</p>
        )}
      </div>

      {/* Navigation Bar */}
      <NavigationBar />
    </div>
  );
}
