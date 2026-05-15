import type { Request, Response } from "express";
import { z } from "zod";
import { masterService } from "../services/master.service.js";

const statusSchema = z.object({ isActive: z.boolean() });

export const masterController = {
  async listDoctors(_req: Request, res: Response) {
    const items = await masterService.listDoctors();
    res.json({ items });
  },

  async listDepartments(_req: Request, res: Response) {
    const items = await masterService.listDepartments();
    res.json({ items });
  },

  async listCounters(_req: Request, res: Response) {
    const items = await masterService.listCounters();
    res.json({ items });
  },

  async updateDoctor(req: Request, res: Response) {
    const { isActive } = statusSchema.parse(req.body);
    const item = await masterService.updateDoctorStatus(req.params.id as string, isActive);
    res.json({ item });
  },

  async updateDepartment(req: Request, res: Response) {
    const { isActive } = statusSchema.parse(req.body);
    const item = await masterService.updateDepartmentStatus(req.params.id as string, isActive);
    res.json({ item });
  },

  async updateCounter(req: Request, res: Response) {
    const { isActive } = statusSchema.parse(req.body);
    const item = await masterService.updateCounterStatus(req.params.id as string, isActive);
    res.json({ item });
  },
};
