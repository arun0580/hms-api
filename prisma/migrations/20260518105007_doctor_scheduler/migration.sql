-- CreateEnum
CREATE TYPE "ConsultationType" AS ENUM ('OP', 'IP', 'TELECONSULTATION');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'WAITING', 'IN_CONSULTATION', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "ScheduleBlockType" AS ENUM ('BREAK', 'LEAVE', 'HOLIDAY', 'EMERGENCY');

-- AlterTable
ALTER TABLE "doctors" ADD COLUMN     "buffer_minutes" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "max_patients_per_day" INTEGER,
ADD COLUMN     "slot_duration_minutes" INTEGER NOT NULL DEFAULT 15;

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "appointment_number" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "department_id" TEXT NOT NULL,
    "patient_name" TEXT NOT NULL,
    "patient_phone" TEXT,
    "op_registration_id" TEXT,
    "consultation_type" "ConsultationType" NOT NULL,
    "appointment_date" TIMESTAMP(3) NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctor_schedule_blocks" (
    "id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "block_date" TIMESTAMP(3) NOT NULL,
    "start_time" TEXT,
    "end_time" TEXT,
    "block_type" "ScheduleBlockType" NOT NULL,
    "title" TEXT,
    "is_full_day" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doctor_schedule_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "appointments_appointment_number_key" ON "appointments"("appointment_number");

-- CreateIndex
CREATE INDEX "appointments_doctor_id_appointment_date_idx" ON "appointments"("doctor_id", "appointment_date");

-- CreateIndex
CREATE INDEX "appointments_department_id_appointment_date_idx" ON "appointments"("department_id", "appointment_date");

-- CreateIndex
CREATE INDEX "doctor_schedule_blocks_doctor_id_block_date_idx" ON "doctor_schedule_blocks"("doctor_id", "block_date");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_schedule_blocks" ADD CONSTRAINT "doctor_schedule_blocks_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE CASCADE ON UPDATE CASCADE;
