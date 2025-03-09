import { NextResponse } from "next/server";
import pool from "../../../../lib/mysql";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
    try {
        const uploadDir = path.join(process.cwd(), "public/uploads");

        // ตรวจสอบและสร้างโฟลเดอร์อัปโหลดหากยังไม่มี
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // ใช้ req.formData() แทน formidable
        const formData = await req.formData();

        const name = formData.get("name");
        const equipmentCode = formData.get("equipment_code"); // ✅ เพิ่มรหัสอุปกรณ์
        const brand = formData.get("brand");
        const category = formData.get("category");
        const description = formData.get("description");
        const location = formData.get("location");

        const imageFile = formData.get("image");

        let imagePath = "";
        if (imageFile && imageFile.name) {
            const imageName = Date.now() + "_" + imageFile.name;
            imagePath = `/uploads/${imageName}`;

            const fileBuffer = await imageFile.arrayBuffer();
            fs.writeFileSync(path.join(uploadDir, imageName), Buffer.from(fileBuffer));
        }

        // เพิ่มข้อมูลอุปกรณ์ลงในฐานข้อมูล
        const [result] = await pool.query(
            `INSERT INTO equipment (name, equipment_code, brand, category, description, location, image) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`, // ✅ ลบ quantity และเพิ่ม equipment_code
            [name, equipmentCode, brand, category, description, location, imagePath]
        );

        return NextResponse.json({
            success: true,
            message: "เพิ่มข้อมูลอุปกรณ์สำเร็จ",
            data: result,
        });
    } catch (error) {
        console.error("เกิดข้อผิดพลาด:", error.message);
        return NextResponse.json(
            { success: false, message: "เกิดข้อผิดพลาดในการเพิ่มข้อมูล" },
            { status: 500 }
        );
    }
}
