import { prisma } from "../config/prisma.js";
import { startOfDay, endOfDay } from "../utils/calculations.js";

export const dashboardService = {
  async getOverview() {
    const today = new Date();
    const todayStart = startOfDay(today);
    const todayEnd = endOfDay(today);

    const [
      totalPatients,
      totalDoctors,
      totalDepartments,
      activeCounters,
      activeDoctors,
      inactiveDoctors,
      doctorsWithPatientsToday,
      recentRegistrations,
      departmentGroups,
      last14DaysRegs,
      counters,
      counterTodayCounts,
    ] = await Promise.all([
      prisma.opRegistration.count(),
      prisma.doctor.count({ where: { isActive: true } }),
      prisma.department.count({ where: { isActive: true } }),
      prisma.registrationCounter.count({ where: { isActive: true } }),
      prisma.doctor.count({ where: { isActive: true } }),
      prisma.doctor.count({ where: { isActive: false } }),
      prisma.opRegistration.findMany({
        where: { registrationDate: { gte: todayStart, lte: todayEnd } },
        select: { doctorId: true },
        distinct: ["doctorId"],
      }),
      prisma.opRegistration.findMany({
        take: 8,
        orderBy: { registrationDate: "desc" },
        select: {
          id: true,
          opNumber: true,
          firstName: true,
          middleName: true,
          lastName: true,
          registrationDate: true,
          doctor: { select: { name: true } },
        },
      }),
      prisma.opRegistration.groupBy({
        by: ["departmentId"],
        _count: { id: true },
      }),
      prisma.$queryRaw<{ day: Date; count: bigint }[]>`
        SELECT date_trunc('day', registration_date) AS day, COUNT(*)::bigint AS count
        FROM op_registrations
        WHERE registration_date >= NOW() - INTERVAL '14 days'
        GROUP BY 1
        ORDER BY 1 ASC
      `,
      prisma.registrationCounter.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      }),
      prisma.opRegistration.groupBy({
        by: ["registrationCounterId"],
        where: {
          registrationDate: { gte: todayStart, lte: todayEnd },
          registrationCounterId: { not: null },
        },
        _count: { id: true },
      }),
    ]);

    const departmentIds = departmentGroups.map((g) => g.departmentId);
    const departments = await prisma.department.findMany({
      where: { id: { in: departmentIds } },
      select: { id: true, name: true },
    });
    const deptNameMap = Object.fromEntries(departments.map((d) => [d.id, d.name]));

    const departmentDistribution = departmentGroups
      .map((g) => ({
        name: deptNameMap[g.departmentId] ?? "Unknown",
        count: g._count.id,
      }))
      .sort((a, b) => b.count - a.count);

    const registrationTrend = last14DaysRegs.map((row) => ({
      date: row.day.toISOString().slice(0, 10),
      count: Number(row.count),
    }));

    const counterActivityMap = Object.fromEntries(
      counterTodayCounts
        .filter((c) => c.registrationCounterId)
        .map((c) => [c.registrationCounterId!, c._count.id])
    );

    const counterActivity = counters.map((c) => {
      const todayCount = counterActivityMap[c.id] ?? 0;
      let status: "Active" | "Idle" = "Idle";
      if (todayCount > 0) status = "Active";
      return { id: c.id, name: c.name, status, todayCount };
    });

    const recentPatients = recentRegistrations.map((r) => ({
      id: r.id,
      opNumber: r.opNumber,
      patientName: [r.firstName, r.middleName, r.lastName].filter(Boolean).join(" "),
      doctorName: r.doctor.name,
      time: r.registrationDate,
    }));

    return {
      stats: {
        totalPatients,
        totalDoctors,
        totalDepartments,
        activeCounters,
      },
      doctorSummary: {
        available: activeDoctors,
        onLeave: inactiveDoctors,
        activeConsultation: doctorsWithPatientsToday.length,
      },
      registrationTrend,
      departmentDistribution,
      counterActivity,
      recentPatients,
    };
  },
};
