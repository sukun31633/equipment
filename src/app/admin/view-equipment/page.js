"use client";

import { useState, useEffect } from "react";
import { Search, Trash2, Edit } from "lucide-react";
import AdminNavigationBar from "@/app/components/AdminNavigationBar";

export default function EquipmentListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [equipmentList, setEquipmentList] = useState([]);

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const res = await fetch("/api/view-equipment");
        const data = await res.json();
        if (data.success) {
          setEquipmentList(data.data);
          console.log("📦 อุปกรณ์ทั้งหมด:", data.data);
        } else {
          console.error("⚠️ เกิดข้อผิดพลาดในการดึงข้อมูลอุปกรณ์");
        }
      } catch (error) {
        console.error("⚠️ เกิดข้อผิดพลาดในการเชื่อมต่อ API", error);
      }
    };

    fetchEquipment();
  }, []);

  const handleSearch = () => {
    console.log("🔍 ค้นหาชื่ออุปกรณ์:", searchTerm);
  };

  const handleDelete = async (id) => {
    if (confirm("⚠️ คุณต้องการลบอุปกรณ์นี้หรือไม่?")) {
      try {
        const res = await fetch(`/api/delete-equipment?id=${id}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (data.success) {
          alert("✅ ลบข้อมูลอุปกรณ์สำเร็จ");
          setEquipmentList((prev) => prev.filter((item) => item.id !== id));
        } else {
          alert("⚠️ เกิดข้อผิดพลาดในการลบข้อมูล");
        }
      } catch (error) {
        console.error("⚠️ เกิดข้อผิดพลาด:", error);
        alert("⚠️ เกิดข้อผิดพลาดในการลบข้อมูล");
      }
    }
  };

  const handleEdit = (id) => {
    window.location.href = `/home/edit-equipment?id=${id}`;
  };

  const filteredEquipment = equipmentList.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex flex-col items-center p-6 pb-24">
      
      {/* 🔹 Header */}
      <div className="w-full max-w-4xl bg-white p-4 shadow-lg flex items-center justify-between rounded-lg mb-6">
        <h2 className="text-lg font-semibold text-gray-800">📦 ข้อมูลอุปกรณ์</h2>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="🔍 ค้นหาชื่ออุปกรณ์..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-48 border p-3 rounded-l border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition"
          >
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* 🔹 อุปกรณ์ทั้งหมด */}
      <div className="w-full max-w-4xl space-y-4">
        {filteredEquipment.length > 0 ? (
          filteredEquipment.map((equipment) => (
            <div
              key={equipment.id}
              className="bg-white p-6 shadow-lg rounded-lg flex justify-between items-center hover:shadow-2xl transition"
            >
              {/* ภาพอุปกรณ์ */}
              <div className="w-24 h-24 flex-shrink-0 border rounded-lg overflow-hidden shadow-md">
                <img
                  src={equipment.image ? equipment.image : "/uploads/default.png"}
                  alt={equipment.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* รายละเอียดอุปกรณ์ */}
              <div className="flex-1 px-4">
                <p className="font-bold text-lg">📌 {equipment.name}</p>
                <p className="text-gray-800">🏷️ ยี่ห้อ: {equipment.brand}</p>
                <p className="text-gray-800">📂 หมวดหมู่: {equipment.category}</p>
                <p className="text-gray-800">📦 รหัสอุปกรณ์: {equipment.equipment_code}</p>
                <p className="text-gray-800">📍 ที่เก็บ: {equipment.location}</p>
              </div>

              {/* ปุ่มลบ & แก้ไข */}
              <div className="flex space-x-2">
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
