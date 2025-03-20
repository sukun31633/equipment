import fs from "fs/promises";  // สำหรับการจัดการไฟล์
import path from "path";  // ใช้สำหรับการตั้งค่าที่อยู่ของไฟล์
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "../../../../lib/mysql";  // ใช้ฐานข้อมูล MySQL
import { format } from "date-fns";  // เพิ่ม library date-fns สำหรับการจัดการวันที่

export async function POST(req) {
    try {
        // ✅ ดึง session เพื่อตรวจสอบ user
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ success: false, message: "❌ กรุณาเข้าสู่ระบบ" }, { status: 401 });
        }

        // ✅ ใช้ formData() แทน json()
        const formData = await req.formData();

        // ❌ ไม่รับ userID และ borrowerName จากฟอร์ม ให้ใช้จาก session
        const borrowerName = session.user.name;
        const userID = session.user.id;

        // ✅ ดึงข้อมูลจากฟอร์ม
        const equipmentID = formData.get("equipmentID"); // รหัสอุปกรณ์
        const dueDate = formData.get("dueDate");
        const courseCode = formData.get("courseCode");  // ✅ เพิ่มรหัสวิชา
        const usageReason = formData.get("usageReason");  // เพิ่มการรับข้อมูลหมายเหตุ
        const documentFile = formData.get("document");    // 📝 รับไฟล์เอกสาร
        const status = formData.get("status") || "Pending";  // ค่า default เป็น Pending

        // ✅ ใช้วันที่ปัจจุบัน (current date) สำหรับ borrowDate
        const borrowDate = format(new Date(), "yyyy-MM-dd"); // ใช้ `date-fns` แปลงวันที่เป็นรูปแบบที่เหมาะสม

        // ✅ ตรวจสอบว่าอุปกรณ์มีอยู่จริงหรือไม่
        const [equipment] = await pool.query("SELECT id, name FROM equipment WHERE id = ?", [equipmentID]);

        if (equipment.length === 0) {
            return NextResponse.json({ success: false, message: "❌ ไม่พบอุปกรณ์ในระบบ" }, { status: 400 });
        }

        // ✅ การจัดการไฟล์เอกสาร
        let documentPath = null;
        if (documentFile && documentFile.name) {
            // สร้างโฟลเดอร์ upload ถ้ายังไม่มี
            const uploadDir = path.join(process.cwd(), "public/uploads");
            await fs.mkdir(uploadDir, { recursive: true });

            // สร้างชื่อไฟล์ใหม่เพื่อหลีกเลี่ยงปัญหาการซ้ำชื่อ
            const fileName = Date.now() + "_" + documentFile.name;
            documentPath = `/uploads/${fileName}`;

            // บันทึกไฟล์ลงโฟลเดอร์
            const buffer = await documentFile.arrayBuffer();
            await fs.writeFile(path.join(uploadDir, fileName), Buffer.from(buffer));
        }

        // ✅ บันทึกข้อมูลลงในฐานข้อมูล (เพิ่ม `courseCode`)
        const [result] = await pool.query(
            `INSERT INTO borrowing (borrowerName, userID, equipmentID, borrowDate, dueDate, courseCode, status, usageReason, document) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [borrowerName, userID, equipmentID, borrowDate, dueDate, courseCode, status, usageReason, documentPath]  // ✅ เก็บค่า courseCode
        );

        // ส่งข้อมูลการยืมและชื่ออุปกรณ์กลับ
        return NextResponse.json({
            success: true,
            message: "✅ ยืมอุปกรณ์สำเร็จ",
            data: {
                ...result,
                equipmentName: equipment[0].name,  // ส่งชื่ออุปกรณ์ที่ยืม
            },
        });

    } catch (error) {
        console.error("❌ เกิดข้อผิดพลาด:", error);
        return NextResponse.json(
            { success: false, message: "❌ ไม่สามารถทำการยืมอุปกรณ์ได้" },
            { status: 500 }
        );
    }
}