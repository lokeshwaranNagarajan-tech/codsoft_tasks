import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const student = await prisma.student.findUnique({
    where: { id },
  });

  if (!student) {
    return NextResponse.json(
      { error: "Student not found" },
      { status: 404 }
    );
  }

  await prisma.student.delete({
    where: { id },
  });

  await prisma.user.delete({
    where: { id: student.userId },
  });

  return NextResponse.json({ success: true });
}