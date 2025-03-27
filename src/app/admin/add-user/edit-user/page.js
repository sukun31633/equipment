"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

export default function EditUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [user, setUser] = useState({
    userID: "",
    name: "",
    phoneNumber: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      alert("\u274C ไม่พบ ID ผู้ใช้");
      router.back();
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/view-userall`);
        const data = await res.json();

        if (data.success && data.data.length > 0) {
          const foundUser = data.data.find((user) => user.userID.toString() === id);
          if (foundUser) {
            setUser({
              userID: foundUser.userID,
              name: foundUser.Name || "",
              phoneNumber: foundUser.phoneNumber || "",
              email: foundUser.email || "",
              password: foundUser.password || "",
            });
          } else {
            alert("\u26A0\uFE0F ไม่พบข้อมูลผู้ใช้ที่ต้องการแก้ไข");
            router.back();
          }
        } else {
          alert("\u26A0\uFE0F ไม่พบข้อมูลผู้ใช้");
          router.back();
        }
      } catch (error) {
        console.error("⚠️ เกิดข้อผิดพลาด:", error);
        alert("\u274C ไม่สามารถโหลดข้อมูลผู้ใช้ได้");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/update-user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ บันทึกข้อมูลผู้ใช้สำเร็จ");
        router.back();
      } else {
        alert("⚠️ ไม่สามารถบันทึกข้อมูลได้");
      }
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาด:", error);
      alert("⚠️ เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  if (loading) return <p className="text-center text-gray-600">⏳ กำลังโหลดข้อมูล...</p>;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <div className="w-full max-w-2xl bg-white p-4 shadow-lg flex items-center justify-between rounded-lg mb-6">
        <button onClick={() => router.back()} className="text-blue-500 flex items-center">
          <ArrowLeft size={24} className="mr-2" /> กลับ
        </button>
        <h2 className="text-lg font-semibold text-gray-800">🛠️ แก้ไขข้อมูลผู้ใช้</h2>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white p-6 shadow-lg rounded-lg">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-gray-700 font-medium">📦 ชื่อ</label>
            <input
              type="text"
              name="name"
              value={user.name}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">📞 หมายเลขโทรศัพท์</label>
            <input
              type="text"
              name="phoneNumber"
              value={user.phoneNumber}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">📧 อีเมล</label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium">🔑 รหัสผ่าน</label>
            <input
              type="text"
              name="password"
              value={user.password}
              onChange={handleChange}
              className="w-full border p-2 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

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
