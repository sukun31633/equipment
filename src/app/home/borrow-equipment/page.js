"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft } from "lucide-react";

export default function BorrowEquipmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const equipmentID = searchParams.get("id");
  const [equipmentName, setEquipmentName] = useState("กำลังโหลด...");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [usageReason, setUsageReason] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // รายการวิชาที่ใช้บ่อย
  const commonCourses = ["CS1012", "IT2050", "CS2021", "IT3033"];
  // รายการเหตุผลที่ใช้บ่อย
  const commonReasons = ["ทำโปรเจค", "แสดงนิทรรศการ", "ทำวิจัย", "เรียนภาคปฏิบัติ"];

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
        } catch (err) {
          console.error(err);
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
    if (!equipmentID) return alert("❌ ไม่พบอุปกรณ์ที่ต้องการยืม");
    if (!endDate || !courseCode || !usageReason) return alert("⚠️ กรุณากรอกข้อมูลให้ครบถ้วน");
    const startObj = new Date(startDate);
    const endObj = new Date(endDate);
    if (endObj < startObj) {
      setError("❌ วันที่คืนไม่สามารถย้อนกลับไปก่อนวันที่เริ่มได้");
      return;
    }
    if (!session?.user) return alert("❌ กรุณาเข้าสู่ระบบก่อน");

    const reserverName = session.user.name || "ไม่ทราบชื่อ";
    const userID = session.user.id || "-";

    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("equipmentID", equipmentID);
      formData.append("borrowDate", startDate);
      formData.append("dueDate", endDate);
      formData.append("courseCode", courseCode);
      formData.append("usageReason", usageReason);
      formData.append("userID", userID);
      formData.append("borrowerName", reserverName);
      if (documentFile) formData.append("document", documentFile);

      const res = await fetch("/api/borrow", { method: "POST", body: formData });
      const result = await res.json();
      if (result.success) {
        await fetch("/api/notifications/newRequest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ equipmentID, reserverName, type: "borrow" }),
        });
        alert("✅ การยืมอุปกรณ์สำเร็จและแจ้งเตือนเจ้าหน้าที่แล้ว!");
        router.push("/home");
      } else {
        alert("❌ " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("❌ ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 pt-16 min-h-screen bg-gradient-to-br from-blue-500 to-blue-300 flex flex-col items-center w-full relative">
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 flex items-center text-white bg-gray-900 px-4 py-2 rounded-lg shadow-md hover:bg-gray-800 transition"
      >
        <ArrowLeft className="mr-2" /> ย้อนกลับ
      </button>

      <h1 className="text-3xl font-bold text-white mb-2 text-center">🔄 ยืมอุปกรณ์ตอนนี้</h1>
      <h2 className="text-lg font-semibold text-white mb-2 text-center">🛠 {equipmentName}</h2>
      <h2 className="text-lg font-semibold text-white mb-6 text-center">
        🙋‍♂️ ผู้ใช้งาน: {session?.user?.name || "ไม่ทราบชื่อ"}
      </h2>

      <div className="bg-white p-8 shadow-xl rounded-xl w-full max-w-3xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block font-semibold mb-2 text-gray-700">📅 วันที่เริ่มยืม:</label>
            <input
              type="date"
              value={startDate}
              disabled
              className="w-full border p-3 rounded bg-gray-200 text-gray-700"
            />
          </div>
          <div>
            <label className="block font-semibold mb-2 text-gray-700">📅 วันที่คืน:*</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border p-3 rounded focus:ring-blue-500"
            />
            {error && <p className="text-red-600 mt-2">{error}</p>}
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-2 text-gray-700">📚 รหัสวิชาที่ยืม:*</label>
          <input
            list="courseList"
            placeholder="เลือกรหัสวิชา หรือพิมพ์เอง"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            className="w-full border p-3 rounded focus:ring-blue-500"
          />
          <datalist id="courseList">
            {commonCourses.map((code) => (
              <option key={code} value={code} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block font-semibold mb-2 text-gray-700">📝 เหตุผลการใช้งาน:*</label>
          <input
            list="reasonList"
            placeholder="เลือกหรือพิมพ์เหตุผล"
            value={usageReason}
            onChange={(e) => setUsageReason(e.target.value)}
            className="w-full border p-3 rounded focus:ring-blue-500"
          />
          <datalist id="reasonList">
            {commonReasons.map((reason) => (
              <option key={reason} value={reason} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block font-semibold mb-2 text-gray-700">📄 เอกสารอนุญาต (pdf/png)</label>
          <input
            type="file"
            onChange={(e) => setDocumentFile(e.target.files[0])}
            className="w-full border p-3 rounded focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-600 transition disabled:opacity-50"
        >
          {loading ? "⏳ กำลังบันทึก..." : "💾 บันทึก"}
        </button>
      </div>
    </div>
  );
}