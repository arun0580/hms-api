-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'ON_LEAVE', 'BUSY', 'INACTIVE');

-- AlterEnum
ALTER TYPE "ReferenceType" ADD VALUE 'CLINIC';

-- AlterTable
ALTER TABLE "departments" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "doctors" ADD COLUMN     "availability_status" "AvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
ADD COLUMN     "consultation_timing" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "mobile_number" TEXT,
ADD COLUMN     "profile_photo_url" TEXT,
ADD COLUMN     "qualification" TEXT,
ADD COLUMN     "specialization" TEXT,
ADD COLUMN     "weekly_schedule" JSONB;

-- AlterTable
ALTER TABLE "op_registrations" ADD COLUMN     "referred_doctor_id" TEXT,
ALTER COLUMN "reference_type" DROP NOT NULL;

-- AlterTable
ALTER TABLE "registration_counters" ADD COLUMN     "location" TEXT;

-- CreateTable
CREATE TABLE "doctor_departments" (
    "doctor_id" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "doctor_departments_pkey" PRIMARY KEY ("doctor_id","department_id")
);

-- CreateTable
CREATE TABLE "doctor_consultation_slots" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "max_patients" INTEGER,

    CONSTRAINT "doctor_consultation_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counter_staff" (
    "counter_id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,

    CONSTRAINT "counter_staff_pkey" PRIMARY KEY ("counter_id","staff_id")
);

-- CreateIndex
CREATE INDEX "doctor_consultation_slots_doctor_id_day_of_week_idx" ON "doctor_consultation_slots"("doctor_id", "day_of_week");

-- AddForeignKey
ALTER TABLE "doctor_departments" ADD CONSTRAINT "doctor_departments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_departments" ADD CONSTRAINT "doctor_departments_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_consultation_slots" ADD CONSTRAINT "doctor_consultation_slots_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counter_staff" ADD CONSTRAINT "counter_staff_counter_id_fkey" FOREIGN KEY ("counter_id") REFERENCES "registration_counters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counter_staff" ADD CONSTRAINT "counter_staff_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "op_registrations" ADD CONSTRAINT "op_registrations_referred_doctor_id_fkey" FOREIGN KEY ("referred_doctor_id") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
