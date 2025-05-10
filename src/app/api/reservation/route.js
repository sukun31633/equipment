import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "../../../../lib/mysql";
import fs from "fs/promises";
import path from "path";

export async function POST(req) {
  try {
    // ตรวจสอบ session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "❌ กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    // อ่านฟอร์ม
    const formData = await req.formData();

    // ดึง user จาก session
    const reserverName = session.user.name;
    const userID       = session.user.id;

    // ดึง equipmentID จากฟอร์ม
    const equipmentID = formData.get("equipmentID");
    console.log("equipmentID:", equipmentID);

    // ดึงข้อมูลวันที่และเวลา
    const startDate   = formData.get("startDate");
    const reserveTime = formData.get("reserveTime");
    const endDate     = formData.get("endDate");
    const courseCode  = formData.get("courseCode");
    const usageReason = formData.get("usageReason");
    const documentFile = formData.get("document");

    const fullStartDate = `${startDate} ${reserveTime}`;

    // ตรวจสอบว่า equipmentID มีอยู่
    const [equipCheck] = await pool.query(
      "SELECT id FROM equipment WHERE id = ?",
      [equipmentID]
    );
    if (equipCheck.length === 0) {
      return NextResponse.json(
        { success: false, message: "❌ ไม่พบอุปกรณ์ในระบบ" },
        { status: 400 }
      );
    }

    // อัปเดตสถานะอุปกรณ์
    await pool.query(
      "UPDATE equipment SET status = ? WHERE id = ?",
      ["Not Available", equipmentID]
    );

    // บันทึกไฟล์เอกสารถ้ามี
    let documentPath = "";
    if (documentFile?.name) {
      const uploadDir = path.join(process.cwd(), "public/uploads");
      await fs.mkdir(uploadDir, { recursive: true });
      const fileName = `${Date.now()}_${documentFile.name}`;
      documentPath = `/uploads/${fileName}`;
      const buffer = await documentFile.arrayBuffer();
      await fs.writeFile(
        path.join(uploadDir, fileName),
        Buffer.from(buffer)
      );
    }

    // ตรวจสอบ userID ใน DB
    const [userCheck] = await pool.query(
      "SELECT userID FROM user WHERE userID = ?",
      [userID]
    );
    if (userCheck.length === 0) {
      throw new Error("❌ ไม่พบ user ในระบบ");
    }

    // บันทึกการจอง
    const [result] = await pool.query(
      `INSERT INTO reservation
        (reserverName, userID, equipmentID, startDate, endDate, courseCode, usageReason, document, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
      [
        reserverName,
        userID,
        equipmentID,
        fullStartDate,
        endDate,
        courseCode,
        usageReason,
        documentPath,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "✅ จองอุปกรณ์สำเร็จ",
      data: result,
    });
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
    return NextResponse.json(
      { success: false, message: "❌ ไม่สามารถจองอุปกรณ์ได้" },
      { status: 500 }
    );
  }
}
