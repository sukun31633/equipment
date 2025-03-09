"use client";

import { useState, useEffect } from "react";
import { Switch } from "@headlessui/react";
import NavigationBar from "../components/NavigationBar";
import { useSession } from "next-auth/react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [smsNotification, setSmsNotification] = useState(false);
  const [emailNotification, setEmailNotification] = useState(false);

  if (status === "loading") {
    return <div className="text-center text-white mt-10">⏳ กำลังโหลดข้อมูล...</div>;
  }

  if (!session) {
    return <div className="text-center text-white mt-10">⚠️ กรุณาเข้าสู่ระบบ</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-indigo-600 flex flex-col items-center p-6 pb-24 w-full">
      {/* Header */}
      <div className="w-full max-w-4xl p-4 bg-white shadow-lg flex items-center justify-center rounded-lg">
        <h2 className="text-2xl font-bold text-blue-700">👤 โปรไฟล์</h2>
      </div>

      {/* Content */}
      <div className="w-full max-w-4xl mt-6 space-y-6">
        <div className="bg-white p-6 shadow-xl rounded-xl hover:shadow-2xl transition">
          <h3 className="text-blue-700 font-bold text-lg mb-4">📋 ข้อมูลผู้ใช้งาน</h3>
          <p className="text-gray-800">🔹 <strong>ชื่อ:</strong> {session.user.name || "ไม่ระบุ"}</p>
          <p className="text-gray-800">📧 <strong>อีเมล์:</strong> {session.user.email || "ไม่ระบุ"}</p>
          <p className="text-gray-800">🆔 <strong>รหัสประจำตัว:</strong> {session.user.id || "ไม่ระบุ"}</p>
          <p className="text-gray-800">📞 <strong>เบอร์โทร:</strong> {session.user.phoneNumber || "ไม่ระบุ"}</p>
        </div>

        <div className="bg-white p-6 shadow-xl rounded-xl hover:shadow-2xl transition">
          <h3 className="text-blue-700 font-bold text-lg mb-4">🔔 ตั้งค่าการแจ้งเตือน</h3>
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-800">📱 แจ้งเตือนผ่าน SMS</span>
            <Switch
              checked={smsNotification}
              onChange={setSmsNotification}
              className={`${smsNotification ? "bg-blue-500" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full transition`}
            >
              <span className="sr-only">Enable SMS Notification</span>
              <span className={`${smsNotification ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform bg-white rounded-full transition`} />
            </Switch>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-800">📩 แจ้งเตือนผ่าน Email</span>
            <Switch
              checked={emailNotification}
              onChange={setEmailNotification}
              className={`${emailNotification ? "bg-blue-500" : "bg-gray-300"} relative inline-flex h-6 w-11 items-center rounded-full transition`}
            >
              <span className="sr-only">Enable Email Notification</span>
              <span className={`${emailNotification ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform bg-white rounded-full transition`} />
            </Switch>
          </div>
        </div>
      </div>

      <NavigationBar />
    </div>
  );
}
