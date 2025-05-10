"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";

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
      <div className="w-full mb-8 flex gap-2">
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

      {/* User Cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-full text-center text-gray-600">
            ⏳ กำลังโหลด...
          </p>
        ) : filtered.length > 0 ? (
          filtered.map((user) => (
            <div
              key={user.userID}
              className="bg-white rounded-2xl shadow-md p-6 flex flex-col hover:shadow-lg transition-transform transform hover:scale-[1.02]"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xl font-semibold">
                  {user.Name.charAt(0)}
                </div>
                <div className="ml-4">
                  <p className="text-lg font-medium">{user.Name}</p>
                  <p className="text-sm text-gray-500">ID: {user.userID}</p>
                </div>
              </div>
              <div className="space-y-1 text-gray-700 mb-4">
                <p>
                  <span className="font-medium">อีเมล:</span> {user.email}
                </p>
                <p>
                  <span className="font-medium">โทร:</span> {user.phoneNumber}
                </p>
              </div>
              <button
                onClick={() =>
                  router.push(`/admin/view-borrow/user-history/${user.userID}`)
                }
                className="mt-auto bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg transition"
              >
                ดูประวัติยืมอุปกรณ์
              </button>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-600">
            ℹ️ ไม่พบผู้ใช้งาน
          </p>
        )}
      </div>
    </div>
  );
}
