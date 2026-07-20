import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);

  // Admin
  await prisma.user.upsert({
    where: { email: "admin@boltabschools.edu" },
    update: {},
    create: {
      name: "School Admin",
      email: "admin@boltabschools.edu",
      passwordHash,
      role: "ADMIN",
    },
  });

  // A class and subject to attach the teacher/student to
  const jss1 = await prisma.class.upsert({
    where: { name: "JSS1" },
    update: {},
    create: { name: "JSS1" },
  });

  const math = await prisma.subject.upsert({
    where: { name: "Mathematics" },
    update: {},
    create: { name: "Mathematics" },
  });

  // Teacher
  const teacherUser = await prisma.user.upsert({
    where: { email: "teacher@boltabschools.edu" },
    update: {},
    create: {
      name: "Mrs. Adaeze Okonkwo",
      email: "teacher@boltabschools.edu",
      passwordHash,
      role: "TEACHER",
      teacher: { create: {} },
    },
    include: { teacher: true },
  });

  if (teacherUser.teacher) {
    await prisma.teacherAssignment.upsert({
      where: {
        teacherId_classId_subjectId: {
          teacherId: teacherUser.teacher.id,
          classId: jss1.id,
          subjectId: math.id,
        },
      },
      update: {},
      create: {
        teacherId: teacherUser.teacher.id,
        classId: jss1.id,
        subjectId: math.id,
      },
    });
  }

  // Student
  await prisma.user.upsert({
    where: { email: "student@boltabschools.edu" },
    update: {},
    create: {
      name: "Chidi Nwosu",
      email: "student@boltabschools.edu",
      passwordHash,
      role: "STUDENT",
      student: {
        create: {
          admissionNo: "BBS/2026/001",
          classId: jss1.id,
        },
      },
    },
  });

  console.log("Seed complete. Test password for all accounts: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
