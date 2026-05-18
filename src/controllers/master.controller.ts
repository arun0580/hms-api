import type { Request, Response } from "express";
import { masterService } from "../services/master.service.js";
import {
  createCounterSchema,
  createDepartmentSchema,
  createDoctorSchema,
  statusSchema,
  updateCounterSchema,
  updateDepartmentSchema,
  updateDoctorSchema,
} from "../validators/master.schema.js";

export const masterController = {
  async listDoctors(_req: Request, res: Response) {
    const items = await masterService.listDoctors();
    res.json({ items });
  },

  async getDoctor(req: Request, res: Response) {
    const item = await masterService.getDoctor(req.params.id as string);
    res.json({ item });
  },

  async listDepartments(_req: Request, res: Response) {
    const items = await masterService.listDepartments();
    res.json({ items });
  },

  async listCounters(_req: Request, res: Response) {
    const items = await masterService.listCounters();
    res.json({ items });
  },

  async listStaff(_req: Request, res: Response) {
    const items = await masterService.listStaff();
    res.json({ items });
  },

  async createDepartment(req: Request, res: Response) {
    const body = createDepartmentSchema.parse(req.body);
    const item = await masterService.createDepartment(body);
    res.status(201).json({ item });
  },

  async updateDepartment(req: Request, res: Response) {
    const body = updateDepartmentSchema.parse(req.body);
    const item = await masterService.updateDepartment(req.params.id as string, body);
    res.json({ item });
  },

  async deleteDepartment(req: Request, res: Response) {
    const result = await masterService.deleteDepartment(req.params.id as string);
    res.json(result);
  },

  async createDoctor(req: Request, res: Response) {
    const body = createDoctorSchema.parse(req.body);
    const item = await masterService.createDoctor(body);
    res.status(201).json({ item });
  },

  async updateDoctor(req: Request, res: Response) {
    const body = updateDoctorSchema.parse(req.body);
    const item = await masterService.updateDoctor(req.params.id as string, body);
    res.json({ item });
  },

  async deleteDoctor(req: Request, res: Response) {
    const result = await masterService.deleteDoctor(req.params.id as string);
    res.json(result);
  },

  async createCounter(req: Request, res: Response) {
    const body = createCounterSchema.parse(req.body);
    const item = await masterService.createCounter(body);
    res.status(201).json({ item });
  },

  async updateCounter(req: Request, res: Response) {
    const body = updateCounterSchema.parse(req.body);
    const item = await masterService.updateCounter(req.params.id as string, body);
    res.json({ item });
  },

  async deleteCounter(req: Request, res: Response) {
    const result = await masterService.deleteCounter(req.params.id as string);
    res.json(result);
  },

  async updateDoctorStatus(req: Request, res: Response) {
    const { isActive } = statusSchema.parse(req.body);
    const item = await masterService.updateDoctorStatus(req.params.id as string, isActive);
    res.json({ item });
  },

  async updateDepartmentStatus(req: Request, res: Response) {
    const { isActive } = statusSchema.parse(req.body);
    const item = await masterService.updateDepartmentStatus(req.params.id as string, isActive);
    res.json({ item });
  },

  async updateCounterStatus(req: Request, res: Response) {
    const { isActive } = statusSchema.parse(req.body);
    const item = await masterService.updateCounterStatus(req.params.id as string, isActive);
    res.json({ item });
  },
};
