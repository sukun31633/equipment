"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2, Edit, CheckCircle2, BarChart2 } from "lucide-react";
import AdminNavigationBar from "@/app/components/AdminNavigationBar";

const statusMap = {
  Available: "พร้อมใช้งาน",
  Repair: "ซ่อม",
  Damaged: "พัง",
};

export default function EquipmentListPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [equipmentList, setEquipmentList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [repairFilter, setRepairFilter] = useState(false);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await fetch("/api/view-equipment");
        const data = await res.json();
        if (data.success) setEquipmentList(data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  const handleEdit = (id) => router.push(`/admin/view-equipment/edit-equipment?id=${id}`);

  const handleDelete = async (id) => {
    if (!confirm("⚠️ คุณต้องการลบอุปกรณ์นี้หรือไม่?")) return;
    try {
      const res = await fetch(`/api/delete-equipment?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        return alert(err.message || "⚠️ เกิดข้อผิดพลาด");
      }
      const data = await res.json();
      if (data.success) {
        alert("✅ ลบข้อมูลอุปกรณ์สำเร็จ");
        setEquipmentList((prev) => prev.filter((e) => e.id !== id));
      }
    } catch {
      alert("❌ ไม่สามารถลบข้อมูลได้");
    }
  };

  const handleRepairDone = async (id) => {
    if (!confirm("คุณต้องการตั้งสถานะอุปกรณ์กลับเป็น ‘Available’ ใช่หรือไม่?")) return;
    try {
      const res = await fetch("/api/update-equipment-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "Available" }),
      });
      const data = await res.json();
      if (data.success) {
        setEquipmentList((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: "Available" } : item
          )
        );
        alert("✅ เปลี่ยนสถานะเป็น Available แล้ว");
      } else {
        alert(data.message || "❌ เกิดข้อผิดพลาดในการอัปเดต");
      }
    } catch (error) {
      console.error(error);
      alert("❌ ไม่สามารถติดต่อเซิร์ฟเวอร์ได้");
    }
  };

  const filteredEquipment = equipmentList.filter((item) => {
    if (repairFilter) {
      return ["Repair", "Damaged"].includes(item.status);
    }
    return item.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex flex-col items-center p-6 pb-24">
      {/* Header */}
      <div className="w-full max-w-4xl bg-white p-4 shadow-lg flex items-center justify-between rounded-lg mb-6">
        <h2 className="text-lg font-semibold text-gray-800">📦 ข้อมูลอุปกรณ์</h2>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="🔍 ค้นหาชื่ออุปกรณ์..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={repairFilter}
            className={`w-48 border p-3 rounded-l border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              repairFilter ? "bg-gray-100" : ""
            }`}
          />
          <button
            onClick={() => setRepairFilter(false)}
            className="bg-blue-500 text-white px-4 py-2 rounded-l hover:bg-blue-600 transition disabled:opacity-50"
            disabled={repairFilter}
          >
            <Search size={20} />
          </button>
          <button
            onClick={() => setRepairFilter((f) => !f)}
            className={`px-4 py-2 rounded-r text-white transition ${
              repairFilter ? "bg-red-600 hover:bg-red-700" : "bg-yellow-500 hover:bg-yellow-600"
            }`}
          >
            ซ่อม &amp; พัง
          </button>
    {/* ปุ่มรายงานสถิติ */}
    <button
      onClick={() => router.push("/admin/reports/monthly-usage")}
      className="flex items-center bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg shadow-lg transition ml-4"
    >
      <BarChart2 size={18} className="mr-2" />
      สรุปอุปกรณ์
    </button>
        </div>
      </div>

      {/* Equipment List */}
      <div className="w-full max-w-4xl space-y-4">
        {loading ? (
          <p className="text-center text-gray-600">⏳ กำลังโหลดข้อมูล...</p>
        ) : filteredEquipment.length > 0 ? (
          filteredEquipment.map((equipment) => (
            <div
              key={equipment.id}
              className="bg-white p-6 shadow-lg rounded-lg flex justify-between items-center hover:shadow-2xl transition"
            >
              <div className="w-24 h-24 flex-shrink-0 border rounded-lg overflow-hidden shadow-md">
                <img
                  src={equipment.image || "/uploads/default.png"}
                  alt={equipment.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 px-4">
                <p className="font-bold text-lg">📌 {equipment.name}</p>
                <p className="text-gray-800">🏷️ ยี่ห้อ: {equipment.brand}</p>
                <p className="text-gray-800">📂 หมวดหมู่: {equipment.category}</p>
                <p className="text-gray-800">📦 รหัสอุปกรณ์: {equipment.equipment_code}</p>
                <p className="text-gray-800">📍 ที่เก็บ: {equipment.location}</p>
                <p className="text-gray-800">📜 รายละเอียด: {equipment.description}</p>
                {repairFilter && (
                  <p className="mt-2 text-red-600 font-semibold">
                    ⚠️ สถานะ: {statusMap[equipment.status] || equipment.status}
                  </p>
                )}
              </div>
              <div className="flex space-x-2">
                {/* ปุ่มซ่อมเสร็จ */}
                {equipment.status === "Repair" && (
                  <button
                    className="bg-green-500 text-white px-3 py-2 rounded-lg shadow-md hover:bg-green-600 transition flex items-center"
                    onClick={() => handleRepairDone(equipment.id)}
                  >
                    <CheckCircle2 size={18} className="mr-1" /> ซ่อมเสร็จ
                  </button>
                )}
                <button
                  className="bg-red-500 text-white px-3 py-2 rounded-lg shadow-md hover:bg-red-600 transition flex items-center"
                  onClick={() => handleDelete(equipment.id)}
                >
                  <Trash2 size={18} className="mr-1" /> ลบ
                </button>
                <button
                  className="bg-yellow-500 text-white px-3 py-2 rounded-lg shadow-md hover:bg-yellow-600 transition flex items-center"
                  onClick={() => handleEdit(equipment.id)}
                >
                  <Edit size={18} className="mr-1" /> แก้ไข
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">⏳ ไม่มีข้อมูลอุปกรณ์</p>
        )}
      </div>

      <AdminNavigationBar />
    </div>
  );
}
