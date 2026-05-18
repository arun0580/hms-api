import { AppointmentStatus, AvailabilityStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/http-error.js";
import {
  generateTimeSlots,
  parseTimeToMinutes,
  parseWeeklyScheduleRange,
  rangesOverlap,
  startOfDayUtc,
  type TimelineSlot,
  type TimelineSlotStatus,
} from "../utils/time-slots.js";
import type { createAppointmentSchema, createScheduleBlockSchema } from "../validators/scheduler.schema.js";
import { z } from "zod";

type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
type CreateBlockInput = z.infer<typeof createScheduleBlockSchema>;

const STATUS_LABELS: Record<AvailabilityStatus, string> = {
  AVAILABLE: "Available",
  ON_LEAVE: "On Leave",
  BUSY: "In Consultation",
  INACTIVE: "Inactive",
};

async function generateAppointmentNumber(date: Date): Promise<string> {
  const key = date.toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `APT${key}`;
  const last = await prisma.appointment.findFirst({
    where: { appointmentNumber: { startsWith: prefix } },
    orderBy: { appointmentNumber: "desc" },
    select: { appointmentNumber: true },
  });
  const seq = last ? Number.parseInt(last.appointmentNumber.slice(-4), 10) + 1 : 1;
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

function getDayRanges(
  doctor: {
    consultationSlots: { dayOfWeek: number; startTime: string; endTime: string }[];
    weeklySchedule: unknown;
    consultationTiming: string | null;
  },
  dayOfWeek: number
): { startTime: string; endTime: string }[] {
  const slotRanges = doctor.consultationSlots
    .filter((s) => s.dayOfWeek === dayOfWeek)
    .map((s) => ({ startTime: s.startTime, endTime: s.endTime }));

  if (slotRanges.length > 0) return slotRanges;

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weekly = doctor.weeklySchedule as Record<string, string> | null;
  if (weekly?.[dayNames[dayOfWeek]]) {
    const parsed = parseWeeklyScheduleRange(weekly[dayNames[dayOfWeek]]);
    if (parsed) return [parsed];
  }

  if (doctor.consultationTiming) {
    const parsed = parseWeeklyScheduleRange(doctor.consultationTiming);
    if (parsed) return [parsed];
  }

  return [{ startTime: "09:00", endTime: "17:00" }];
}

function mapDoctorListStatus(
  availability: AvailabilityStatus,
  hasFullDayLeave: boolean,
  inConsultationNow: boolean
): { status: string; statusKey: TimelineSlotStatus | "IN_CONSULTATION" } {
  if (hasFullDayLeave || availability === "ON_LEAVE") {
    return { status: "On Leave", statusKey: "LEAVE" };
  }
  if (inConsultationNow || availability === "BUSY") {
    return { status: "In Consultation", statusKey: "IN_CONSULTATION" };
  }
  if (availability === "INACTIVE") {
    return { status: "Inactive", statusKey: "LEAVE" };
  }
  return { status: "Available", statusKey: "AVAILABLE" };
}

export const schedulerService = {
  async listDepartments() {
    return prisma.department.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true },
    });
  },

  async listDoctorsByDepartment(departmentId: string, dateStr: string) {
    const date = startOfDayUtc(dateStr);
    const dayOfWeek = date.getUTCDay();

    const doctors = await prisma.doctor.findMany({
      where: {
        isActive: true,
        OR: [{ departmentId }, { departments: { some: { departmentId } } }],
      },
      orderBy: { name: "asc" },
      include: {
        department: { select: { id: true, name: true } },
        consultationSlots: true,
        scheduleBlocks: {
          where: { blockDate: date },
        },
        appointments: {
          where: {
            appointmentDate: date,
            status: { in: ["IN_CONSULTATION", "WAITING"] },
          },
        },
      },
    });

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const isToday = now.toISOString().slice(0, 10) === dateStr;

    return doctors.map((doc) => {
      const fullDayLeave = doc.scheduleBlocks.some(
        (b) => b.isFullDay || b.blockType === "LEAVE" || b.blockType === "HOLIDAY"
      );
      const inConsultation =
        doc.appointments.some((a) => a.status === "IN_CONSULTATION") ||
        (isToday &&
          doc.appointments.some((a) => {
            const start = parseTimeToMinutes(a.startTime);
            const end = parseTimeToMinutes(a.endTime);
            return nowMinutes >= start && nowMinutes < end;
          }));

      const { status, statusKey } = mapDoctorListStatus(
        doc.availabilityStatus,
        fullDayLeave,
        inConsultation
      );

      const ranges = getDayRanges(doc, dayOfWeek);
      const slotCount = generateTimeSlots(
        ranges,
        doc.slotDurationMinutes,
        doc.bufferMinutes
      ).length;

      return {
        id: doc.id,
        name: doc.name,
        code: doc.code,
        department: doc.department,
        specialization: doc.specialization,
        availabilityStatus: doc.availabilityStatus,
        status,
        statusKey,
        consultationTiming: doc.consultationTiming,
        slotCount,
      };
    });
  },

  async getTimeline(doctorId: string, dateStr: string, _consultationType?: string) {
    const date = startOfDayUtc(dateStr);
    const dayOfWeek = date.getUTCDay();

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        department: { select: { id: true, name: true } },
        consultationSlots: true,
        scheduleBlocks: { where: { blockDate: date } },
        appointments: {
          where: {
            appointmentDate: date,
            status: { notIn: ["CANCELLED", "NO_SHOW"] },
          },
        },
      },
    });

    if (!doctor) throw HttpError.notFound("Doctor not found");

    const ranges = getDayRanges(doctor, dayOfWeek);
    const rawSlots = generateTimeSlots(ranges, doctor.slotDurationMinutes, doctor.bufferMinutes);

    const maxPerDay = doctor.maxPatientsPerDay;
    const bookedCount = doctor.appointments.filter((a) =>
      ["SCHEDULED", "WAITING", "IN_CONSULTATION", "COMPLETED"].includes(a.status)
    ).length;

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const isToday = now.toISOString().slice(0, 10) === dateStr;

    const fullDayBlock = doctor.scheduleBlocks.find(
      (b) => b.isFullDay || b.blockType === "LEAVE" || b.blockType === "HOLIDAY"
    );

    const timeline: TimelineSlot[] = rawSlots.map((slot) => {
      let status: TimelineSlotStatus = "AVAILABLE";
      let label: string | undefined;
      let appointmentId: string | undefined;
      let patientName: string | undefined;
      let consultationType: string | undefined;

      if (isToday && slot.endMin <= nowMinutes) {
        status = "PAST";
        label = "Past";
      } else if (
        doctor.availabilityStatus === "ON_LEAVE" ||
        fullDayBlock ||
        doctor.availabilityStatus === "INACTIVE"
      ) {
        status = "LEAVE";
        label = fullDayBlock?.title ?? "On Leave";
      } else {
        const block = doctor.scheduleBlocks.find((b) => {
          if (b.isFullDay) return true;
          if (!b.startTime || !b.endTime) return false;
          return rangesOverlap(
            slot.startMin,
            slot.endMin,
            parseTimeToMinutes(b.startTime),
            parseTimeToMinutes(b.endTime)
          );
        });

        if (block) {
          status = block.blockType === "BREAK" ? "BREAK" : "LEAVE";
          label =
            block.title ??
            (block.blockType === "BREAK"
              ? "Break"
              : block.blockType === "EMERGENCY"
                ? "Blocked"
                : "Leave");
        }

        const appointment = doctor.appointments.find((a) => {
          const aStart = parseTimeToMinutes(a.startTime);
          const aEnd = parseTimeToMinutes(a.endTime);
          return rangesOverlap(slot.startMin, slot.endMin, aStart, aEnd);
        });

        if (appointment) {
          status = "BOOKED";
          label = appointment.patientName;
          appointmentId = appointment.id;
          patientName = appointment.patientName;
          consultationType = appointment.consultationType;
        } else if (
          status === "AVAILABLE" &&
          maxPerDay != null &&
          bookedCount >= maxPerDay
        ) {
          status = "LEAVE";
          label = "Daily limit reached";
        }
      }

      return {
        startTime: slot.startTime,
        endTime: slot.endTime,
        status,
        label,
        appointmentId,
        patientName,
        consultationType,
      };
    });

    return {
      doctor: {
        id: doctor.id,
        name: doctor.name,
        department: doctor.department,
        slotDurationMinutes: doctor.slotDurationMinutes,
        bufferMinutes: doctor.bufferMinutes,
        maxPatientsPerDay: doctor.maxPatientsPerDay,
        consultationTiming: doctor.consultationTiming,
        availabilityStatus: doctor.availabilityStatus,
        availabilityLabel: STATUS_LABELS[doctor.availabilityStatus],
      },
      date: dateStr,
      consultationHours: ranges,
      timeline,
      summary: {
        total: timeline.length,
        available: timeline.filter((t) => t.status === "AVAILABLE").length,
        booked: timeline.filter((t) => t.status === "BOOKED").length,
        break: timeline.filter((t) => t.status === "BREAK").length,
        leave: timeline.filter((t) => t.status === "LEAVE").length,
      },
    };
  },

  async createAppointment(input: CreateAppointmentInput) {
    const date = startOfDayUtc(input.appointmentDate);

    const doctor = await prisma.doctor.findFirst({
      where: {
        id: input.doctorId,
        isActive: true,
        OR: [{ departmentId: input.departmentId }, { departments: { some: { departmentId: input.departmentId } } }],
      },
    });
    if (!doctor) throw HttpError.badRequest("Doctor not available in this department");

    const timeline = await this.getTimeline(input.doctorId, input.appointmentDate);
    const slot = timeline.timeline.find(
      (t) => t.startTime === input.startTime && t.status === "AVAILABLE"
    );
    if (!slot) throw HttpError.badRequest("Selected slot is not available");

    const appointmentNumber = await generateAppointmentNumber(date);

    return prisma.appointment.create({
      data: {
        appointmentNumber,
        doctorId: input.doctorId,
        departmentId: input.departmentId,
        patientName: input.patientName,
        patientPhone: input.patientPhone,
        consultationType: input.consultationType,
        appointmentDate: date,
        startTime: input.startTime,
        endTime: input.endTime,
        status: AppointmentStatus.SCHEDULED,
        notes: input.notes,
      },
      include: {
        doctor: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });
  },

  async createScheduleBlock(input: CreateBlockInput) {
    const date = startOfDayUtc(input.blockDate);
    return prisma.doctorScheduleBlock.create({
      data: {
        doctorId: input.doctorId,
        blockDate: date,
        startTime: input.isFullDay ? null : input.startTime,
        endTime: input.isFullDay ? null : input.endTime,
        blockType: input.blockType,
        title: input.title,
        isFullDay: input.isFullDay,
      },
    });
  },

  async listRecentAppointments(limit = 10) {
    const today = new Date();
    const todayStart = startOfDayUtc(today.toISOString().slice(0, 10));

    return prisma.appointment.findMany({
      where: { appointmentDate: { gte: todayStart } },
      orderBy: [{ appointmentDate: "desc" }, { startTime: "asc" }],
      take: limit,
      include: {
        doctor: { select: { name: true } },
        department: { select: { name: true } },
      },
    });
  },

  async getAppointmentSummary(dateStr?: string) {
    const date = startOfDayUtc(dateStr ?? new Date().toISOString().slice(0, 10));

    const [todayAppointments, waiting, completed, scheduled] = await Promise.all([
      prisma.appointment.count({ where: { appointmentDate: date } }),
      prisma.appointment.count({
        where: { appointmentDate: date, status: { in: ["WAITING", "SCHEDULED"] } },
      }),
      prisma.appointment.count({
        where: { appointmentDate: date, status: "COMPLETED" },
      }),
      prisma.appointment.count({
        where: { appointmentDate: date, status: "SCHEDULED" },
      }),
    ]);

    return { todayAppointments, waitingPatients: waiting, completedConsultations: completed, scheduled };
  },

  async getCompactAvailability(departmentId?: string) {
    const dateStr = new Date().toISOString().slice(0, 10);
    const departments = await this.listDepartments();
    const deptId = departmentId ?? departments[0]?.id;
    if (!deptId) return { departments, doctors: [] };

    const doctors = await this.listDoctorsByDepartment(deptId, dateStr);
    return {
      departments,
      selectedDepartmentId: deptId,
      date: dateStr,
      doctors: doctors.slice(0, 6),
    };
  },
};
