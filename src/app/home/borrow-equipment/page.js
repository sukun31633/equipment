"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BorrowEquipmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const equipmentID = searchParams.get("id"); // รับ `id` จาก URL
  const [equipmentName, setEquipmentName] = useState("กำลังโหลด...");
  
  const [borrowDate, setBorrowDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [usageReason, setUsageReason] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ใช้ useEffect เพื่อดึงข้อมูลชื่ออุปกรณ์จาก API
  useEffect(() => {
    if (equipmentID) {
      const fetchEquipment = async () => {
        try {
          const res = await fetch(`/api/view-equipment?id=${equipmentID}`);
          const data = await res.json();
          if (data.success && data.data.length > 0) {
            setEquipmentName(data.data[0].name);  // ตั้งชื่ออุปกรณ์จาก API
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

  // กำหนดวันที่ปัจจุบันให้กับวันที่ยืม
  useEffect(() => {
    setBorrowDate(new Date().toISOString().split("T")[0]);
  }, []);

  // ตรวจสอบวันที่คืนว่าไม่สามารถย้อนหลังได้
  const handleSubmit = async () => {
    if (!equipmentID) {
      alert("❌ ไม่พบอุปกรณ์ที่ต้องการยืม");
      return;
    }

    if (!dueDate || !courseCode || !usageReason) {
      alert("⚠️ กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    // ตรวจสอบวันที่คืน (dueDate) ว่าไม่น้อยกว่าหรือย้อนหลังจากวันที่ยืม
    const borrowDateObj = new Date(borrowDate);
    const dueDateObj = new Date(dueDate);
    
    if (dueDateObj < borrowDateObj) {
      setError("❌ วันที่คืนไม่สามารถย้อนกลับไปก่อนวันที่ยืมได้");
      return;
    }

    setError("");  // รีเซ็ตข้อความข้อผิดพลาด

    setLoading(true);
    const formData = new FormData();
    formData.append("equipmentID", equipmentID);
    formData.append("borrowDate", borrowDate);
    formData.append("dueDate", dueDate);
    formData.append("courseCode", courseCode);
    formData.append("usageReason", usageReason);
    if (documentFile) {
      formData.append("document", documentFile);
    }

    try {
      const response = await fetch("/api/borrow", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        alert("✅ การยืมอุปกรณ์สำเร็จ!");
        router.push("/borrowed-equipment");
      } else {
        alert("❌ เกิดข้อผิดพลาด: " + result.message);
      }
    } catch (error) {
      console.error("เกิดข้อผิดพลาด:", error);
      alert("❌ ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 pt-16 min-h-screen bg-gradient-to-br from-blue-500 to-blue-300 flex flex-col items-center w-full relative">
      <button onClick={() => router.back()} className="absolute top-6 left-6 flex items-center text-white bg-gray-900 px-4 py-2 rounded-lg shadow-md hover:bg-gray-800 transition">
        <ArrowLeft className="mr-2" /> ย้อนกลับ
      </button>

      <h1 className="text-3xl font-bold text-white mb-2 text-center">🔄 ยืมอุปกรณ์ตอนนี้</h1>
      <h2 className="text-lg font-semibold text-white mb-6 text-center">🛠 {equipmentName}</h2>

      <div className="bg-white p-8 shadow-xl rounded-xl w-full max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 📅 วันที่ยืมอุปกรณ์ (อัตโนมัติ) */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">📅 วันที่ยืมอุปกรณ์:</label>
            <input type="date" value={borrowDate} disabled className="w-full border p-3 rounded shadow-sm bg-gray-200 text-gray-700" />
          </div>

          {/* 📅 วันที่คืนอุปกรณ์ */}
          <div>
            <label className="block font-semibold mb-2 text-gray-700">📅 วันที่คืนอุปกรณ์:</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full border p-3 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            {error && <p className="text-red-600 mt-2">{error}</p>}
          </div>
        </div>

        {/* 📚 รหัสวิชาที่ยืม */}
        <div>
          <label className="block font-semibold mb-2 text-gray-700">📚 รหัสวิชาที่ยืม:</label>
          <input type="text" placeholder="กรอกรหัสวิชา (เช่น CS1012, IT2050)" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} className="w-full border p-3 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>

        {/* 📝 อธิบายการใช้งาน */}
        <div className="mt-4">
          <label className="block font-semibold mb-2 text-gray-700">📝 อธิบายการใช้งาน:</label>
          <textarea placeholder="กรอกเหตุผลและรายละเอียดเกี่ยวกับการใช้อุปกรณ์..." value={usageReason} onChange={(e) => setUsageReason(e.target.value)} rows="3" className="w-full border p-3 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />
        </div>

        {/* 📄 อัปโหลดเอกสารการอนุญาต */}
        <div className="mt-4">
          <label className="block font-semibold mb-2 text-gray-700">📄 อัปโหลดเอกสารการอนุญาต (ในกรณียืมมากกว่า 7 วัน)</label>
          <input type="file" onChange={(e) => setDocumentFile(e.target.files[0])} className="w-full border p-3 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>

        {/* 💾 ปุ่มบันทึก */}
        <button onClick={handleSubmit} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 px-6 rounded-lg w-full text-lg font-semibold shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-600 transition mt-6 disabled:opacity-50" disabled={loading}>
          {loading ? "⏳ กำลังบันทึก..." : "💾 บันทึก"}
        </button>
      </div>
    </div>
  );
}
