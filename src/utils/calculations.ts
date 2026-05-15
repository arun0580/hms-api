export function calculateAge(dateOfBirth: Date, referenceDate = new Date()): number {
  let age = referenceDate.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = referenceDate.getMonth() - dateOfBirth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < dateOfBirth.getDate())) {
    age -= 1;
  }
  return Math.max(0, age);
}

export function calculateBmi(heightCm: number, weightKg: number): number | null {
  if (heightCm <= 0 || weightKg <= 0) return null;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 100) / 100;
}

export function calculateNetAmount(
  registrationFee: number,
  consultationFee: number,
  discountAmount: number
): number {
  const net = registrationFee + consultationFee - discountAmount;
  return Math.max(0, Math.round(net * 100) / 100);
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}
