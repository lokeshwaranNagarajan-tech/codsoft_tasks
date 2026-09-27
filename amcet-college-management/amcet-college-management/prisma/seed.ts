import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AMCET ERP...');

  // Delete old data
  await prisma.attendance.deleteMany();
  await prisma.mark.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // Departments
  const cse = await prisma.department.create({
    data: {
      name: 'Computer Science and Engineering',
      code: 'CSE',
    },
  });

  const it = await prisma.department.create({
    data: {
      name: 'Information Technology',
      code: 'IT',
    },
  });

  await prisma.department.createMany({
    data: [
      { name: 'Electronics and Communication Engineering', code: 'ECE' },
      { name: 'Electrical and Electronics Engineering', code: 'EEE' },
      { name: 'Mechanical Engineering', code: 'MECH' },
      { name: 'Civil Engineering', code: 'CIVIL' },
      { name: 'Artificial Intelligence and Data Science', code: 'AI&DS' },
    ],
  });

  console.log('✅ Departments Added');

  // Primary Admin
  await prisma.user.create({
    data: {
      collegeId: 'ADMIN001',
      name: 'Primary Admin',
      dob: new Date('1990-01-01'),
      role: Role.PRIMARY_ADMIN,
    },
  });

  // Secondary Admin
  await prisma.user.create({
    data: {
      collegeId: 'ADMIN002',
      name: 'Secondary Admin',
      dob: new Date('1992-05-20'),
      role: Role.SECONDARY_ADMIN,
    },
  });

  console.log('✅ Admin Users Added');

  // Faculty User
  const facultyUser = await prisma.user.create({
    data: {
      collegeId: 'FAC001',
      name: 'Dr. K. Anand',
      dob: new Date('1988-08-15'),
      role: Role.FACULTY,
    },
  });

  const faculty = await prisma.faculty.create({
    data: {
      userId: facultyUser.id,
      designation: 'Professor',
      departmentId: cse.id,
      isHOD: true,
    },
  });

  console.log('✅ Faculty Added');

  // Student User
  const studentUser = await prisma.user.create({
    data: {
      collegeId: 'AMCET23CSE001',
      name: 'Lokesh',
      dob: new Date('2005-06-10'),
      role: Role.STUDENT,
    },
  });

  const student = await prisma.student.create({
    data: {
      userId: studentUser.id,
      registerNo: '513223104001',
      departmentId: cse.id,
      year: 2,
      semester: 4,
      section: 'A',
    },
  });

  console.log('✅ Student Added');

  // Subjects
  const os = await prisma.subject.create({
    data: {
      code: 'CS8451',
      name: 'Operating Systems',
      credits: 3,
      semester: 4,
      departmentId: cse.id,
    },
  });

  const dbms = await prisma.subject.create({
    data: {
      code: 'CS8492',
      name: 'Database Management Systems',
      credits: 3,
      semester: 4,
      departmentId: cse.id,
    },
  });

  console.log('✅ Subjects Added');

  // Exam
  const cia1 = await prisma.exam.create({
    data: {
      name: 'CIA1',
      semester: 4,
      academicYear: '2025-2026',
    },
  });

  console.log('✅ Exam Added');

  // Marks
  await prisma.mark.createMany({
    data: [
      {
        studentId: student.id,
        subjectId: os.id,
        examId: cia1.id,
        marks: 87,
      },
      {
        studentId: student.id,
        subjectId: dbms.id,
        examId: cia1.id,
        marks: 91,
      },
    ],
  });

  console.log('✅ Marks Added');

  // Attendance (Use string values)
  await prisma.attendance.createMany({
    data: [
      {
        studentId: student.id,
        facultyId: faculty.id,
        subjectId: os.id,
        date: new Date('2026-03-01'),
        status: 'PRESENT',
      },
      {
        studentId: student.id,
        facultyId: faculty.id,
        subjectId: dbms.id,
        date: new Date('2026-03-02'),
        status: 'ABSENT',
      },
      {
        studentId: student.id,
        facultyId: faculty.id,
        subjectId: os.id,
        date: new Date('2026-03-03'),
        status: 'LEAVE',
      },
    ],
  });

  console.log('✅ Attendance Added');

  console.log('🎉 AMCET ERP Seed Completed Successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });