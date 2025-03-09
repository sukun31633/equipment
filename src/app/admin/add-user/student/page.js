"use client";

import { useState } from 'react';
import { Search, ArrowLeft, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ViewStudentPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');

  // ตัวอย่างข้อมูลนักศึกษา
  const mockStudents = [
    { id: 1, firstName: "ไมเคิล", lastName: "ใจดี", phone: "081-234-5678", studentId: "652222" },
    { id: 2, firstName: "สุกัลป์", lastName: "สวยงาม", phone: "081-987-6543", studentId: "664231" },
    { id: 3, firstName: "เมธี", lastName: "จริงใจ", phone: "082-345-6789", studentId: "667789" },
    { id: 4, firstName: "เสฉวน", lastName: "สมหวัง", phone: "089-876-5432", studentId: "653333" }
  ];

  // ฟิลเตอร์ข้อมูลนักศึกษา
  const filteredStudents = mockStudents.filter((student) =>
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // นำทางไปหน้าต่างๆ
  const navigateToPage = (page) => {
    router.push(`/admin/add-user/${page}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6 pb-24 flex flex-col items-center">
      {/* Header Section */}
      <div className="w-full max-w-4xl bg-white p-4 shadow-lg flex items-center justify-between rounded-lg mb-6">
        <div className="flex items-center">
          <button onClick={() => router.push('/admin/view-borrow')} className="text-blue-500 hover:text-blue-700 transition">
            <ArrowLeft size={26} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800 ml-4">🎓 ข้อมูลนักศึกษา</h2>
        </div>
        <button
          onClick={() => router.push('/admin/add-user')}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center transition"
        >
          <Users size={20} className="mr-2" /> เพิ่มข้อมูลผู้ใช้งาน
        </button>
      </div>

      {/* Search Bar */}
      <div className="w-full max-w-4xl bg-white p-4 shadow-md rounded-lg mb-6 flex items-center">
        <input
          type="text"
          placeholder="🔍 ค้นหารหัสนักศึกษา..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border-none p-3 rounded-l-md bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700"
        />
        <button className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 transition">
          <Search size={22} />
        </button>
      </div>

      {/* Student List */}
      <div className="w-full max-w-4xl space-y-4">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <div key={student.id} className="bg-white p-6 shadow-md rounded-lg flex justify-between items-center hover:shadow-xl transition">
              <div>
                <p className="font-bold text-lg text-gray-800">📌 {student.firstName} {student.lastName}</p>
                <p className="text-gray-600">📞 {student.phone}</p>
                <p className="text-gray-600">🆔 {student.studentId}</p>
              </div>
              <button 
                className="bg-yellow-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-yellow-600 transition"
                onClick={() => console.log('แก้ไข', student.id)}
              >
                ✏️ แก้ไข
              </button>
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-center">❌ ไม่พบข้อมูลนักศึกษา</p>
        )}
      </div>

      {/* Navigation Buttons */}
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
