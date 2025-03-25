"use client"; // ✅ ต้องใส่ไว้ที่บรรทัดแรก

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // ใช้ useRouter()
import { Search, ArrowLeft, Users, Eye, EyeOff } from "lucide-react";

export default function ViewTeacherPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [teacherList, setTeacherList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState({});
  const router = useRouter(); // ใช้ useRouter() สำหรับการนำทาง

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await fetch("/api/view-users?type=อาจารย์"); // ดึงข้อมูลอาจารย์
      const data = await res.json();
      if (data.success) {
        setTeacherList(data.data);
      } else {
        console.error("⚠️ เกิดข้อผิดพลาดในการดึงข้อมูลอาจารย์");
      }
    } catch (error) {
      console.error("⚠️ Error fetching teachers:", error);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (id) => {
    setShowPasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredTeachers = teacherList.filter((teacher) =>
    teacher.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBack = () => {
    router.push("/admin/view-borrow"); // นำทางกลับ
  };

  // ฟังก์ชันนำทาง
  const navigateToPage = (page) => {
    router.push(`/admin/add-user/${page}`); // เปลี่ยนจาก navigateToPage เป็น router.push()
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-6 pb-24 flex flex-col items-center">
      {/* 🔹 Header Section */}
      <div className="w-full max-w-4xl bg-white p-4 shadow-lg flex items-center justify-between rounded-lg mb-6">
        <div className="flex items-center">
          <button onClick={handleBack} className="text-blue-500 hover:text-blue-700 transition">
            <ArrowLeft size={26} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800 ml-4">📚 ข้อมูลอาจารย์</h2>
        </div>
        <button
          onClick={() => router.push("/admin/add-user")}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center transition"
        >
          <Users size={20} className="mr-2" /> เพิ่มข้อมูลผู้ใช้งาน
        </button>
      </div>

      {/* 🔹 Search Bar */}
      <div className="w-full max-w-4xl bg-white p-4 shadow-md rounded-lg mb-6 flex items-center">
        <input
          type="text"
          placeholder="🔍 ค้นหาชื่ออาจารย์..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border-none p-3 rounded-l-md bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700"
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition">
          <Search size={22} />
        </button>
      </div>

      {/* 🔹 Teacher List */}
      <div className="w-full max-w-4xl space-y-4">
        {loading ? (
          <p className="text-gray-600 text-center">⏳ กำลังโหลดข้อมูล...</p>
        ) : filteredTeachers.length > 0 ? (
          filteredTeachers.map((teacher) => (
            <div key={teacher.userID} className="bg-white p-6 shadow-md rounded-lg flex justify-between items-center hover:shadow-xl transition">
              <div>
                <p className="font-bold text-lg text-gray-800">📌 {teacher.Name}</p>
                <p className="text-gray-600">📞 {teacher.phoneNumber}</p>
                <p className="text-gray-600">📧 {teacher.email}</p>
                <p className="text-gray-600">🆔 {teacher.userID}</p>
                <p className="text-gray-600">📌 สถานะ: {teacher.status}</p>

                {/* 🔑 แสดงรหัสผ่าน */}
                <div className="flex items-center space-x-2 mt-2">
                  <p className="text-gray-600">🔑 รหัสผ่าน:</p>
                  <span className="text-gray-800 font-mono bg-gray-200 px-2 py-1 rounded">
                    {showPasswords[teacher.userID] ? teacher.password : "••••••••"}
                  </span>
                  <button
                    onClick={() => togglePasswordVisibility(teacher.userID)}
                    className="text-blue-500 hover:text-blue-700 transition"
                  >
                    {showPasswords[teacher.userID] ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="flex space-x-2">
              <button
  className="bg-yellow-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-yellow-600 transition"
  onClick={() => router.push(`/admin/add-user/edit-user?id=${teacher.userID}`)} // เพิ่มการส่ง userID ไปยังหน้าแก้ไข
>
  ✏️ แก้ไข
</button>

                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-600 transition"
                >
                  🗑️ ลบ
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-center">❌ ไม่พบข้อมูลอาจารย์</p>
        )}
      </div>

      {/* 🔹 Navigation Buttons */}
      <div className="w-full max-w-4xl flex justify-between mt-8">
        <button
          className="bg-green-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-green-600 transition"
          onClick={() => navigateToPage("student")}
        >
          🎓 ข้อมูลนักศึกษา
        </button>
        <button
          className="bg-blue-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-600 transition"
          onClick={() => navigateToPage("teacher")}
        >
          📚 ข้อมูลอาจารย์
        </button>
        <button
          className="bg-purple-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-purple-600 transition"
          onClick={() => navigateToPage("admin")}
        >
          🏢 ข้อมูลเจ้าหน้าที่
        </button>
      </div>
    </div>
  );
}
