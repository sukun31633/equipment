import { NextResponse } from "next/server";
import { read, utils } from "xlsx";
import pool from "../../../../lib/mysql";

export async function POST(request) {
  try {
    // 1) รับไฟล์จาก formData
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ success: false, message: "No file uploaded" });
    }

    // 2) อ่านไฟล์เป็น buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3) อ่านข้อมูลจาก Excel ด้วยฟังก์ชัน read()
    const workbook = read(buffer, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // 4) แปลง Sheet เป็น Array ของ Array (header: 1)
    const jsonData = utils.sheet_to_json(worksheet, { header: 1 });
    if (!jsonData || jsonData.length === 0) {
      return NextResponse.json({ success: false, message: "Excel file is empty" });
    }

    // แถวแรกคือ header
    const header = jsonData[0];
    // หาตำแหน่งคอลัมน์ตามต้องการ
    const indexStatus = header.indexOf("สถานภาพ");
    const indexStudentID = header.indexOf("รหัสนักศึกษา");
    const indexName = header.indexOf("ชื่อ-นามสกุล");
    const indexIdCard = header.indexOf("เลขบัตรประชาชน");
    const indexPhone = header.indexOf("เบอร์โทร");
    const indexEmail = header.indexOf("อีเมล์");

    if (
      indexStatus === -1 ||
      indexStudentID === -1 ||
      indexName === -1 ||
      indexIdCard === -1 ||
      indexPhone === -1 ||
      indexEmail === -1
    ) {
      return NextResponse.json({
        success: false,
        message: "Excel file missing required columns",
      });
    }

    // กรองแถวที่สถานภาพ = "ปกติ"
    const rows = jsonData.slice(1); // ข้ามแถว header
    const filteredRows = rows.filter((row) => row[indexStatus] === "ปกติ");

    if (filteredRows.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No rows with status 'ปกติ' found",
      });
    }

    // Map ข้อมูลที่ต้องการ
    const studentData = filteredRows.map((row) => ({
      studentID: row[indexStudentID] || "",
      fullName: row[indexName] || "",
      idCard: row[indexIdCard] || "",
      phone: row[indexPhone] || "",
      email: row[indexEmail] || "",
    }));

    // 5) Insert ลงตาราง user
    const conn = await pool.getConnection();
    try {
      for (const student of studentData) {
        await conn.query(
          `INSERT INTO user (userID, status, Name, phoneNumber, email, password)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            student.studentID,
            "นักศึกษา",
            student.fullName,
            student.phone,
            student.email,
            student.idCard, // ใช้เลขบัตรเป็น password (ตัวอย่าง)
          ]
        );
      }
    } finally {
      conn.release();
    }

    return NextResponse.json({ success: true, message: "Import completed" });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ success: false, message: error.message });
  }
}
