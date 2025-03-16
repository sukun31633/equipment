import { NextResponse } from "next/server";
import pool from "../../../../lib/mysql";

export async function PUT(req) {
  try {
    const updatedData = await req.json();
    const { id, name, brand, category, equipment_code, location, description } = updatedData;

    if (!id) return NextResponse.json({ success: false, message: "❌ ไม่มี ID อุปกรณ์" }, { status: 400 });

    await pool.query(
      "UPDATE equipment SET name=?, brand=?, category=?, equipment_code=?, location=?, description=? WHERE id=?",
      [name, brand, category, equipment_code, location, description, id]
    );

    return NextResponse.json({ success: true, message: "✅ อัปเดตข้อมูลสำเร็จ" });
  } catch (error) {
    return NextResponse.json({ success: false, message: "❌ อัปเดตข้อมูลไม่สำเร็จ" }, { status: 500 });
  }
}
