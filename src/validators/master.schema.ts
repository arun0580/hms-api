import { z } from "zod";
import { AVAILABILITY_STATUSES } from "../constants/op-lookups.js";

const optionalString = z.preprocess(
  (val) => (val === "" || val === null ? undefined : val),
  z.string().trim().optional()
);

const weeklyScheduleSchema = z
  .record(z.string(), z.string())
  .optional();

const consultationSlotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().trim().min(1),
  endTime: z.string().trim().min(1),
  maxPatients: z.number().int().min(1).optional(),
});

export const createDepartmentSchema = z.object({
  name: z.string().trim().min(1).max(120),
  code: optionalString,
  description: optionalString,
  isActive: z.boolean().default(true),
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

export const createDoctorSchema = z.object({
  name: z.string().trim().min(1).max(120),
  code: optionalString,
  departmentId: z.string().min(1),
  departmentIds: z.array(z.string().min(1)).optional(),
  specialization: optionalString,
  qualification: optionalString,
  consultationFee: z.coerce.number().min(0).optional(),
  mobileNumber: optionalString,
  email: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.string().trim().email().optional()
  ),
  availabilityStatus: z.enum(AVAILABILITY_STATUSES).default("AVAILABLE"),
  consultationTiming: optionalString,
  weeklySchedule: weeklyScheduleSchema,
  profilePhotoUrl: optionalString,
  isActive: z.boolean().default(true),
  consultationSlots: z.array(consultationSlotSchema).default([]),
});

export const updateDoctorSchema = createDoctorSchema.partial();

export const createCounterSchema = z.object({
  name: z.string().trim().min(1).max(120),
  code: optionalString,
  location: optionalString,
  isActive: z.boolean().default(true),
  staffIds: z.array(z.string().min(1)).default([]),
});

export const updateCounterSchema = createCounterSchema.partial();

export const statusSchema = z.object({ isActive: z.boolean() });
