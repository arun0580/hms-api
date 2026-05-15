import type { Request, Response } from "express";
import { opRegistrationService } from "../services/op-registration.service.js";
import {
  BLOOD_GROUP_LABELS,
  BLOOD_GROUPS,
  COUNTRIES,
  DISCOUNT_TYPES,
  EXISTING_DISEASES,
  GENDERS,
  INDIAN_STATES,
  MARITAL_STATUSES,
  MARKETING_SOURCES,
  PAYMENT_METHODS,
  PREGNANCY_STATUSES,
  REFERENCE_TYPES,
  REGISTRATION_STATUSES,
  RELATIONSHIPS,
  VISIT_TYPE_LABELS,
  VISIT_TYPES,
} from "../constants/op-lookups.js";
import {
  createOpRegistrationSchema,
  listOpRegistrationSchema,
  previewNumbersSchema,
  updateOpRegistrationSchema,
} from "../validators/op-registration.schema.js";

export const opRegistrationController = {
  async getLookups(_req: Request, res: Response) {
    const masters = await opRegistrationService.getLookups();
    res.json({
      ...masters,
      enums: {
        visitTypes: VISIT_TYPES.map((v) => ({ value: v, label: VISIT_TYPE_LABELS[v] ?? v })),
        genders: GENDERS,
        bloodGroups: BLOOD_GROUPS.map((v) => ({ value: v, label: BLOOD_GROUP_LABELS[v] ?? v })),
        maritalStatuses: MARITAL_STATUSES,
        referenceTypes: REFERENCE_TYPES,
        paymentMethods: PAYMENT_METHODS,
        discountTypes: DISCOUNT_TYPES,
        pregnancyStatuses: PREGNANCY_STATUSES,
        registrationStatuses: REGISTRATION_STATUSES,
        states: INDIAN_STATES,
        countries: COUNTRIES,
        relationships: RELATIONSHIPS,
        marketingSources: MARKETING_SOURCES,
        existingDiseases: EXISTING_DISEASES,
      },
    });
  },

  async previewNumbers(req: Request, res: Response) {
    const query = previewNumbersSchema.parse(req.query);
    const result = await opRegistrationService.previewNumbers(
      query.departmentId,
      query.registrationDate
    );
    res.json(result);
  },

  async create(req: Request, res: Response) {
    const body = createOpRegistrationSchema.parse(req.body);
    const record = await opRegistrationService.create(body, req.user?.sub);
    res.status(201).json({ registration: record });
  },

  async getById(req: Request, res: Response) {
    const record = await opRegistrationService.getById(req.params.id as string);
    res.json({ registration: record });
  },

  async list(req: Request, res: Response) {
    const query = listOpRegistrationSchema.parse(req.query);
    const result = await opRegistrationService.list(query);
    res.json(result);
  },

  async update(req: Request, res: Response) {
    const body = updateOpRegistrationSchema.parse(req.body);
    const record = await opRegistrationService.update(req.params.id as string, body);
    res.json({ registration: record });
  },
};
