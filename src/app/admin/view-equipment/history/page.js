"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
// อย่าลืมติดตั้ง dependencies ด้วย:
// npm install xlsx file-saver
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function EquipmentHistoryPage() {
  const params = useSearchParams();
  const router = useRouter();
  const equipmentId = params.get("id");

  const [equipment, setEquipment] = useState(null);
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const statusMap = {
    Pending:  "รอดำเนินการ",
    Approved: "มารับอุปกรณ์",
    Rejected: "ปฏิเสธแล้ว",
    Borrowed: "กำลังยืม",
    Overdue:  "เกินกำหนด",
    Returned: "คืนแล้ว",
  };

  const formatDateOnly = (iso) => {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
  };

  const formatDateTime = (iso) => {
    const d = new Date(iso);
    return `${formatDateOnly(iso)} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  };

  useEffect(() => {
    if (!equipmentId) return;
    (async () => {
      try {
        const res = await fetch(`/api/borrowing-history?equipmentId=${equipmentId}`);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Unknown error");
        setEquipment(json.equipment);
        setHistory(json.data);
      } catch (err) {
        console.error("Fetch history error:", err);
        alert("❌ ไม่สามารถโหลดข้อมูลได้:\n" + err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [equipmentId]);

  const exportToExcel = () => {
    const data = filteredHistory.map(row => ({
      ประเภท: row.type === "Borrow" ? "รายการยืม" : "รายการจอง",
      เลขรายการ: row.recordID,
      รหัสผู้ใช้งาน: row.userId,
      ชื่อผู้ยืม: row.userName,
      สถานะ: statusMap[row.status] ?? row.status,
      รหัสวิชา: row.courseCode,
      วันยืม: row.type === "Borrow" ? formatDateOnly(row.startDate) : formatDateTime(row.startDate),
      วันคืน: formatDateOnly(row.endDate),
      สาเหตุยืม: row.usageReason,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "History");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), `history_${equipmentId}.xlsx`);
  };

  // กรองตาม searchTerm (userName หรือ userId)
  const filteredHistory = history.filter(row => {
    const term = searchTerm.trim().toLowerCase();
    return (
      row.userName.toLowerCase().includes(term) ||
      String(row.userId).toLowerCase().includes(term)
    );
  });

  // ← full-screen loader
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <Loader2 size={48} className="animate-spin text-gray-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-2 rounded-lg shadow transition"
      >
        <ArrowLeft className="mr-2" size={18} />
        กลับ
      </button>

      {equipment && (
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">
            ประวัติอุปกรณ์: {equipment.name} (รหัสอุปกรณ์: {equipment.equipment_code})
          </h1>
          <button
            onClick={exportToExcel}
            className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded-lg shadow transition"
          >
            📥 ส่งออก Excel
          </button>
        </div>
      )}

      {/* ช่องค้นหา */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="ค้นหาชื่อผู้ยืม หรือ รหัสผู้ใช้งาน..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 border p-2 rounded focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {filteredHistory.length > 0 ? (
        <div className="overflow-auto bg-white shadow rounded-lg">
          <table className="w-full table-auto">
            <thead className="bg-gray-200 text-left">
              <tr>
                <th className="px-4 py-2">ประเภท</th>
                <th className="px-4 py-2">เลขรายการ</th>
                <th className="px-4 py-2">รหัสผู้ใช้งาน</th>
                <th className="px-4 py-2">ชื่อผู้ยืม</th>
                <th className="px-4 py-2">สถานะ</th>
                <th className="px-4 py-2">รหัสวิชา</th>
                <th className="px-4 py-2">วันยืม</th>
                <th className="px-4 py-2">วันคืน</th>
                <th className="px-4 py-2">สาเหตุยืม</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.map((row) => (
                <tr key={`${row.type}-${row.recordID}`} className="border-b">
                  <td className="px-4 py-2">
                    {row.type === "Borrow" ? "รายการยืม" : "รายการจอง"}
                  </td>
                  <td className="px-4 py-2">{row.recordID}</td>
                  <td className="px-4 py-2">{row.userId}</td>
                  <td className="px-4 py-2">{row.userName}</td>
                  <td className="px-4 py-2">{statusMap[row.status] ?? row.status}</td>
                  <td className="px-4 py-2">{row.courseCode}</td>
                  <td className="px-4 py-2">
                    {row.type === "Borrow"
                      ? formatDateOnly(row.startDate)
                      : formatDateTime(row.startDate)}
                  </td>
                  <td className="px-4 py-2">{formatDateOnly(row.endDate)}</td>
                  <td className="px-4 py-2">{row.usageReason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>ℹ️ ไม่พบผลลัพธ์การค้นหา</p>
      )}
    </div>
  );
}
