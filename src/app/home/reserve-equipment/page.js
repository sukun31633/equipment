"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";  
import { ArrowLeft } from "lucide-react";

export default function ReserveEquipmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();  

  const equipmentID = searchParams.get("id");
  const [equipmentName, setEquipmentName] = useState("กำลังโหลด...");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reserveTime, setReserveTime] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [usageReason, setUsageReason] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // รายการวิชาที่ใช้บ่อย
  const commonCourses = ["CS3513 IOT", "CS4413 NETWORK", "CS3533 OPERATING SYSTEMS", "CS4903 SPECIAL PROJECT"];
  // รายการเหตุผลที่ใช้บ่อย
  const commonReasons = ["ทำโปรเจค", "แสดงนิทรรศการ", "ทำวิจัย", "เรียนภาคปฏิบัติ"];

  const timeOptions = [
    "08:30","09:00","09:30","10:00","10:30","11:00","11:30",
    "12:00","12:30","13:00","13:30","14:00","14:30","15:00",
    "15:30","16:00","16:30"
  ];

  useEffect(() => {
    if (equipmentID) {
      const fetchEquipment = async () => {
        try {
          const res = await fetch(`/api/view-equipment?id=${equipmentID}`);
          const data = await res.json();
          if (data.success && data.data.length > 0) setEquipmentName(data.data[0].name);
          else setEquipmentName("ไม่พบข้อมูลอุปกรณ์");
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

  const handleBack = () => {
    router.back();
  };

  const handleReserve = async () => {
    if (!startDate || !endDate || !reserveTime || !courseCode || !usageReason) {
      alert("⚠️ กรุณากรอกข้อมูลให้ครบถ้วน"); return;
    }
    const fullStart = `${startDate} ${reserveTime}`;
    const startObj = new Date(fullStart);
    const endObj = new Date(endDate);
    const now = new Date();

    if (startObj < now) { setError("❌ เวลารับอุปกรณ์ต้องเป็นเวลาในอนาคต"); return; }
    if (endObj < startObj) { setError("❌ วันที่คืนไม่สามารถย้อนกลับไปก่อนวันที่รับอุปกรณ์ได้"); return; }
    if (!session?.user) { alert("❌ กรุณาเข้าสู่ระบบก่อนทำการจองอุปกรณ์"); return; }

    const reserverName = session.user.name || "ไม่ทราบชื่อ";
    const userID = session.user.id || "-";

    setError(""); setLoading(true);
    try {
      const formData = new FormData();
      formData.append("reserverName", reserverName);
      formData.append("userID", userID);
      formData.append("reservedEquipments", equipmentName);
      formData.append("startDate", fullStart);
      formData.append("endDate", endDate);
      formData.append("courseCode", courseCode);
      formData.append("usageReason", usageReason);
      if (file) formData.append("document", file);

      const res = await fetch("/api/reservation", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) {
        await fetch("/api/notifications/newRequest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ equipmentID, reserverName, type: "reserve" }),
        });
        alert("✅ การจองสำเร็จและแจ้งเตือนเจ้าหน้าที่แล้ว!");
        router.push("/home");
      } else alert(data.message || "❌ ไม่สามารถทำการจองได้");
    } catch (err) {
      console.error(err);
      alert("❌ เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally { setLoading(false); }
  };

  return (
    <div className="p-8 pt-16 min-h-screen bg-gradient-to-br from-blue-500 to-blue-300 flex flex-col items-center w-full relative">
      <button onClick={handleBack} className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center text-white bg-gray-900 px-4 py-2 rounded-lg shadow-md hover:bg-gray-800 transition">
        <ArrowLeft className="mr-2" /> ย้อนกลับ
      </button>

      <h1 className="text-3xl font-bold text-white mb-4 text-center">📅 จองอุปกรณ์</h1>
      <h2 className="text-lg font-semibold text-white mb-2 text-center">🛠 {equipmentName}</h2>
      <h2 className="text-lg font-semibold text-white mb-8 text-center">🙋‍♂️ ผู้ใช้งาน: {session?.user?.name || "ไม่ทราบชื่อ"}</h2>

      <div className="bg-white p-8 shadow-xl rounded-xl w-full max-w-3xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block font-semibold mb-2 text-gray-700">📅 วันที่รับอุปกรณ์:*</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block font-semibold mb-2 text-gray-700">📅 วันที่คืนอุปกรณ์:*</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500" />
            {error && <p className="text-red-600 mt-2">{error}</p>}
          </div>
          <div>
            <label className="block font-semibold mb-2 text-gray-700">⏰ เวลารับอุปกรณ์:*</label>
            <select value={reserveTime} onChange={e => setReserveTime(e.target.value)} className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500">
              <option value="">-- เลือกเวลา --</option>
              {timeOptions.map(time => <option key={time} value={time}>{time}</option>)}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-2 text-gray-700">📚 รหัสวิชาที่ยืม:*</label>
            <input
              list="courseList"
              placeholder="เลือกรหัสวิชา หรือพิมพ์เอง"
              value={courseCode}
              onChange={e => setCourseCode(e.target.value)}
              className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500"
            />
            <datalist id="courseList">
              {commonCourses.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block font-semibold mb-2 text-gray-700">📝 เหตุผลการใช้งาน:*</label>
            <input
              list="reasonList"
              placeholder="เลือกหรือพิมพ์เหตุผล"
              value={usageReason}
              onChange={e => setUsageReason(e.target.value)}
              className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500"
            />
            <datalist id="reasonList">
              {commonReasons.map(r => <option key={r} value={r} />)}
            </datalist>
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block font-semibold mb-2 text-gray-700">📄 อัปโหลดเอกสารการอนุญาต (ถ้ามี) (รูปแบบ pdf. และ png.)</label>
            <input type="file" onChange={e => setFile(e.target.files[0])} className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <button
          onClick={handleReserve}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-600 transition disabled:opacity-50"
        >
          {loading ? "⏳ กำลังบันทึก..." : "💾 บันทึก"}
        </button>
      </div>
    </div>
  );
}
