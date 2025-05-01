"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";  // ✅ เพิ่ม useSession
import { ArrowLeft } from "lucide-react";

export default function BorrowEquipmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();  // ✅ ดึง session

  const equipmentID = searchParams.get("id"); // รับ `id` จาก URL
  const [equipmentName, setEquipmentName] = useState("กำลังโหลด...");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [usageReason, setUsageReason] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (equipmentID) {
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

  useEffect(() => {
    setStartDate(new Date().toISOString().split("T")[0]);
  }, []);

  const handleSubmit = async () => {
    if (!equipmentID) {
      alert("❌ ไม่พบอุปกรณ์ที่ต้องการยืม");
      return;
    }

    if (!endDate || !courseCode || !usageReason) {
      alert("⚠️ กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    if (endDateObj < startDateObj) {
      setError("❌ วันที่คืนไม่สามารถย้อนกลับไปก่อนวันที่เริ่มยืมได้");
      return;
    }

    if (!session?.user) {
      alert("❌ กรุณาเข้าสู่ระบบก่อนทำการยืมอุปกรณ์");
      return;
    }

    const reserverName = session.user.name || "ไม่ทราบชื่อ";
    const userID = session.user.id || "ไม่ทราบรหัส";

    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("equipmentID", equipmentID);
    formData.append("borrowDate", startDate);
    formData.append("dueDate", endDate);
    formData.append("courseCode", courseCode);
    formData.append("usageReason", usageReason);
    formData.append("userID", userID);               // ✅ ใส่ userID
    formData.append("borrowerName", reserverName);   // ✅ ใส่ชื่อผู้ยืม
    if (documentFile) {
      formData.append("document", documentFile);
    }

    try {
      // 1. บันทึกข้อมูลการยืม
      const response = await fetch("/api/borrow", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // 2. ถ้ายืมสำเร็จ → เรียกแจ้งเตือน
        await fetch("/api/notifications/newRequest", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            equipmentID: equipmentID,
            reserverName: reserverName,   // ✅ ส่งชื่อจริง
            type: "borrow",
          }),
        });

        alert("✅ การยืมอุปกรณ์สำเร็จและแจ้งเตือนเจ้าหน้าที่แล้ว!");
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
      <h2 className="text-lg font-semibold text-white mb-2 text-center">🛠 {equipmentName}</h2>

      {/* ✅ แสดงชื่อผู้ใช้งาน */}
      <h2 className="text-lg font-semibold text-white mb-6 text-center">
        🙋‍♂️ ผู้ใช้งาน: {session?.user?.name || "ไม่ทราบชื่อ"}
      </h2>

      <div className="bg-white p-8 shadow-xl rounded-xl w-full max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block font-semibold mb-2 text-gray-700">📅 วันที่เริ่มยืม:</label>
            <input type="date" value={startDate} disabled className="w-full border p-3 rounded shadow-sm bg-gray-200 text-gray-700" />
          </div>

          <div>
            <label className="block font-semibold mb-2 text-gray-700">📅 วันที่คืน:*</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full border p-3 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
            {error && <p className="text-red-600 mt-2">{error}</p>}
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-2 text-gray-700">📚 รหัสวิชาที่ยืม:*</label>
          <input type="text" placeholder="กรอกรหัสวิชา (เช่น CS1012, IT2050)" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} className="w-full border p-3 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>

        <div className="mt-4">
          <label className="block font-semibold mb-2 text-gray-700">📝 อธิบายการใช้งาน:*</label>
          <textarea placeholder="กรอกเหตุผลและรายละเอียดเกี่ยวกับการใช้อุปกรณ์..." value={usageReason} onChange={(e) => setUsageReason(e.target.value)} rows="3" className="w-full border p-3 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />
        </div>

        <div className="mt-4">
          <label className="block font-semibold mb-2 text-gray-700">📄 อัปโหลดเอกสารการอนุญาต (ถ้ามี) (รูปแบบ pdf. และ png.)</label>
          <input type="file" onChange={(e) => setDocumentFile(e.target.files[0])} className="w-full border p-3 rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
        </div>

        <button onClick={handleSubmit} className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 px-6 rounded-lg w-full text-lg font-semibold shadow-md hover:shadow-lg hover:from-blue-600 hover:to-indigo-600 transition mt-6 disabled:opacity-50" disabled={loading}>
          {loading ? "⏳ กำลังบันทึก..." : "💾 บันทึก"}
        </button>
      </div>
    </div>
  );
}
