-- CreateEnum
CREATE TYPE "VisitType" AS ENUM ('NEW', 'FOLLOW_UP', 'EMERGENCY');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED');

-- CreateEnum
CREATE TYPE "ReferenceType" AS ENUM ('DOCTOR', 'HOSPITAL', 'FRIEND', 'EMPLOYEE', 'ONLINE', 'CAMP', 'INSURANCE', 'SELF');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'UPI', 'CHEQUE', 'NET_BANKING');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('NONE', 'INSURANCE', 'STAFF', 'CAMP', 'SENIOR', 'OTHER');

-- CreateEnum
CREATE TYPE "PregnancyStatus" AS ENUM ('NOT_APPLICABLE', 'NOT_PREGNANT', 'PREGNANT', 'LACTATING');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('ACTIVE', 'CLOSED', 'CANCELLED');

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "department_id" TEXT NOT NULL,
    "consultation_fee" DECIMAL(10,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_branches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "hospital_branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registration_counters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "registration_counters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_members" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "employee_code" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "staff_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insurance_providers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "insurance_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corporates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "corporates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "op_registrations" (
    "id" TEXT NOT NULL,
    "op_number" TEXT NOT NULL,
    "registration_date" TIMESTAMP(3) NOT NULL,
    "visit_type" "VisitType" NOT NULL,
    "department_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "token_number" INTEGER NOT NULL,
    "appointment_id" TEXT,
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "last_name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "age" INTEGER,
    "blood_group" "BloodGroup",
    "marital_status" "MaritalStatus",
    "nationality" TEXT,
    "aadhaar_number" TEXT,
    "patient_photo_url" TEXT,
    "occupation" TEXT,
    "religion" TEXT,
    "preferred_language" TEXT,
    "mobile_number" TEXT NOT NULL,
    "alternate_mobile" TEXT,
    "email" TEXT,
    "address_line_1" TEXT,
    "address_line_2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "district" TEXT,
    "country" TEXT DEFAULT 'India',
    "pin_code" TEXT,
    "reference_type" "ReferenceType" NOT NULL,
    "referred_by_name" TEXT,
    "referrer_organization" TEXT,
    "referrer_contact" TEXT,
    "referrer_id" TEXT,
    "referral_date" TIMESTAMP(3),
    "referral_notes" TEXT,
    "marketing_source" TEXT,
    "camp_event_name" TEXT,
    "employee_reference_id" TEXT,
    "insurance_reference_id" TEXT,
    "corporate_reference_id" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_relationship" TEXT,
    "emergency_mobile" TEXT,
    "emergency_address" TEXT,
    "chief_complaint" TEXT,
    "allergies" TEXT,
    "existing_diseases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "current_medications" TEXT,
    "past_surgeries" TEXT,
    "pregnancy_status" "PregnancyStatus",
    "height_cm" DECIMAL(5,2),
    "weight_kg" DECIMAL(5,2),
    "bmi" DECIMAL(5,2),
    "blood_pressure" TEXT,
    "pulse" TEXT,
    "temperature" TEXT,
    "insurance_available" BOOLEAN NOT NULL DEFAULT false,
    "insurance_provider_id" TEXT,
    "policy_number" TEXT,
    "tpa_name" TEXT,
    "insurance_valid_till" TIMESTAMP(3),
    "insurance_card_url" TEXT,
    "registration_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "consultation_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "payment_method" "PaymentMethod",
    "discount_type" "DiscountType" NOT NULL DEFAULT 'NONE',
    "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "receipt_number" TEXT NOT NULL,
    "consent_accepted" BOOLEAN NOT NULL DEFAULT false,
    "sms_consent" BOOLEAN NOT NULL DEFAULT false,
    "email_consent" BOOLEAN NOT NULL DEFAULT false,
    "privacy_policy_accepted" BOOLEAN NOT NULL DEFAULT false,
    "signature_data_url" TEXT,
    "created_by_id" TEXT,
    "registration_counter_id" TEXT,
    "hospital_branch_id" TEXT,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'ACTIVE',
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "op_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "doctors_code_key" ON "doctors"("code");

-- CreateIndex
CREATE UNIQUE INDEX "hospital_branches_name_key" ON "hospital_branches"("name");

-- CreateIndex
CREATE UNIQUE INDEX "hospital_branches_code_key" ON "hospital_branches"("code");

-- CreateIndex
CREATE UNIQUE INDEX "registration_counters_name_key" ON "registration_counters"("name");

-- CreateIndex
CREATE UNIQUE INDEX "registration_counters_code_key" ON "registration_counters"("code");

-- CreateIndex
CREATE UNIQUE INDEX "staff_members_employee_code_key" ON "staff_members"("employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "insurance_providers_name_key" ON "insurance_providers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "insurance_providers_code_key" ON "insurance_providers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "corporates_name_key" ON "corporates"("name");

-- CreateIndex
CREATE UNIQUE INDEX "corporates_code_key" ON "corporates"("code");

-- CreateIndex
CREATE UNIQUE INDEX "op_registrations_op_number_key" ON "op_registrations"("op_number");

-- CreateIndex
CREATE UNIQUE INDEX "op_registrations_receipt_number_key" ON "op_registrations"("receipt_number");

-- CreateIndex
CREATE INDEX "op_registrations_registration_date_idx" ON "op_registrations"("registration_date");

-- CreateIndex
CREATE INDEX "op_registrations_department_id_registration_date_idx" ON "op_registrations"("department_id", "registration_date");

-- AddForeignKey
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "op_registrations" ADD CONSTRAINT "op_registrations_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "op_registrations" ADD CONSTRAINT "op_registrations_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "op_registrations" ADD CONSTRAINT "op_registrations_employee_reference_id_fkey" FOREIGN KEY ("employee_reference_id") REFERENCES "staff_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "op_registrations" ADD CONSTRAINT "op_registrations_insurance_reference_id_fkey" FOREIGN KEY ("insurance_reference_id") REFERENCES "insurance_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "op_registrations" ADD CONSTRAINT "op_registrations_corporate_reference_id_fkey" FOREIGN KEY ("corporate_reference_id") REFERENCES "corporates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "op_registrations" ADD CONSTRAINT "op_registrations_insurance_provider_id_fkey" FOREIGN KEY ("insurance_provider_id") REFERENCES "insurance_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "op_registrations" ADD CONSTRAINT "op_registrations_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "op_registrations" ADD CONSTRAINT "op_registrations_registration_counter_id_fkey" FOREIGN KEY ("registration_counter_id") REFERENCES "registration_counters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "op_registrations" ADD CONSTRAINT "op_registrations_hospital_branch_id_fkey" FOREIGN KEY ("hospital_branch_id") REFERENCES "hospital_branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;
