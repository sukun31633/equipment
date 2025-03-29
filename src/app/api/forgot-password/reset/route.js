import { NextResponse } from "next/server";
import pool from "../../../../../lib/mysql";

// ฟังก์ชันแปลงเบอร์โทรสำหรับใช้ในฐานข้อมูล
// ถ้าเบอร์โทรถูกส่งมาในรูปแบบ International Format (เช่น "+66999719451")
// ให้แปลงกลับเป็นรูปแบบ local (เช่น "0999719451")
function formatPhoneForDB(phone) {
  phone = phone.trim();
  if (phone.startsWith("+66")) {
    return "0" + phone.slice(3);
  }
  return phone;
}

export async function POST(request) {
  try {
    const { phone, newPassword } = await request.json();
    if (!phone || !newPassword) {
      return NextResponse.json({ success: false, message: "Missing phone or new password" });
    }

    // แปลงเบอร์โทรให้ตรงกับที่เก็บในฐานข้อมูล
    const formattedPhone = formatPhoneForDB(phone);

    // **ไม่แฮชรหัสผ่าน** ตามที่คุณต้องการ (เก็บเป็น plain text)
    const conn = await pool.getConnection();
    try {
      const [result] = await conn.query(
        "UPDATE user SET password = ? WHERE phoneNumber = ?",
        [newPassword, formattedPhone]
      );
      if (result.affectedRows === 0) {
        return NextResponse.json({ success: false, message: "No user found with this phone number" });
      }
    } finally {
      conn.release();
    }

    return NextResponse.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ success: false, message: error.message });
  }
}
