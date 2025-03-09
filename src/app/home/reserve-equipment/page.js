"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function ReserveEquipmentPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="p-8 pt-16 min-h-screen bg-gradient-to-br from-blue-500 to-blue-300 flex flex-col items-center w-full relative">
      <button
        onClick={handleBack}
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center text-white bg-gray-900 px-4 py-2 rounded-lg shadow-md hover:bg-gray-800 transition"
      >
        <ArrowLeft className="mr-2" /> ย้อนกลับ
      </button>

      <h1 className="text-3xl font-bold text-white mb-8 text-center">📅 จองอุปกรณ์</h1>

      <div className="bg-white p-8 shadow-xl rounded-xl w-full max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 📅 วันที่รับอุปกรณ์ */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">📅 วันที่รับอุปกรณ์:</label>
            <input
              type="date"
              className="w-full border p-3 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* 📅 วันที่คืนอุปกรณ์ */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">📅 วันที่คืนอุปกรณ์:</label>
            <input
              type="date"
              className="w-full border p-3 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* ⏰ เวลารับอุปกรณ์ */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">⏰ เวลารับอุปกรณ์:</label>
            <input
              type="time"
              className="w-full border p-3 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* 📚 รหัสวิชาที่ยืม */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">📚 รหัสวิชาที่ยืม:</label>
            <input
              type="text"
              placeholder="กรอกรหัสวิชา (เช่น CS1012, IT2050)"
              className="w-full border p-3 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* 📝 อธิบายการใช้งาน */}
          <div className="col-span-1 md:col-span-2">
            <label className="block font-semibold mb-2 text-gray-700">📝 อธิบายการใช้งาน:</label>
            <textarea
              placeholder="กรอกเหตุผลและรายละเอียดเกี่ยวกับการใช้อุปกรณ์..."
              rows="3"
              className="w-full border p-3 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* 📄 อัปโหลดเอกสารการอนุญาต */}
          <div className="col-span-1 md:col-span-2">
            <label className="block font-semibold mb-2 text-gray-700">
              📄 อัปโหลดเอกสารการอนุญาต (ในกรณียืมมากกว่า 7 วัน)
            </label>
            <input
              type="file"
              className="w-full border p-3 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* 💾 ปุ่มบันทึก */}
        <button className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 px-6 rounded-lg w-full text-lg font-semibold shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-600 transition mt-6">
          💾 บันทึก
        </button>
      </div>
    </div>
  );
}
