import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/http-error.js";
import type {
  createCounterSchema,
  createDepartmentSchema,
  createDoctorSchema,
  updateCounterSchema,
  updateDepartmentSchema,
  updateDoctorSchema,
} from "../validators/master.schema.js";
import { z } from "zod";

type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
type UpdateDoctorInput = z.infer<typeof updateDoctorSchema>;
type CreateCounterInput = z.infer<typeof createCounterSchema>;
type UpdateCounterInput = z.infer<typeof updateCounterSchema>;

const doctorInclude = {
  department: { select: { id: true, name: true, code: true } },
  departments: {
    include: { department: { select: { id: true, name: true, code: true } } },
  },
  consultationSlots: { orderBy: [{ dayOfWeek: "asc" as const }, { startTime: "asc" as const }] },
} satisfies Prisma.DoctorInclude;

const counterInclude = {
  staffAssignments: {
    include: { staff: { select: { id: true, name: true, employeeCode: true } } },
  },
} satisfies Prisma.RegistrationCounterInclude;

function uniqueDepartmentIds(primaryId: string, extraIds?: string[]) {
  const ids = [primaryId, ...(extraIds ?? [])];
  return [...new Set(ids)];
}

async function syncDoctorDepartments(doctorId: string, primaryId: string, extraIds?: string[]) {
  const departmentIds = uniqueDepartmentIds(primaryId, extraIds);
  await prisma.doctorDepartment.deleteMany({ where: { doctorId } });
  await prisma.doctorDepartment.createMany({
    data: departmentIds.map((departmentId) => ({
      doctorId,
      departmentId,
      isPrimary: departmentId === primaryId,
    })),
  });
}

async function syncConsultationSlots(
  doctorId: string,
  slots: CreateDoctorInput["consultationSlots"]
) {
  await prisma.doctorConsultationSlot.deleteMany({ where: { doctorId } });
  if (slots.length > 0) {
    await prisma.doctorConsultationSlot.createMany({
      data: slots.map((slot) => ({ doctorId, ...slot })),
    });
  }
}

async function syncCounterStaff(counterId: string, staffIds: string[]) {
  await prisma.counterStaff.deleteMany({ where: { counterId } });
  if (staffIds.length > 0) {
    await prisma.counterStaff.createMany({
      data: staffIds.map((staffId) => ({ counterId, staffId })),
    });
  }
}

function serializeDoctor(doctor: Prisma.DoctorGetPayload<{ include: typeof doctorInclude }>) {
  return {
    ...doctor,
    consultationFee: doctor.consultationFee?.toString() ?? null,
    departments: doctor.departments.map((link) => ({
      ...link.department,
      isPrimary: link.isPrimary,
    })),
    staffAssignments: undefined,
  };
}

function serializeCounter(
  counter: Prisma.RegistrationCounterGetPayload<{ include: typeof counterInclude }>
) {
  return {
    ...counter,
    assignedStaff: counter.staffAssignments.map((a) => a.staff),
    staffAssignments: undefined,
  };
}

export const masterService = {
  async listDoctors() {
    const items = await prisma.doctor.findMany({
      orderBy: { name: "asc" },
      include: doctorInclude,
    });
    return items.map(serializeDoctor);
  },

  async getDoctor(id: string) {
    const doctor = await prisma.doctor.findUnique({ where: { id }, include: doctorInclude });
    if (!doctor) throw HttpError.notFound("Doctor not found");
    return serializeDoctor(doctor);
  },

  async listDepartments() {
    return prisma.department.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { doctors: true } } },
    });
  },

  async listCounters() {
    const items = await prisma.registrationCounter.findMany({
      orderBy: { name: "asc" },
      include: counterInclude,
    });
    return items.map(serializeCounter);
  },

  async listStaff() {
    return prisma.staffMember.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, employeeCode: true },
    });
  },

  async createDepartment(input: CreateDepartmentInput) {
    return prisma.department.create({ data: input });
  },

  async updateDepartment(id: string, input: UpdateDepartmentInput) {
    const dept = await prisma.department.findUnique({ where: { id } });
    if (!dept) throw HttpError.notFound("Department not found");
    return prisma.department.update({ where: { id }, data: input });
  },

  async deleteDepartment(id: string) {
    const dept = await prisma.department.findUnique({
      where: { id },
      include: { _count: { select: { doctors: true, registrations: true } } },
    });
    if (!dept) throw HttpError.notFound("Department not found");
    if (dept._count.doctors > 0 || dept._count.registrations > 0) {
      return prisma.department.update({ where: { id }, data: { isActive: false } });
    }
    await prisma.department.delete({ where: { id } });
    return { deleted: true };
  },

  async createDoctor(input: CreateDoctorInput) {
    const doctor = await prisma.doctor.create({
      data: {
        name: input.name,
        code: input.code,
        departmentId: input.departmentId,
        specialization: input.specialization,
        qualification: input.qualification,
        mobileNumber: input.mobileNumber,
        email: input.email,
        consultationFee: input.consultationFee,
        availabilityStatus: input.availabilityStatus,
        consultationTiming: input.consultationTiming,
        weeklySchedule: input.weeklySchedule,
        profilePhotoUrl: input.profilePhotoUrl,
        isActive: input.isActive,
      },
      include: doctorInclude,
    });
    await syncDoctorDepartments(doctor.id, input.departmentId, input.departmentIds);
    await syncConsultationSlots(doctor.id, input.consultationSlots);
    return this.getDoctor(doctor.id);
  },

  async updateDoctor(id: string, input: UpdateDoctorInput) {
    const existing = await prisma.doctor.findUnique({ where: { id } });
    if (!existing) throw HttpError.notFound("Doctor not found");

    const doctor = await prisma.doctor.update({
      where: { id },
      data: {
        name: input.name,
        code: input.code,
        departmentId: input.departmentId,
        specialization: input.specialization,
        qualification: input.qualification,
        mobileNumber: input.mobileNumber,
        email: input.email,
        consultationFee: input.consultationFee,
        availabilityStatus: input.availabilityStatus,
        consultationTiming: input.consultationTiming,
        weeklySchedule: input.weeklySchedule,
        profilePhotoUrl: input.profilePhotoUrl,
        isActive: input.isActive,
      },
      include: doctorInclude,
    });

    if (input.departmentId || input.departmentIds) {
      await syncDoctorDepartments(
        id,
        input.departmentId ?? existing.departmentId,
        input.departmentIds
      );
    }
    if (input.consultationSlots) {
      await syncConsultationSlots(id, input.consultationSlots);
    }
    return this.getDoctor(doctor.id);
  },

  async deleteDoctor(id: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: { _count: { select: { registrations: true } } },
    });
    if (!doctor) throw HttpError.notFound("Doctor not found");
    if (doctor._count.registrations > 0) {
      return prisma.doctor.update({ where: { id }, data: { isActive: false } });
    }
    await prisma.doctor.delete({ where: { id } });
    return { deleted: true };
  },

  async updateDoctorStatus(id: string, isActive: boolean) {
    const doctor = await prisma.doctor.findUnique({ where: { id } });
    if (!doctor) throw HttpError.notFound("Doctor not found");
    return prisma.doctor.update({
      where: { id },
      data: { isActive, availabilityStatus: isActive ? doctor.availabilityStatus : "INACTIVE" },
      include: doctorInclude,
    });
  },

  async createCounter(input: CreateCounterInput) {
    const counter = await prisma.registrationCounter.create({
      data: {
        name: input.name,
        code: input.code,
        location: input.location,
        isActive: input.isActive,
      },
    });
    await syncCounterStaff(counter.id, input.staffIds);
    return this.getCounter(counter.id);
  },

  async getCounter(id: string) {
    const counter = await prisma.registrationCounter.findUnique({
      where: { id },
      include: counterInclude,
    });
    if (!counter) throw HttpError.notFound("Counter not found");
    return serializeCounter(counter);
  },

  async updateCounter(id: string, input: UpdateCounterInput) {
    const existing = await prisma.registrationCounter.findUnique({ where: { id } });
    if (!existing) throw HttpError.notFound("Counter not found");

    await prisma.registrationCounter.update({
      where: { id },
      data: {
        name: input.name,
        code: input.code,
        location: input.location,
        isActive: input.isActive,
      },
    });
    if (input.staffIds) {
      await syncCounterStaff(id, input.staffIds);
    }
    return this.getCounter(id);
  },

  async deleteCounter(id: string) {
    const counter = await prisma.registrationCounter.findUnique({
      where: { id },
      include: { _count: { select: { registrations: true } } },
    });
    if (!counter) throw HttpError.notFound("Counter not found");
    if (counter._count.registrations > 0) {
      return prisma.registrationCounter.update({ where: { id }, data: { isActive: false } });
    }
    await prisma.registrationCounter.delete({ where: { id } });
    return { deleted: true };
  },

  async updateDepartmentStatus(id: string, isActive: boolean) {
    const dept = await prisma.department.findUnique({ where: { id } });
    if (!dept) throw HttpError.notFound("Department not found");
    return prisma.department.update({ where: { id }, data: { isActive } });
  },

  async updateCounterStatus(id: string, isActive: boolean) {
    const counter = await prisma.registrationCounter.findUnique({ where: { id } });
    if (!counter) throw HttpError.notFound("Counter not found");
    return prisma.registrationCounter.update({ where: { id }, data: { isActive } });
  },
};
