import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import pool from "../../../../lib/mysql";
import fs from "fs/promises";
import path from "path";

export async function POST(req) {
    try {
        // ✅ ดึง session เพื่อตรวจสอบ user
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ success: false, message: "❌ กรุณาเข้าสู่ระบบ" }, { status: 401 });
        }

        // ✅ ใช้ formData() แทน json()
        const formData = await req.formData();

        // ❌ userID และ reserverName ห้ามรับจากฟอร์ม ให้ใช้จาก session แทน!
        const reserverName = session.user.name;
        const userID = session.user.id;

        // ✅ ดึงข้อมูลจากฟอร์ม
        const reservedEquipments = formData.get("reservedEquipments"); // ชื่ออุปกรณ์
        const startDate = formData.get("startDate");
        const endDate = formData.get("endDate");
        const courseCode = formData.get("courseCode");
        const usageReason = formData.get("usageReason");
        const documentFile = formData.get("document"); // 📝 รับไฟล์เอกสาร
        const reserveTime = formData.get("reserveTime"); // รับเวลาจากฟอร์ม

        // ✅ รวม startDate และ reserveTime
        const fullStartDate = `${startDate} ${reserveTime}`; // รวมวันที่และเวลา

        // ✅ ตรวจสอบว่าอุปกรณ์มีอยู่จริงหรือไม่
        const [equipment] = await pool.query("SELECT id FROM equipment WHERE name = ?", [reservedEquipments]);

        if (equipment.length === 0) {
            return NextResponse.json({ success: false, message: "❌ ไม่พบอุปกรณ์ในระบบ" }, { status: 400 });
        }

        const equipmentID = equipment[0].id; // ✅ ใช้ `equipmentID` แทนชื่ออุปกรณ์

        // ✅ อัพเดตสถานะอุปกรณ์เป็น "Not Available" เมื่อมีการจอง
        await pool.query("UPDATE equipment SET status = ? WHERE id = ?", ["Not Available", equipmentID]);

        let documentPath = "";
        if (documentFile && documentFile.name) {
            // 📂 บันทึกไฟล์ลงโฟลเดอร์ uploads
            const uploadDir = path.join(process.cwd(), "public/uploads");
            await fs.mkdir(uploadDir, { recursive: true });

            const fileName = Date.now() + "_" + documentFile.name;
            documentPath = `/uploads/${fileName}`;

            const buffer = await documentFile.arrayBuffer();
            await fs.writeFile(path.join(uploadDir, fileName), Buffer.from(buffer));
        }

        // ✅ ตรวจสอบ userID ใน database
        const [userCheck] = await pool.query("SELECT * FROM user WHERE userID = ?", [userID]);
        if (userCheck.length === 0) {
            throw new Error("❌ ไม่พบ userID ในฐานข้อมูล");
        }

        // ✅ บันทึกข้อมูลลงฐานข้อมูลโดยใช้ `equipmentID`
        const [result] = await pool.query(
            `INSERT INTO reservation (reserverName, userID, equipmentID, startDate, endDate, courseCode, usageReason, document, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
            [reserverName, userID, equipmentID, fullStartDate, endDate, courseCode, usageReason, documentPath]
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
