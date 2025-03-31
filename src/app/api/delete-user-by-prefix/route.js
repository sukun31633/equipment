import { NextResponse } from "next/server";
import pool from "../../../../lib/mysql";

export async function POST(req) {
  try {
    const { prefix } = await req.json();
    if (!prefix) {
      return NextResponse.json({ success: false, message: "ไม่มี prefix" }, { status: 400 });
    }

    const [result] = await pool.query(
      "DELETE FROM user WHERE userID LIKE CONCAT(?, '%')",
      [prefix]
    );

    return NextResponse.json({
      success: true,
      message: `ลบข้อมูลทั้งหมดที่ขึ้นต้นด้วย '${prefix}' แล้ว`,
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}
