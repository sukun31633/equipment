import { NextResponse } from "next/server";
import pool from "../../../../../lib/mysql";
import twilio from "twilio";

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// ฟังก์ชันแปลงเบอร์โทร: ถ้าเบอร์ขึ้นต้นด้วย "0" เปลี่ยนเป็น "+66"
function formatPhone(phone) {
  phone = phone.trim();
  if (phone.startsWith("0")) {
    return "+66" + phone.slice(1);
  }
  return phone;
}

export async function POST(request) {
  try {
    const { phone } = await request.json();
    if (!phone) {
      return NextResponse.json({ success: false, message: "No phone number provided" });
    }

    const formattedPhone = formatPhone(phone);

    // สร้าง OTP 6 หลัก
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // OTP หมดอายุใน 5 นาที

    // เชื่อมต่อฐานข้อมูลและเก็บ OTP ลงในตาราง otp_codes
    const conn = await pool.getConnection();
    try {
      // ลบ OTP เก่าของเบอร์นี้ (ถ้ามี)
      await conn.query("DELETE FROM otp_codes WHERE phone = ?", [formattedPhone]);

      // Insert OTP ใหม่
      await conn.query(
        "INSERT INTO otp_codes (phone, otp, expires) VALUES (?, ?, ?)",
        [formattedPhone, otp, expires]
      );
    } finally {
      conn.release();
    }

    // ส่ง SMS ผ่าน Twilio
    await client.messages.create({
      body: `รหัส OTP ของคุณคือ: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    return NextResponse.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error requesting OTP:", error);
    return NextResponse.json({ success: false, message: error.message });
  }
}