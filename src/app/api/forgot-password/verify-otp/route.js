import { NextResponse } from "next/server";
import pool from "../../../../../lib/mysql";

function formatPhone(phone) {
  phone = phone.trim();
  if (phone.startsWith("0")) {
    return "+66" + phone.slice(1);
  }
  return phone;
}

export async function POST(request) {
  try {
    const { phone, otp } = await request.json();
    if (!phone || !otp) {
      return NextResponse.json({ success: false, message: "Missing phone or OTP" });
    }

    const formattedPhone = formatPhone(phone);

    // ดึงข้อมูล OTP จากตาราง otp_codes ด้วยเบอร์ที่ผ่านการแปลงแล้ว
    const conn = await pool.getConnection();
    let rows;
    try {
      [rows] = await conn.query(
        "SELECT otp, expires FROM otp_codes WHERE phone = ? LIMIT 1",
        [formattedPhone]
      );
    } finally {
      conn.release();
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: false, message: "No OTP requested for this phone" });
    }

    const record = rows[0];
    if (Date.now() > record.expires) {
      return NextResponse.json({ success: false, message: "OTP expired" });
    }
    if (record.otp !== otp) {
      return NextResponse.json({ success: false, message: "Invalid OTP" });
    }

    // OTP ถูกต้องแล้ว ลบ record ออกจากตารางเพื่อป้องกันการใช้ซ้ำ
    const conn2 = await pool.getConnection();
    try {
      await conn2.query("DELETE FROM otp_codes WHERE phone = ?", [formattedPhone]);
    } finally {
      conn2.release();
    }

    return NextResponse.json({ success: true, message: "OTP verified" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json({ success: false, message: error.message });
  }
}
