/*
  Warnings:

  - You are about to drop the column `amount` on the `Fee` table. All the data in the column will be lost.
  - You are about to drop the column `paid` on the `Fee` table. All the data in the column will be lost.
  - You are about to drop the column `paidDate` on the `Fee` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[departmentId,year,section]` on the table `ClassAdvisor` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentId,subjectId,examId]` on the table `Mark` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[facultyId,subjectId,academicYear]` on the table `SubjectAssignment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `paidAmount` to the `Fee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pendingAmount` to the `Fee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Fee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalFee` to the `Fee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."FeeStatus" AS ENUM ('PAID', 'PENDING', 'PARTIAL');

-- DropForeignKey
ALTER TABLE "public"."Attendance" DROP CONSTRAINT "Attendance_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Attendance" DROP CONSTRAINT "Attendance_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ClassAdvisor" DROP CONSTRAINT "ClassAdvisor_facultyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Faculty" DROP CONSTRAINT "Faculty_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Fee" DROP CONSTRAINT "Fee_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Mark" DROP CONSTRAINT "Mark_examId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Mark" DROP CONSTRAINT "Mark_studentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Mark" DROP CONSTRAINT "Mark_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Student" DROP CONSTRAINT "Student_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SubjectAssignment" DROP CONSTRAINT "SubjectAssignment_facultyId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SubjectAssignment" DROP CONSTRAINT "SubjectAssignment_subjectId_fkey";

-- DropIndex
DROP INDEX "public"."SubjectAssignment_facultyId_subjectId_key";

-- AlterTable
ALTER TABLE "public"."Attendance" ADD COLUMN     "facultyId" TEXT;

-- AlterTable
ALTER TABLE "public"."Department" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Exam" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."Fee" DROP COLUMN "amount",
DROP COLUMN "paid",
DROP COLUMN "paidDate",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "paidAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "paymentDate" TIMESTAMP(3),
ADD COLUMN     "pendingAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "status" "public"."FeeStatus" NOT NULL,
ADD COLUMN     "totalFee" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "public"."Subject" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropEnum
DROP TYPE "public"."Gender";

-- CreateTable
CREATE TABLE "public"."Timetable" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "semester" INTEGER NOT NULL,
    "section" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "period" INTEGER NOT NULL,
    "subjectId" TEXT NOT NULL,
    "facultyId" TEXT NOT NULL,

    CONSTRAINT "Timetable_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Timetable_departmentId_semester_section_day_period_key" ON "public"."Timetable"("departmentId", "semester", "section", "day", "period");

-- CreateIndex
CREATE UNIQUE INDEX "ClassAdvisor_departmentId_year_section_key" ON "public"."ClassAdvisor"("departmentId", "year", "section");

-- CreateIndex
CREATE UNIQUE INDEX "Mark_studentId_subjectId_examId_key" ON "public"."Mark"("studentId", "subjectId", "examId");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectAssignment_facultyId_subjectId_academicYear_key" ON "public"."SubjectAssignment"("facultyId", "subjectId", "academicYear");

-- AddForeignKey
ALTER TABLE "public"."Faculty" ADD CONSTRAINT "Faculty_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubjectAssignment" ADD CONSTRAINT "SubjectAssignment_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "public"."Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubjectAssignment" ADD CONSTRAINT "SubjectAssignment_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClassAdvisor" ADD CONSTRAINT "ClassAdvisor_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "public"."Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ClassAdvisor" ADD CONSTRAINT "ClassAdvisor_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attendance" ADD CONSTRAINT "Attendance_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Attendance" ADD CONSTRAINT "Attendance_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "public"."Faculty"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mark" ADD CONSTRAINT "Mark_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mark" ADD CONSTRAINT "Mark_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Mark" ADD CONSTRAINT "Mark_examId_fkey" FOREIGN KEY ("examId") REFERENCES "public"."Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Fee" ADD CONSTRAINT "Fee_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Timetable" ADD CONSTRAINT "Timetable_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Timetable" ADD CONSTRAINT "Timetable_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Timetable" ADD CONSTRAINT "Timetable_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "public"."Faculty"("id") ON DELETE CASCADE ON UPDATE CASCADE;
