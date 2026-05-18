import type { Request, Response } from "express";
import { schedulerService } from "../services/scheduler.service.js";
import {
  createAppointmentSchema,
  createScheduleBlockSchema,
  schedulerDoctorsQuerySchema,
  schedulerTimelineQuerySchema,
} from "../validators/scheduler.schema.js";

export const schedulerController = {
  async listDepartments(_req: Request, res: Response) {
    const items = await schedulerService.listDepartments();
    res.json({ items });
  },

  async listDoctors(req: Request, res: Response) {
    const query = schedulerDoctorsQuerySchema.parse(req.query);
    const items = await schedulerService.listDoctorsByDepartment(query.departmentId, query.date);
    res.json({ items });
  },

  async getTimeline(req: Request, res: Response) {
    const query = schedulerTimelineQuerySchema.parse(req.query);
    const data = await schedulerService.getTimeline(
      query.doctorId,
      query.date,
      query.consultationType
    );
    res.json(data);
  },

  async createAppointment(req: Request, res: Response) {
    const body = createAppointmentSchema.parse(req.body);
    const item = await schedulerService.createAppointment(body);
    res.status(201).json({ item });
  },

  async createBlock(req: Request, res: Response) {
    const body = createScheduleBlockSchema.parse(req.body);
    const item = await schedulerService.createScheduleBlock(body);
    res.status(201).json({ item });
  },

  async recentAppointments(req: Request, res: Response) {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const items = await schedulerService.listRecentAppointments(limit);
    res.json({ items });
  },

  async compactAvailability(req: Request, res: Response) {
    const departmentId = req.query.departmentId as string | undefined;
    const data = await schedulerService.getCompactAvailability(departmentId);
    res.json(data);
  },
};
