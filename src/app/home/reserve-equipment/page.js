"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function ReserveEquipmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [equipmentName, setEquipmentName] = useState("กำลังโหลด...");
  const equipmentID = searchParams.get("id");

  // ✅ เก็บค่าฟอร์มใน state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reserveTime, setReserveTime] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [usageReason, setUsageReason] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (equipmentID) {
      // 🛠 ดึงข้อมูลชื่ออุปกรณ์จาก API ด้วย id
      const fetchEquipment = async () => {
        try {
          const res = await fetch(`/api/view-equipment?id=${equipmentID}`);
          const data = await res.json();
          if (data.success && data.data.length > 0) {
            setEquipmentName(data.data[0].name); // ตั้งชื่ออุปกรณ์
          } else {
            setEquipmentName("ไม่พบข้อมูลอุปกรณ์");
          }
        } catch (error) {
          console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ API", error);
        }
      };
      fetchEquipment();
    }
  }, [equipmentID]);

  const handleBack = () => {
    router.back();
  };

  // ✅ ฟังก์ชันส่งข้อมูลไปยัง API
  const handleReserve = async () => {
    if (!startDate || !endDate || !reserveTime || !courseCode || !usageReason) {
      alert("⚠️ กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
  
    // รวม startDate และ reserveTime เข้าด้วยกัน
    const fullStartDate = `${startDate} ${reserveTime}`;
  
    const formData = new FormData();
    formData.append("reserverName", "ชื่อผู้จอง (ดึงจาก session)");
    formData.append("userID", "userID (ดึงจาก session)");
    formData.append("reservedEquipments", equipmentName);
    formData.append("startDate", fullStartDate); // ใช้ fullStartDate แทน startDate เดิม
    formData.append("endDate", endDate);
    formData.append("courseCode", courseCode);
    formData.append("usageReason", usageReason);
    if (file) formData.append("document", file);
  
    try {
      const res = await fetch("/api/reservation", {
        method: "POST",
        body: formData,
      });
  
      const data = await res.json();
      if (data.success) {
        alert("✅ การจองสำเร็จ!");
        router.push("/home");
      } else {
        alert(data.message || "❌ ไม่สามารถทำการจองได้");
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      alert("❌ เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  };
  
  
  

  return (
    <div className="p-8 pt-16 min-h-screen bg-gradient-to-br from-blue-500 to-blue-300 flex flex-col items-center w-full relative">
      <button
        onClick={handleBack}
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center text-white bg-gray-900 px-4 py-2 rounded-lg shadow-md hover:bg-gray-800 transition"
      >
        <ArrowLeft className="mr-2" /> ย้อนกลับ
      </button>

      {/* ✅ แสดงชื่ออุปกรณ์ */}
      <h1 className="text-3xl font-bold text-white mb-4 text-center">📅 จองอุปกรณ์</h1>
      <h2 className="text-lg font-semibold text-white mb-8 text-center">🛠 {equipmentName}</h2>

      <div className="bg-white p-8 shadow-xl rounded-xl w-full max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 📅 วันที่รับอุปกรณ์ */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">📅 วันที่รับอุปกรณ์:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border p-3 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* 📅 วันที่คืนอุปกรณ์ */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">📅 วันที่คืนอุปกรณ์:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border p-3 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* ⏰ เวลารับอุปกรณ์ */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">⏰ เวลารับอุปกรณ์:</label>
            <input
              type="time"
              value={reserveTime}
              onChange={(e) => setReserveTime(e.target.value)}
              className="w-full border p-3 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* 📚 รหัสวิชาที่ยืม */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">📚 รหัสวิชาที่ยืม:</label>
            <input
              type="text"
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              placeholder="กรอกรหัสวิชา (เช่น CS1012, IT2050)"
              className="w-full border p-3 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* 📝 อธิบายการใช้งาน */}
          <div className="col-span-1 md:col-span-2">
            <label className="block font-semibold mb-2 text-gray-700">📝 อธิบายการใช้งาน:</label>
            <textarea
              value={usageReason}
              onChange={(e) => setUsageReason(e.target.value)}
              placeholder="กรอกเหตุผลและรายละเอียดเกี่ยวกับการใช้อุปกรณ์..."
              rows="3"
              className="w-full border p-3 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
            />
          </div>

          {/* 📄 อัปโหลดเอกสารการอนุญาต */}
          <div className="col-span-1 md:col-span-2">
            <label className="block font-semibold mb-2 text-gray-700">📄 อัปโหลดเอกสารการอนุญาต (ในกรณียืมมากกว่า 7 วัน)</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full border p-3 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* 💾 ปุ่มบันทึก */}
        <button
          onClick={handleReserve} // ✅ เพิ่มฟังก์ชันบันทึก
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 px-6 rounded-lg w-full text-lg font-semibold shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-600 transition mt-6"
        >
          💾 บันทึก
        </button>
      </div>
    </div>
  );
}
