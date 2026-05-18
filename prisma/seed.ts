import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@hms.com";
  const plainPassword = "123456";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name: "HMS Admin",
      email,
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });

  const departments = [
    { name: "General Medicine", code: "GM" },
    { name: "ENT", code: "ENT" },
    { name: "Cardiology", code: "CARD" },
    { name: "Orthopedics", code: "ORTHO" },
    { name: "Pediatrics", code: "PED" },
    { name: "Dermatology", code: "DERM" },
    { name: "Gynecology", code: "GYN" },
    { name: "Neurology", code: "NEURO" },
  ];

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept,
    });
  }

  const deptMap = Object.fromEntries(
    (await prisma.department.findMany()).map((d) => [d.code, d.id])
  );

  const doctors = [
    { name: "Dr. Rajesh Kumar", code: "DRK001", departmentCode: "GM", consultationFee: 500 },
    { name: "Dr. Priya Sharma", code: "DPS001", departmentCode: "ENT", consultationFee: 600 },
    { name: "Dr. Amit Patel", code: "DAP001", departmentCode: "CARD", consultationFee: 800 },
    { name: "Dr. Sneha Reddy", code: "DSR001", departmentCode: "ORTHO", consultationFee: 700 },
    { name: "Dr. Vikram Singh", code: "DVS001", departmentCode: "PED", consultationFee: 450 },
  ];

  for (const doc of doctors) {
    const departmentId = deptMap[doc.departmentCode];
    if (!departmentId) continue;
    const doctor = await prisma.doctor.upsert({
      where: { code: doc.code },
      update: {},
      create: {
        name: doc.name,
        code: doc.code,
        departmentId,
        consultationFee: doc.consultationFee,
      },
    });
    await prisma.doctorDepartment.upsert({
      where: {
        doctorId_departmentId: { doctorId: doctor.id, departmentId },
      },
      update: { isPrimary: true },
      create: { doctorId: doctor.id, departmentId, isPrimary: true },
    });
  }

  const branches = ["Main Hospital", "City Branch", "North Clinic"];
  for (const name of branches) {
    await prisma.hospitalBranch.upsert({
      where: { name },
      update: {},
      create: { name, code: name.replace(/\s+/g, "_").toUpperCase().slice(0, 8) },
    });
  }

  const counters = ["Counter 1", "Counter 2", "Counter 3"];
  for (const name of counters) {
    await prisma.registrationCounter.upsert({
      where: { name },
      update: {},
      create: { name, code: name.replace(/\s+/g, "_").toUpperCase() },
    });
  }

  const staff = [
    { name: "Ravi Menon", employeeCode: "EMP001" },
    { name: "Anita Desai", employeeCode: "EMP002" },
    { name: "Suresh Iyer", employeeCode: "EMP003" },
  ];
  for (const s of staff) {
    await prisma.staffMember.upsert({
      where: { employeeCode: s.employeeCode },
      update: {},
      create: s,
    });
  }

  const insurers = ["Star Health", "ICICI Lombard", "HDFC ERGO", "Max Bupa", "New India Assurance"];
  for (const name of insurers) {
    await prisma.insuranceProvider.upsert({
      where: { name },
      update: {},
      create: { name, code: name.replace(/\s+/g, "_").toUpperCase().slice(0, 10) },
    });
  }

  const corporates = ["TCS", "Infosys", "Wipro", "HCL Technologies"];
  for (const name of corporates) {
    await prisma.corporate.upsert({
      where: { name },
      update: {},
      create: { name, code: name.replace(/\s+/g, "_").toUpperCase().slice(0, 10) },
    });
  }

  for (const doc of await prisma.doctor.findMany()) {
    await prisma.doctorDepartment.upsert({
      where: {
        doctorId_departmentId: { doctorId: doc.id, departmentId: doc.departmentId },
      },
      update: { isPrimary: true },
      create: { doctorId: doc.id, departmentId: doc.departmentId, isPrimary: true },
    });

    const existingSlots = await prisma.doctorConsultationSlot.count({ where: { doctorId: doc.id } });
    if (existingSlots === 0) {
      for (let day = 1; day <= 5; day++) {
        await prisma.doctorConsultationSlot.create({
          data: {
            doctorId: doc.id,
            dayOfWeek: day,
            startTime: "09:00",
            endTime: "13:00",
          },
        });
        await prisma.doctorConsultationSlot.create({
          data: {
            doctorId: doc.id,
            dayOfWeek: day,
            startTime: "14:00",
            endTime: "17:00",
          },
        });
      }
    }

    await prisma.doctor.update({
      where: { id: doc.id },
      data: {
        slotDurationMinutes: 15,
        bufferMinutes: 5,
        consultationTiming: "9:00 AM - 5:00 PM",
        weeklySchedule: {
          Monday: "9:00 AM - 5:00 PM",
          Tuesday: "9:00 AM - 5:00 PM",
          Wednesday: "9:00 AM - 5:00 PM",
          Thursday: "9:00 AM - 5:00 PM",
          Friday: "9:00 AM - 5:00 PM",
        },
      },
    });
  }

  const firstDoctor = await prisma.doctor.findFirst({ include: { department: true } });
  if (firstDoctor) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const aptCount = await prisma.appointment.count({
      where: { doctorId: firstDoctor.id, appointmentDate: today },
    });
    if (aptCount === 0) {
      const prefix = `APT${today.toISOString().slice(0, 10).replace(/-/g, "")}`;
      await prisma.appointment.createMany({
        data: [
          {
            appointmentNumber: `${prefix}0001`,
            doctorId: firstDoctor.id,
            departmentId: firstDoctor.departmentId,
            patientName: "Ramesh Kumar",
            patientPhone: "9876543210",
            consultationType: "OP",
            appointmentDate: today,
            startTime: "09:00",
            endTime: "09:15",
            status: "COMPLETED",
          },
          {
            appointmentNumber: `${prefix}0002`,
            doctorId: firstDoctor.id,
            departmentId: firstDoctor.departmentId,
            patientName: "Lakshmi Devi",
            consultationType: "OP",
            appointmentDate: today,
            startTime: "09:30",
            endTime: "09:45",
            status: "WAITING",
          },
          {
            appointmentNumber: `${prefix}0003`,
            doctorId: firstDoctor.id,
            departmentId: firstDoctor.departmentId,
            patientName: "Arjun Nair",
            consultationType: "OP",
            appointmentDate: today,
            startTime: "10:00",
            endTime: "10:15",
            status: "SCHEDULED",
          },
        ],
      });
      await prisma.doctorScheduleBlock.create({
        data: {
          doctorId: firstDoctor.id,
          blockDate: today,
          startTime: "12:00",
          endTime: "13:00",
          blockType: "BREAK",
          title: "Lunch Break",
        },
      });
    }
  }

  console.log("Seed completed:");
  console.log({ user: { id: user.id, email: user.email } });
  console.log(`Login: ${email} / ${plainPassword}`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
