import { z } from "zod";

export const schedulerDoctorsQuerySchema = z.object({
  departmentId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const schedulerTimelineQuerySchema = z.object({
  doctorId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  consultationType: z.enum(["OP", "IP", "TELECONSULTATION"]).optional(),
});

export const createAppointmentSchema = z.object({
  doctorId: z.string().min(1),
  departmentId: z.string().min(1),
  patientName: z.string().trim().min(1).max(120),
  patientPhone: z.string().trim().max(15).optional(),
  consultationType: z.enum(["OP", "IP", "TELECONSULTATION"]).default("OP"),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  notes: z.string().trim().optional(),
});

export const createScheduleBlockSchema = z.object({
  doctorId: z.string().min(1),
  blockDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  blockType: z.enum(["BREAK", "LEAVE", "HOLIDAY", "EMERGENCY"]),
  title: z.string().trim().optional(),
  isFullDay: z.boolean().default(false),
});
