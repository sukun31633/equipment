"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

export default function EditEquipmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [equipment, setEquipment] = useState({
    name: "",
    brand: "",
    category: "",
    equipment_code: "",
    location: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);

  // 🔹 ตัวเลือกหมวดหมู่
  const categoryOptions = ["อุปกรณ์อื่นๆ", "Network", "IOT"];

  useEffect(() => {
    if (!id) {
      alert("❌ ไม่พบ ID อุปกรณ์");
      router.push("/admin/view-equipment");
      return;
    }

    const fetchEquipment = async () => {
      try {
        const res = await fetch(`/api/view-equipment?id=${id}`);
        const data = await res.json();

        if (data.success && data.data.length > 0) {
          setEquipment(data.data[0]);
        } else {
          alert("⚠️ ไม่พบอุปกรณ์ที่ต้องการแก้ไข");
          router.push("/admin/view-equipment");
        }
      } catch (error) {
        console.error("⚠️ เกิดข้อผิดพลาด:", error);
        alert("❌ ไม่สามารถโหลดข้อมูลอุปกรณ์ได้");
        router.push("/admin/view-equipment");
      } finally {
        setLoading(false);
      }
    };

    fetchEquipment();
  }, [id, router]);

  const handleChange = (e) => {
    setEquipment({ ...equipment, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/update-equipment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(equipment),
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ บันทึกข้อมูลอุปกรณ์สำเร็จ");
        router.push("/admin/view-equipment");
      } else {
        alert("⚠️ ไม่สามารถบันทึกข้อมูลได้");
      }
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาด:", error);
      alert("⚠️ เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  // ← full-screen loader
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <Loader2 size={48} className="animate-spin text-gray-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      {/* 🔹 Header */}
      <div className="w-full max-w-2xl bg-white p-4 shadow-lg flex items-center justify-between rounded-lg mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-500 flex items-center"
        >
          <ArrowLeft size={24} className="mr-2" /> กลับ
        </button>
        <h2 className="text-lg font-semibold text-gray-800">🛠️ แก้ไขอุปกรณ์</h2>
      </div>

      {/* 🔹 Form แก้ไขข้อมูล */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white p-6 shadow-lg rounded-lg"
      >
        <div className="grid grid-cols-1 gap-4">
          {/* ชื่ออุปกรณ์ */}
          <div>
            <label className="block text-gray-700 font-medium">
              📦 ชื่ออุปกรณ์
            </label>
            <input
              type="text"
              name="name"
              value={equipment.name}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* ยี่ห้อ */}
          <div>
            <label className="block text-gray-700 font-medium">
              🏷️ ยี่ห้อ
            </label>
            <input
              type="text"
              name="brand"
              value={equipment.brand}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* หมวดหมู่ */}
          <div>
            <label className="block text-gray-700 font-medium">
              📂 หมวดหมู่
            </label>
            <select
              name="category"
              value={equipment.category}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* รหัสอุปกรณ์ */}
          <div>
            <label className="block text-gray-700 font-medium">
              📦 รหัสอุปกรณ์
            </label>
            <input
              type="text"
              name="equipment_code"
              value={equipment.equipment_code}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          {/* ที่เก็บ */}
          <div>
            <label className="block text-gray-700 font-medium">
              📍 ที่เก็บ
            </label>
            <input
              type="text"
              name="location"
              value={equipment.location}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* รายละเอียด */}
          <div>
            <label className="block text-gray-700 font-medium">
              📜 รายละเอียด
            </label>
            <textarea
              name="description"
              value={equipment.description}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows="3"
            />
          </div>

          {/* ปุ่มบันทึก */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600 transition"
            >
              <Save size={18} className="mr-2" /> บันทึกการเปลี่ยนแปลง
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
