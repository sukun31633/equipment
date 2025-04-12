"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ReserveEquipmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [equipmentName, setEquipmentName] = useState("กำลังโหลด...");
  const equipmentID = searchParams.get("id");

  // เก็บค่าฟอร์มใน state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reserveTime, setReserveTime] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [usageReason, setUsageReason] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState(""); // เก็บข้อความข้อผิดพลาด
  const [loading, setLoading] = useState(false);

  // อาเรย์ของตัวเลือกเวลา (ในรูปแบบ 24 ชั่วโมง)
  const timeOptions = [
    "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00",
    "15:30", "16:00", "16:30"
  ];

  useEffect(() => {
    if (equipmentID) {
      // ดึงข้อมูลชื่ออุปกรณ์จาก API ด้วย equipmentID
      const fetchEquipment = async () => {
        try {
          const res = await fetch(`/api/view-equipment?id=${equipmentID}`);
          const data = await res.json();
          if (data.success && data.data.length > 0) {
            setEquipmentName(data.data[0].name);
          } else {
            setEquipmentName("ไม่พบข้อมูลอุปกรณ์");
          }
        } catch (error) {
          console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ API", error);
          setEquipmentName("ไม่พบข้อมูลอุปกรณ์");
        }
      };
      fetchEquipment();
    }
  }, [equipmentID]);

  const handleBack = () => {
    router.back();
  };

  // ฟังก์ชันสำหรับตรวจสอบและดักเวลาที่เลือกว่าต้องอยู่ในอนาคตและถูกต้อง
  const handleReserve = async () => {
    if (!startDate || !endDate || !reserveTime || !courseCode || !usageReason) {
      alert("⚠️ กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    // รวม startDate และ reserveTime เข้าด้วยกัน (รูปแบบ "YYYY-MM-DD HH:MM")
    const fullStartDate = `${startDate} ${reserveTime}`;
    const startDateObj = new Date(fullStartDate);
    const endDateObj = new Date(endDate);
    const now = new Date();

    // ตรวจสอบว่าเวลารับอุปกรณ์ (fullStartDate) ต้องเป็นเวลาที่อยู่ในอนาคต
    if (startDateObj < now) {
      setError("❌ เวลารับอุปกรณ์ต้องเป็นเวลาในอนาคต");
      return;
    }

    // ตรวจสอบว่า endDate ไม่อยู่ก่อน fullStartDate
    if (endDateObj < startDateObj) {
      setError("❌ วันที่คืนไม่สามารถย้อนกลับไปก่อนวันที่รับอุปกรณ์ได้");
      return;
    }

    setError("");

    const formData = new FormData();
    // ในระบบจริง ข้อมูล reserverName และ userID จะถูกดึงจาก session
    formData.append("reserverName", "ชื่อผู้จอง (ดึงจาก session)");
    formData.append("userID", "userID (ดึงจาก session)");
    formData.append("reservedEquipments", equipmentName);
    formData.append("startDate", fullStartDate);
    formData.append("endDate", endDate);
    formData.append("courseCode", courseCode);
    formData.append("usageReason", usageReason);
    if (file) formData.append("document", file);

    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  // ตั้งค่า startDate เป็นวันที่ปัจจุบันเมื่อโหลดหน้า (รูปแบบ yyyy-mm-dd)
  useEffect(() => {
    setStartDate(new Date().toISOString().split("T")[0]);
  }, []);

  return (
    <div className="p-8 pt-16 min-h-screen bg-gradient-to-br from-blue-500 to-blue-300 flex flex-col items-center w-full relative">
      <button
        onClick={handleBack}
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center text-white bg-gray-900 px-4 py-2 rounded-lg shadow-md hover:bg-gray-800 transition"
      >
        <ArrowLeft className="mr-2" /> ย้อนกลับ
      </button>

      <h1 className="text-3xl font-bold text-white mb-4 text-center">📅 จองอุปกรณ์</h1>
      <h2 className="text-lg font-semibold text-white mb-8 text-center">🛠 {equipmentName}</h2>

      <div className="bg-white p-8 shadow-xl rounded-xl w-full max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* วันที่รับอุปกรณ์ */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">📅 วันที่รับอุปกรณ์:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border p-3 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
          {/* วันที่คืนอุปกรณ์ */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">📅 วันที่คืนอุปกรณ์:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border p-3 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            {error && <p className="text-red-600 mt-2">{error}</p>}
          </div>
          {/* เวลารับอุปกรณ์ แบบ Select */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">⏰ เวลารับอุปกรณ์:</label>
            <select
              value={reserveTime}
              onChange={(e) => setReserveTime(e.target.value)}
              className="w-full border p-3 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">-- เลือกเวลา --</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
          {/* รหัสวิชาที่ยืม */}
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
          {/* อธิบายการใช้งาน */}
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
          {/* อัปโหลดเอกสาร */}
          <div className="col-span-1 md:col-span-2">
            <label className="block font-semibold mb-2 text-gray-700">
              📄 อัปโหลดเอกสารการอนุญาต (ในกรณียืมมากกว่า 7 วัน)
            </label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full border p-3 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleReserve}
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 px-6 rounded-lg w-full text-lg font-semibold shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-600 transition mt-6 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "⏳ กำลังบันทึก..." : "💾 บันทึก"}
        </button>
      </div>
    </div>
  );
}
