"use client";

import { useState } from "react";
import { Search, ArrowLeft, Users } from "lucide-react";
import { useRouter } from "next/navigation";

const staffData = [
  { name: "จงจิต แซ่ลิ้ม", phone: "081-234-5678", id: "ST001" },
  { name: "โมสาธ แซ่ตั้ง", phone: "089-876-5432", id: "ST002" },
  { name: "เจนนิเฟอร์ แซ่ลี่", phone: "082-345-6789", id: "ST003" },
  { name: "อ่วม เจริญจิง", phone: "087-654-3210", id: "ST004" }
];

export default function ViewStaffPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const filteredStaff = staffData.filter((staff) =>
    staff.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBack = () => {
    router.push('/admin/view-borrow');
  };

  const navigateToPage = (page) => {
    router.push(`/admin/add-user/${page}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-6 pb-24 flex flex-col items-center">
      
      {/* 🔹 Header Section */}
      <div className="w-full max-w-4xl bg-white p-4 shadow-lg flex items-center justify-between rounded-lg mb-6">
        <div className="flex items-center">
          <button onClick={handleBack} className="text-blue-500 hover:text-blue-700 transition">
            <ArrowLeft size={26} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800 ml-4">👨‍💼 ข้อมูลเจ้าหน้าที่</h2>
        </div>
        <button
          onClick={() => router.push('/admin/add-user')}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center transition"
        >
          <Users size={20} className="mr-2" /> เพิ่มข้อมูลผู้ใช้งาน
        </button>
      </div>

      {/* 🔹 Search Bar */}
      <div className="w-full max-w-4xl bg-white p-4 shadow-md rounded-lg mb-6 flex items-center">
        <input
          type="text"
          placeholder="🔍 ค้นหาชื่อเจ้าหน้าที่..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border-none p-3 rounded-l-md bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700"
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition">
          <Search size={22} />
        </button>
      </div>

      {/* 🔹 Staff List */}
      <div className="w-full max-w-4xl space-y-4">
        {filteredStaff.length > 0 ? (
          filteredStaff.map((staff) => (
            <div key={staff.id} className="bg-white p-6 shadow-md rounded-lg flex justify-between items-center hover:shadow-xl transition">
              <div>
                <p className="font-bold text-lg text-gray-800">📌 {staff.name}</p>
                <p className="text-gray-600">📞 {staff.phone}</p>
                <p className="text-gray-600">🆔 {staff.id}</p>
              </div>
              <button 
                className="bg-yellow-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-yellow-600 transition"
              >
                ✏️ แก้ไข
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-center">❌ ไม่พบข้อมูลเจ้าหน้าที่</p>
        )}
      </div>

      {/* 🔹 Navigation Buttons */}
      <div className="w-full max-w-4xl flex justify-between mt-8">
        <button 
          className="bg-green-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-green-600 transition"
          onClick={() => navigateToPage('student')}
        >
          🎓 ข้อมูลนักศึกษา
        </button>
        <button 
          className="bg-blue-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-600 transition"
          onClick={() => navigateToPage('teacher')}
        >
          📚 ข้อมูลอาจารย์
        </button>
        <button 
          className="bg-purple-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-purple-600 transition"
          onClick={() => navigateToPage('admin')}
        >
          🏢 ข้อมูลเจ้าหน้าที่
        </button>
      </div>
    </div>
  );
}
