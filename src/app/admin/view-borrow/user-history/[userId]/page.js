"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import dayjs from "dayjs";

const statusMap = {
  Pending:  "รออนุมัติ",
  Approved: "มารับอุปกรณ์",
  Borrowed: "กำลังยืมอุปกรณ์",
  Overdue:  "เลยกำหนดการยืม",
  Returned: "คืนแล้ว",
  Rejected: "ถูกปฏิเสธ"
};

export default function UserHistoryPage() {
  const router = useRouter();
  const { userId } = useParams();
  const [userInfo, setUserInfo] = useState(null);
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fmtDateOnly = iso => dayjs(iso).format("DD/MM/YYYY");
  const fmtDateTime = iso => dayjs(iso).format("DD/MM/YYYY HH:mm");

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    Promise.all([
      fetch("/api/view-userall").then(r => r.json()),
      fetch(`/api/user-history?userId=${userId}`).then(r => r.json())
    ])
    .then(([uJ, hJ]) => {
      if (uJ.success) {
        const u = uJ.data.find(x => String(x.userID) === userId);
        setUserInfo(u || null);
      }
      if (hJ.success) {
        setHistory(hJ.data);
      }
    })
    .catch(err => {
      console.error("❌ Error loading user history:", err);
      alert("❌ ไม่สามารถโหลดข้อมูลได้");
    })
    .finally(() => setLoading(false));
  }, [userId]);

  // กรองตามชื่อหรือรหัสอุปกรณ์
  const filteredHistory = history.filter(row =>
    row.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(row.equipmentCode).includes(searchTerm)
  );

  // ส่งออกเป็น Excel
  const exportToExcel = () => {
    const data = filteredHistory.map(r => ({
      ประเภท:      r.type === "Borrow" ? "ยืมจริง" : "จองล่วงหน้า",
      เลขรายการ:  r.recordID,
      รหัสอุปกรณ์: r.equipmentCode,
      ชื่ออุปกรณ์: r.equipmentName,
      รหัสวิชา:    r.courseCode,
      วันเริ่ม:     r.type === "Borrow" 
                    ? fmtDateOnly(r.startDate) 
                    : fmtDateTime(r.startDate),
      วันคืน:      fmtDateOnly(r.endDate),
      สถานะ:       statusMap[r.status] ?? r.status,
      สาเหตุ:       r.usageReason,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "History");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), `history_${userId}.xlsx`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="flex items-center p-6 bg-white shadow">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-200 transition"
        ><ArrowLeft size={24} /></button>
        <h1 className="flex-1 text-center text-2xl font-semibold">
          ประวัติการใช้งาน: {userInfo?.Name || userId}
        </h1>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* ข้อมูลผู้ใช้ */}
        {userInfo && (
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-lg font-medium mb-2">ชื่อ: {userInfo.Name}</p>
            <p className="mb-1">🆔 รหัสผู้ใช้: {userInfo.userID}</p>
            <p className="mb-1">✉️ Email: {userInfo.email}</p>
            <p className="mb-1">📞 โทรศัพท์: {userInfo.phoneNumber}</p>
            <p className="mb-1">📌 สถานะผู้ใช้: {userInfo.status}</p>
          </div>
        )}

        {/* Controls */}
        {!loading && (
          <div className="flex justify-between items-center">
            <div className="flex items-center bg-white rounded-lg shadow px-4 py-2">
              <Search className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อหรือรหัสอุปกรณ์..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="outline-none"
              />
            </div>
            <button
              onClick={exportToExcel}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
            >
              📥 Export Excel
            </button>
          </div>
        )}

        {/* ตารางประวัติ */}
        {loading ? (
          <p className="text-center text-gray-600">⏳ กำลังโหลด...</p>
        ) : filteredHistory.length > 0 ? (
          <div className="bg-white shadow rounded-lg overflow-x-auto">
            <table className="min-w-full text-center divide-y divide-gray-200">
              <thead className="bg-gray-200">
                <tr>
                  {["ประเภท","เลขรายการ","รหัสอุปกรณ์","ชื่ออุปกรณ์","รหัสวิชา","วันเริ่ม","วันคืน","สถานะ","สาเหตุ"].map(header => (
                    <th key={header} className="px-4 py-2">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredHistory.map(row => (
                  <tr key={`${row.type}-${row.recordID}`}>
                    <td className="px-4 py-2">{row.type === "Borrow" ? "ยืมจริง" : "จองล่วงหน้า"}</td>
                    <td className="px-4 py-2">{row.recordID}</td>
                    <td className="px-4 py-2">{row.equipmentCode}</td>
                    <td className="px-4 py-2">{row.equipmentName}</td>
                    <td className="px-4 py-2">{row.courseCode}</td>
                    <td className="px-4 py-2">
                      {row.type === "Borrow"
                        ? fmtDateOnly(row.startDate)
                        : fmtDateTime(row.startDate)}
                    </td>
                    <td className="px-4 py-2">{fmtDateOnly(row.endDate)}</td>
                    <td className="px-4 py-2">{statusMap[row.status]}</td>
                    <td className="px-4 py-2">{row.usageReason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-600">ℹ️ ยังไม่มีประวัติการใช้งาน</p>
        )}
      </div>


    </div>
  );
}
