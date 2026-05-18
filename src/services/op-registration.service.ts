import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/http-error.js";
import {
  calculateAge,
  calculateBmi,
  calculateNetAmount,
  endOfDay,
  formatDateKey,
  startOfDay,
} from "../utils/calculations.js";
import type {
  CreateOpRegistrationInput,
  UpdateOpRegistrationInput,
} from "../validators/op-registration.schema.js";

const registrationInclude = {
  department: { select: { id: true, name: true, code: true } },
  doctor: { select: { id: true, name: true, code: true, consultationFee: true } },
  referredDoctor: { select: { id: true, name: true } },
  employeeReference: { select: { id: true, name: true, employeeCode: true } },
  insuranceReference: { select: { id: true, name: true } },
  corporateReference: { select: { id: true, name: true } },
  insuranceProvider: { select: { id: true, name: true } },
  registrationCounter: { select: { id: true, name: true } },
  hospitalBranch: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true, email: true } },
} satisfies Prisma.OpRegistrationInclude;

async function generateOpNumber(registrationDate: Date): Promise<string> {
  const prefix = `OP${formatDateKey(registrationDate)}`;
  const last = await prisma.opRegistration.findFirst({
    where: { opNumber: { startsWith: prefix } },
    orderBy: { opNumber: "desc" },
    select: { opNumber: true },
  });

  const seq = last ? Number.parseInt(last.opNumber.slice(-4), 10) + 1 : 1;
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

async function generateTokenNumber(departmentId: string, registrationDate: Date): Promise<number> {
  const count = await prisma.opRegistration.count({
    where: {
      departmentId,
      registrationDate: {
        gte: startOfDay(registrationDate),
        lte: endOfDay(registrationDate),
      },
    },
  });
  return count + 1;
}

async function generateReceiptNumber(registrationDate: Date): Promise<string> {
  const prefix = `RCP${formatDateKey(registrationDate)}`;
  const last = await prisma.opRegistration.findFirst({
    where: { receiptNumber: { startsWith: prefix } },
    orderBy: { receiptNumber: "desc" },
    select: { receiptNumber: true },
  });

  const seq = last ? Number.parseInt(last.receiptNumber.slice(-4), 10) + 1 : 1;
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

export const opRegistrationService = {
  async previewNumbers(departmentId: string, registrationDate = new Date()) {
    const department = await prisma.department.findFirst({
      where: { id: departmentId, isActive: true },
    });
    if (!department) {
      throw HttpError.badRequest("Invalid department");
    }

    const [opNumber, tokenNumber, receiptNumber] = await Promise.all([
      generateOpNumber(registrationDate),
      generateTokenNumber(departmentId, registrationDate),
      generateReceiptNumber(registrationDate),
    ]);

    return { opNumber, tokenNumber, receiptNumber, registrationDate };
  },

  async create(input: CreateOpRegistrationInput, createdById?: string) {
    const [department, doctor] = await Promise.all([
      prisma.department.findFirst({ where: { id: input.departmentId, isActive: true } }),
      prisma.doctor.findFirst({
        where: { id: input.doctorId, departmentId: input.departmentId, isActive: true },
      }),
    ]);

    if (!department) throw HttpError.badRequest("Invalid department");
    if (!doctor) throw HttpError.badRequest("Invalid doctor for selected department");

    const registrationDate = input.registrationDate;
    const age = input.age ?? calculateAge(input.dateOfBirth, registrationDate);

    let bmi: number | null = null;
    if (input.heightCm != null && input.weightKg != null) {
      bmi = calculateBmi(input.heightCm, input.weightKg);
    }

    const netAmount = calculateNetAmount(
      input.registrationFee,
      input.consultationFee,
      input.discountAmount
    );

    const [opNumber, tokenNumber, receiptNumber] = await Promise.all([
      generateOpNumber(registrationDate),
      generateTokenNumber(input.departmentId, registrationDate),
      generateReceiptNumber(registrationDate),
    ]);

    const record = await prisma.opRegistration.create({
      data: {
        opNumber,
        registrationDate,
        visitType: input.visitType,
        departmentId: input.departmentId,
        doctorId: input.doctorId,
        tokenNumber,
        appointmentId: input.appointmentId,

        firstName: input.firstName,
        middleName: input.middleName,
        lastName: input.lastName,
        gender: input.gender,
        dateOfBirth: input.dateOfBirth,
        age,
        bloodGroup: input.bloodGroup,
        maritalStatus: input.maritalStatus,
        nationality: input.nationality,
        aadhaarNumber: input.aadhaarNumber,
        patientPhotoUrl: input.patientPhotoUrl,
        occupation: input.occupation,
        religion: input.religion,
        preferredLanguage: input.preferredLanguage,

        mobileNumber: input.mobileNumber,
        alternateMobile: input.alternateMobile,
        email: input.email,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2,
        city: input.city,
        state: input.state,
        district: input.district,
        country: input.country ?? "India",
        pinCode: input.pinCode,

        referenceType: input.referenceType ?? null,
        referredDoctorId: input.referredDoctorId,
        referredByName: input.referredByName,
        referrerOrganization: input.referrerOrganization,
        referrerContact: input.referrerContact,
        referrerId: input.referrerId,
        referralDate: input.referralDate,
        referralNotes: input.referralNotes,
        marketingSource: input.marketingSource,
        campEventName: input.campEventName,
        employeeReferenceId: input.employeeReferenceId,
        insuranceReferenceId: input.insuranceReferenceId,
        corporateReferenceId: input.corporateReferenceId,

        emergencyContactName: input.emergencyContactName,
        emergencyRelationship: input.emergencyRelationship,
        emergencyMobile: input.emergencyMobile,
        emergencyAddress: input.emergencyAddress,

        chiefComplaint: input.chiefComplaint,
        allergies: input.allergies,
        existingDiseases: input.existingDiseases,
        currentMedications: input.currentMedications,
        pastSurgeries: input.pastSurgeries,
        pregnancyStatus: input.pregnancyStatus,
        heightCm: input.heightCm,
        weightKg: input.weightKg,
        bmi,
        bloodPressure: input.bloodPressure,
        pulse: input.pulse,
        temperature: input.temperature,

        insuranceAvailable: input.insuranceAvailable,
        insuranceProviderId: input.insuranceAvailable ? input.insuranceProviderId : null,
        policyNumber: input.policyNumber,
        tpaName: input.tpaName,
        insuranceValidTill: input.insuranceValidTill,
        insuranceCardUrl: input.insuranceCardUrl,

        registrationFee: input.registrationFee,
        consultationFee: input.consultationFee,
        paymentMethod: input.paymentMethod,
        discountType: input.discountType,
        discountAmount: input.discountAmount,
        netAmount,
        receiptNumber,

        consentAccepted: input.consentAccepted,
        smsConsent: input.smsConsent,
        emailConsent: input.emailConsent,
        privacyPolicyAccepted: input.privacyPolicyAccepted,
        signatureDataUrl: input.signatureDataUrl,

        createdById,
        registrationCounterId: input.registrationCounterId,
        hospitalBranchId: input.hospitalBranchId,
        status: input.status,
        remarks: input.remarks,
      },
      include: registrationInclude,
    });

    return record;
  },

  async getById(id: string) {
    const record = await prisma.opRegistration.findUnique({
      where: { id },
      include: registrationInclude,
    });
    if (!record) throw HttpError.notFound("OP registration not found");
    return record;
  },

  async list(params: {
    page: number;
    limit: number;
    search?: string;
    departmentId?: string;
    status?: string;
    from?: Date;
    to?: Date;
  }) {
    const where: Prisma.OpRegistrationWhereInput = {};

    if (params.departmentId) where.departmentId = params.departmentId;
    if (params.status) where.status = params.status as Prisma.EnumRegistrationStatusFilter["equals"];
    if (params.from || params.to) {
      where.registrationDate = {};
      if (params.from) where.registrationDate.gte = params.from;
      if (params.to) where.registrationDate.lte = params.to;
    }
    if (params.search) {
      const q = params.search;
      where.OR = [
        { opNumber: { contains: q, mode: "insensitive" } },
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { mobileNumber: { contains: q } },
        { aadhaarNumber: { contains: q } },
      ];
    }

    const skip = (params.page - 1) * params.limit;

    const [items, total] = await Promise.all([
      prisma.opRegistration.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { registrationDate: "desc" },
        include: registrationInclude,
      }),
      prisma.opRegistration.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    };
  },

  async update(id: string, input: UpdateOpRegistrationInput) {
    const existing = await prisma.opRegistration.findUnique({ where: { id } });
    if (!existing) throw HttpError.notFound("OP registration not found");

    const [department, doctor] = await Promise.all([
      prisma.department.findFirst({ where: { id: input.departmentId, isActive: true } }),
      prisma.doctor.findFirst({
        where: { id: input.doctorId, departmentId: input.departmentId, isActive: true },
      }),
    ]);

    if (!department) throw HttpError.badRequest("Invalid department");
    if (!doctor) throw HttpError.badRequest("Invalid doctor for selected department");

    const registrationDate = input.registrationDate;
    const age = input.age ?? calculateAge(input.dateOfBirth, registrationDate);

    let bmi: number | null = null;
    if (input.heightCm != null && input.weightKg != null) {
      bmi = calculateBmi(input.heightCm, input.weightKg);
    }

    const netAmount = calculateNetAmount(
      input.registrationFee,
      input.consultationFee,
      input.discountAmount
    );

    const record = await prisma.opRegistration.update({
      where: { id },
      data: {
        registrationDate,
        visitType: input.visitType,
        departmentId: input.departmentId,
        doctorId: input.doctorId,
        appointmentId: input.appointmentId,

        firstName: input.firstName,
        middleName: input.middleName,
        lastName: input.lastName,
        gender: input.gender,
        dateOfBirth: input.dateOfBirth,
        age,
        bloodGroup: input.bloodGroup,
        maritalStatus: input.maritalStatus,
        nationality: input.nationality,
        aadhaarNumber: input.aadhaarNumber,
        patientPhotoUrl: input.patientPhotoUrl,
        occupation: input.occupation,
        religion: input.religion,
        preferredLanguage: input.preferredLanguage,

        mobileNumber: input.mobileNumber,
        alternateMobile: input.alternateMobile,
        email: input.email,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2,
        city: input.city,
        state: input.state,
        district: input.district,
        country: input.country ?? "India",
        pinCode: input.pinCode,

        referenceType: input.referenceType ?? null,
        referredDoctorId: input.referredDoctorId,
        referredByName: input.referredByName,
        referrerOrganization: input.referrerOrganization,
        referrerContact: input.referrerContact,
        referrerId: input.referrerId,
        referralDate: input.referralDate,
        referralNotes: input.referralNotes,
        marketingSource: input.marketingSource,
        campEventName: input.campEventName,
        employeeReferenceId: input.employeeReferenceId,
        insuranceReferenceId: input.insuranceReferenceId,
        corporateReferenceId: input.corporateReferenceId,

        emergencyContactName: input.emergencyContactName,
        emergencyRelationship: input.emergencyRelationship,
        emergencyMobile: input.emergencyMobile,
        emergencyAddress: input.emergencyAddress,

        chiefComplaint: input.chiefComplaint,
        allergies: input.allergies,
        existingDiseases: input.existingDiseases,
        currentMedications: input.currentMedications,
        pastSurgeries: input.pastSurgeries,
        pregnancyStatus: input.pregnancyStatus,
        heightCm: input.heightCm,
        weightKg: input.weightKg,
        bmi,
        bloodPressure: input.bloodPressure,
        pulse: input.pulse,
        temperature: input.temperature,

        insuranceAvailable: input.insuranceAvailable,
        insuranceProviderId: input.insuranceAvailable ? input.insuranceProviderId : null,
        policyNumber: input.policyNumber,
        tpaName: input.tpaName,
        insuranceValidTill: input.insuranceValidTill,
        insuranceCardUrl: input.insuranceCardUrl,

        registrationFee: input.registrationFee,
        consultationFee: input.consultationFee,
        paymentMethod: input.paymentMethod,
        discountType: input.discountType,
        discountAmount: input.discountAmount,
        netAmount,

        consentAccepted: input.consentAccepted,
        smsConsent: input.smsConsent,
        emailConsent: input.emailConsent,
        privacyPolicyAccepted: input.privacyPolicyAccepted,
        signatureDataUrl: input.signatureDataUrl,

        registrationCounterId: input.registrationCounterId,
        hospitalBranchId: input.hospitalBranchId,
        status: input.status,
        remarks: input.remarks,
      },
      include: registrationInclude,
    });

    return record;
  },

  async getLookups() {
    const [
      departments,
      doctors,
      branches,
      counters,
      staff,
      insuranceProviders,
      corporates,
    ] = await Promise.all([
      prisma.department.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
      prisma.doctor.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
        include: { department: { select: { id: true, name: true } } },
      }),
      prisma.hospitalBranch.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
      prisma.registrationCounter.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
      prisma.staffMember.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
      prisma.insuranceProvider.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
      prisma.corporate.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    ]);

    return { departments, doctors, branches, counters, staff, insuranceProviders, corporates };
  },
};
