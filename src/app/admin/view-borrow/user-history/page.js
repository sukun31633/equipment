"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function UserHistoryListingPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const res = await fetch("/api/view-userall");
        const json = await res.json();
        if (json.success) setUsers(json.data);
      } catch (err) {
        console.error("❌ ไม่สามารถโหลดข้อมูลผู้ใช้:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // full-screen spinner ขณะโหลด
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-200">
        <Loader2 size={64} className="animate-spin text-gray-600" />
      </div>
    );
  }

  const filtered = users.filter(
    (u) =>
      u.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(u.userID).includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col py-6 px-4">
      {/* Header */}
      <div className="w-full flex items-center mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-gray-300 transition"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="flex-1 text-center text-3xl font-semibold">
          ประวัติผู้ใช้งาน
        </h1>
      </div>

      {/* Search */}
      <div className="w-full mb-6 flex gap-2">
        <div className="flex-1 flex items-center bg-white rounded-lg shadow px-4 py-2">
          <Search className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้ใช้ หรือ รหัสผู้ใช้งาน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 outline-none bg-transparent"
          />
        </div>
        <button
          onClick={() => {}}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 rounded-lg transition"
        >
          ค้นหา
        </button>
      </div>

      {/* User Table */}
      <div className="w-full overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left text-gray-700">ชื่อผู้ใช้</th>
              <th className="px-4 py-2 text-left text-gray-700">รหัสผู้ใช้งาน</th>
              <th className="px-4 py-2 text-left text-gray-700">อีเมล</th>
              <th className="px-4 py-2 text-left text-gray-700">โทรศัพท์</th>
              <th className="px-4 py-2 text-center text-gray-700">ประวัติ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((user) => (
                <tr
                  key={user.userID}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3">{user.Name}</td>
                  <td className="px-4 py-3">{user.userID}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">{user.phoneNumber}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() =>
                        router.push(
                          `/admin/view-borrow/user-history/${user.userID}`
                        )
                      }
                      className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-1 rounded-lg transition"
                    >
                      ดูประวัติ
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-4 py-6 text-center text-gray-600"
                  colSpan={5}
                >
                  ℹ️ ไม่พบผู้ใช้งาน
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
