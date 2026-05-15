import { z } from "zod";
import {
  BLOOD_GROUPS,
  DISCOUNT_TYPES,
  GENDERS,
  MARITAL_STATUSES,
  PAYMENT_METHODS,
  PREGNANCY_STATUSES,
  REFERENCE_TYPES,
  REGISTRATION_STATUSES,
  VISIT_TYPES,
} from "../constants/op-lookups.js";

/** Treat empty strings as undefined (common from HTML forms / JSON clients). */
function emptyToUndefined<T extends z.ZodTypeAny>(schema: T) {
  return z.preprocess((val) => (val === "" || val === null ? undefined : val), schema);
}

const optionalString = z.preprocess(
  (val) => (val === "" || val === null ? undefined : val),
  z.string().trim().optional()
);

const optionalEmail = z.preprocess(
  (val) => (val === "" || val === null ? undefined : val),
  z.string().trim().email().optional()
);

const optionalNumber = z.preprocess(
  (val) => (val === "" || val === null || val === undefined ? undefined : val),
  z.coerce.number().min(0).optional()
);

const requiredDecimal = z.coerce.number().min(0);

function insuranceRefine(data: { insuranceAvailable: boolean; insuranceProviderId?: string }, ctx: z.RefinementCtx) {
  if (data.insuranceAvailable && !data.insuranceProviderId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Insurance provider is required when insurance is available",
      path: ["insuranceProviderId"],
    });
  }
}

const registrationBodySchema = z.object({
    registrationDate: z.coerce.date(),
    visitType: z.enum(VISIT_TYPES),
    departmentId: z.string().min(1, "Department is required"),
    doctorId: z.string().min(1, "Doctor is required"),
    appointmentId: optionalString,

    firstName: z.string().trim().min(1, "First name is required").max(100),
    middleName: optionalString,
    lastName: z.string().trim().min(1, "Last name is required").max(100),
    gender: z.enum(GENDERS),
    dateOfBirth: z.coerce.date(),
    age: z.preprocess(
      (val) => (val === "" || val === null || val === undefined ? undefined : val),
      z.coerce.number().int().min(0).max(150).optional()
    ),
    bloodGroup: emptyToUndefined(z.enum(BLOOD_GROUPS).optional()),
    maritalStatus: emptyToUndefined(z.enum(MARITAL_STATUSES).optional()),
    nationality: optionalString,
    aadhaarNumber: optionalString,
    patientPhotoUrl: optionalString,
    occupation: optionalString,
    religion: optionalString,
    preferredLanguage: optionalString,

    mobileNumber: z.string().trim().min(10, "Valid mobile number is required").max(15),
    alternateMobile: optionalString,
    email: optionalEmail,
    addressLine1: optionalString,
    addressLine2: optionalString,
    city: optionalString,
    state: optionalString,
    district: optionalString,
    country: optionalString,
    pinCode: optionalString,

    referenceType: z.enum(REFERENCE_TYPES),
    referredByName: optionalString,
    referrerOrganization: optionalString,
    referrerContact: optionalString,
    referrerId: optionalString,
    referralDate: emptyToUndefined(z.coerce.date().optional()),
    referralNotes: optionalString,
    marketingSource: optionalString,
    campEventName: optionalString,
    employeeReferenceId: optionalString,
    insuranceReferenceId: optionalString,
    corporateReferenceId: optionalString,

    emergencyContactName: optionalString,
    emergencyRelationship: optionalString,
    emergencyMobile: optionalString,
    emergencyAddress: optionalString,

    chiefComplaint: optionalString,
    allergies: optionalString,
    existingDiseases: z.array(z.string()).default([]),
    currentMedications: optionalString,
    pastSurgeries: optionalString,
    pregnancyStatus: emptyToUndefined(z.enum(PREGNANCY_STATUSES).optional()),
    heightCm: optionalNumber,
    weightKg: optionalNumber,
    bloodPressure: optionalString,
    pulse: optionalString,
    temperature: optionalString,

    insuranceAvailable: z.boolean().default(false),
    insuranceProviderId: optionalString,
    policyNumber: optionalString,
    tpaName: optionalString,
    insuranceValidTill: emptyToUndefined(z.coerce.date().optional()),
    insuranceCardUrl: optionalString,

    registrationFee: requiredDecimal,
    consultationFee: requiredDecimal,
    paymentMethod: emptyToUndefined(z.enum(PAYMENT_METHODS).optional()),
    discountType: z.enum(DISCOUNT_TYPES).default("NONE"),
    discountAmount: requiredDecimal.default(0),

    consentAccepted: z.boolean().default(true),
    smsConsent: z.boolean().default(false),
    emailConsent: z.boolean().default(false),
    privacyPolicyAccepted: z.boolean().default(true),
    signatureDataUrl: optionalString,

    registrationCounterId: optionalString,
    hospitalBranchId: optionalString,
    status: z.enum(REGISTRATION_STATUSES).default("ACTIVE"),
    remarks: optionalString,
});

export const createOpRegistrationSchema = registrationBodySchema.superRefine(insuranceRefine);

export const updateOpRegistrationSchema = registrationBodySchema.superRefine(insuranceRefine);

export type CreateOpRegistrationInput = z.infer<typeof createOpRegistrationSchema>;
export type UpdateOpRegistrationInput = z.infer<typeof updateOpRegistrationSchema>;

export const listOpRegistrationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  departmentId: z.string().optional(),
  status: z.enum(REGISTRATION_STATUSES).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export const previewNumbersSchema = z.object({
  departmentId: z.string().min(1),
  registrationDate: z.coerce.date().optional(),
});

export function formatZodError(error: z.ZodError): string {
  const flat = error.flatten();
  for (const [, messages] of Object.entries(flat.fieldErrors)) {
    if (messages?.[0]) return messages[0];
  }
  return flat.formErrors[0] ?? "Invalid request payload";
}
