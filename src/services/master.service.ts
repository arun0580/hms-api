import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/http-error.js";

export const masterService = {
  async listDoctors() {
    return prisma.doctor.findMany({
      orderBy: { name: "asc" },
      include: { department: { select: { id: true, name: true } } },
    });
  },

  async listDepartments() {
    return prisma.department.findMany({ orderBy: { name: "asc" } });
  },

  async listCounters() {
    return prisma.registrationCounter.findMany({ orderBy: { name: "asc" } });
  },

  async updateDoctorStatus(id: string, isActive: boolean) {
    const doctor = await prisma.doctor.findUnique({ where: { id } });
    if (!doctor) throw HttpError.notFound("Doctor not found");
    return prisma.doctor.update({ where: { id }, data: { isActive } });
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
