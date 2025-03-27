"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// ไอคอนจาก lucide-react
import { 
  Search, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Trash2, 
  Upload, 
  Users 
} from "lucide-react";

export default function ViewStudentPage() {
  const router = useRouter();

  // State สำหรับจัดการข้อมูลนักศึกษา, การค้นหา, การโหลดข้อมูล
  const [searchTerm, setSearchTerm] = useState("");
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(true);

  // State สำหรับแสดง/ซ่อนรหัสผ่าน
  const [showPasswords, setShowPasswords] = useState({});

  // State สำหรับอัปโหลดไฟล์ Excel
  const [selectedFile, setSelectedFile] = useState(null);
  const [showImportForm, setShowImportForm] = useState(false);

  // เรียกใช้ครั้งแรกเพื่อดึงข้อมูลนักศึกษาทั้งหมด
  useEffect(() => {
    fetchStudents();
  }, []);

  // ฟังก์ชันดึงข้อมูลนักศึกษา
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/view-users?type=นักศึกษา`);
      const data = await res.json();
      if (data.success) {
        setStudentList(data.data);
      } else {
        console.error("⚠️ เกิดข้อผิดพลาดในการดึงข้อมูลนักศึกษา");
        setStudentList([]);
      }
    } catch (error) {
      console.error("⚠️ Error fetching students:", error);
      setStudentList([]);
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันแสดง/ซ่อนรหัสผ่านของแต่ละ user
  const togglePasswordVisibility = (userID) => {
    setShowPasswords((prev) => ({
      ...prev,
      [userID]: !prev[userID],
    }));
  };

  // ลบผู้ใช้รายคน
  const handleDeleteUser = async (userID) => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้นี้?")) return;
    try {
      const res = await fetch(`/api/delete-user`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID }),
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ ลบข้อมูลผู้ใช้สำเร็จ");
        fetchStudents();
      } else {
        alert("❌ ไม่สามารถลบข้อมูลได้");
      }
    } catch (error) {
      console.error("❌ ลบข้อมูลผิดพลาด:", error);
    }
  };

  // ลบผู้ใช้ทั้งหมดที่ status = "นักศึกษา"
  const handleDeleteAll = async () => {
    if (!confirm("⚠️ ต้องการลบนักศึกษาทั้งหมดใช่หรือไม่?")) return;
    try {
      const res = await fetch(`/api/delete-user-type`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "นักศึกษา" }),
      });
      const data = await res.json();
      if (data.success) {
        alert("✅ ลบข้อมูลนักศึกษาทั้งหมดเรียบร้อยแล้ว");
        fetchStudents();
      } else {
        alert("❌ ไม่สามารถลบข้อมูลทั้งหมดได้");
      }
    } catch (error) {
      console.error("❌ ลบทั้งหมดผิดพลาด:", error);
    }
  };

  // ฟังก์ชันกดปุ่มย้อนกลับ
  const handleBack = () => {
    router.push("/admin/view-borrow");
  };

  // ฟิลเตอร์รายชื่อนักศึกษาจาก searchTerm
  const filteredStudents = studentList.filter((student) =>
    student.Name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ===== ส่วนของการอัปโหลดไฟล์ Excel =====
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      alert("กรุณาเลือกไฟล์ Excel ก่อน");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      // เรียก API สำหรับ Import ข้อมูลนักศึกษา
      const res = await fetch("/api/import-student", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert("นำเข้าข้อมูลสำเร็จ!");
        fetchStudents();           // รีเฟรชรายชื่อ
        setShowImportForm(false);  // ปิดฟอร์มอัปโหลด
        setSelectedFile(null);     // เคลียร์ไฟล์
      } else {
        alert("นำเข้าข้อมูลไม่สำเร็จ: " + data.message);
      }
    } catch (error) {
      console.error("❌ Error uploading file:", error);
      alert("เกิดข้อผิดพลาดในการอัปโหลดไฟล์");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-6 pb-24 flex flex-col items-center">
      {/* Header Section */}
      <div className="w-full max-w-4xl bg-white p-4 shadow-lg flex items-center justify-between rounded-lg mb-6">
        <div className="flex items-center">
          <button onClick={handleBack} className="text-blue-500 hover:text-blue-700 transition">
            <ArrowLeft size={26} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800 ml-4">
            🎓 ข้อมูลนักศึกษา
          </h2>
        </div>
        <div className="flex space-x-2">
          {/* ปุ่มเพิ่มข้อมูลผู้ใช้งาน (ไปอีกหน้าที่คุณมีอยู่เดิม) */}
          <button
            onClick={() => router.push("/admin/add-user")}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center transition"
          >
            <Users size={20} className="mr-2" />
            เพิ่มข้อมูลผู้ใช้งาน
          </button>

          {/* ปุ่ม Import Excel */}
          <button
            onClick={() => setShowImportForm(!showImportForm)}
            className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 flex items-center transition"
          >
            <Upload size={20} className="mr-2" />
            นำเข้าข้อมูลนักศึกษาผ่านExcell
          </button>

          {/* ปุ่มลบนักศึกษาทั้งหมด */}
          <button
            onClick={handleDeleteAll}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center transition"
          >
            <Trash2 size={20} className="mr-2" />
            ลบนักศึกษาทั้งหมด
          </button>
        </div>
      </div>

      {/* ฟอร์มอัปโหลด Excel */}
      {showImportForm && (
        <div className="w-full max-w-4xl bg-white p-4 shadow-md rounded-lg mb-6">
          <div className="flex items-center space-x-2">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="border border-gray-300 rounded-md p-1"
            />
            <button
              onClick={handleFileUpload}
              className="bg-indigo-500 text-white px-4 py-2 rounded-md hover:bg-indigo-600 flex items-center transition"
            >
              <Upload size={20} className="mr-2" />
              Upload File
            </button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="w-full max-w-4xl bg-white p-4 shadow-md rounded-lg mb-6 flex items-center">
        <input
          type="text"
          placeholder="🔍 ค้นหาชื่อนักศึกษา..."
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
        {loading ? (
          <p className="text-gray-600 text-center">
            ⏳ กำลังโหลดข้อมูล...
          </p>
        ) : filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <div
              key={student.userID}
              className="bg-white p-6 shadow-md rounded-lg flex justify-between items-center hover:shadow-xl transition"
            >
              <div>
                <p className="font-bold text-lg text-gray-800">
                  📌 {student.Name}
                </p>
                <p className="text-gray-600">📞 {student.phoneNumber}</p>
                <p className="text-gray-600">📧 {student.email}</p>
                <p className="text-gray-600">🆔 {student.userID}</p>
                <p className="text-gray-600">📌 สถานะ: {student.status}</p>

                {/* แสดงรหัสผ่าน */}
                <div className="flex items-center space-x-2 mt-2">
                  <p className="text-gray-600">🔑 รหัสผ่าน:</p>
                  <span className="text-gray-800 font-mono bg-gray-200 px-2 py-1 rounded">
                    {showPasswords[student.userID]
                      ? student.password
                      : "••••••••"}
                  </span>
                  <button
                    onClick={() => togglePasswordVisibility(student.userID)}
                    className="text-blue-500 hover:text-blue-700 transition"
                  >
                    {showPasswords[student.userID] ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  className="bg-yellow-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-yellow-600 transition"
                  onClick={() =>
                    router.push(`/admin/add-user/edit-user?id=${student.userID}`)
                  }
                >
                  ✏️ แก้ไข
                </button>
                <button
                  onClick={() => handleDeleteUser(student.userID)}
                  className="bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-600 transition"
                >
                  🗑️ ลบ
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-600 text-center">
            ❌ ไม่พบข้อมูลนักศึกษา
          </p>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="w-full max-w-4xl flex justify-between mt-8">
        <button
          className="bg-green-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-green-600 transition"
          onClick={() => router.push("/admin/add-user/student")}
        >
          🎓 ข้อมูลนักศึกษา
        </button>
        <button
          className="bg-blue-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-600 transition"
          onClick={() => router.push("/admin/add-user/teacher")}
        >
          📚 ข้อมูลอาจารย์
        </button>
        <button
          className="bg-purple-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-purple-600 transition"
          onClick={() => router.push("/admin/add-user/admin")}
        >
          🏢 ข้อมูลเจ้าหน้าที่
        </button>
      </div>
    </div>
  );
}
