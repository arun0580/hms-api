export type TimelineSlotStatus = "AVAILABLE" | "BOOKED" | "BREAK" | "LEAVE" | "PAST";

export interface TimelineSlot {
  startTime: string;
  endTime: string;
  status: TimelineSlotStatus;
  label?: string;
  appointmentId?: string;
  patientName?: string;
  consultationType?: string;
}

export function parseTimeToMinutes(time: string): number {
  const normalized = time.trim().toUpperCase();
  const match12 = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (match12) {
    let hours = Number.parseInt(match12[1], 10);
    const minutes = Number.parseInt(match12[2], 10);
    const period = match12[3];
    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }
  const [h, m] = time.split(":").map((v) => Number.parseInt(v, 10));
  return h * 60 + (m || 0);
}

export function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function rangesOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean {
  return startA < endB && endA > startB;
}

export function generateTimeSlots(
  ranges: { startTime: string; endTime: string }[],
  durationMinutes: number,
  bufferMinutes: number
): { startTime: string; endTime: string; startMin: number; endMin: number }[] {
  const slots: { startTime: string; endTime: string; startMin: number; endMin: number }[] = [];

  for (const range of ranges) {
    let cursor = parseTimeToMinutes(range.startTime);
    const end = parseTimeToMinutes(range.endTime);
    while (cursor + durationMinutes <= end) {
      const slotEnd = cursor + durationMinutes;
      slots.push({
        startTime: formatMinutesToTime(cursor),
        endTime: formatMinutesToTime(slotEnd),
        startMin: cursor,
        endMin: slotEnd,
      });
      cursor = slotEnd + bufferMinutes;
    }
  }

  return slots;
}

export function parseWeeklyScheduleRange(value: string): { startTime: string; endTime: string } | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const dashParts = trimmed.split(/\s*[-–]\s*/);
  if (dashParts.length >= 2) {
    return { startTime: dashParts[0].trim(), endTime: dashParts[1].trim() };
  }
  return null;
}

export function startOfDayUtc(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

export function endOfDayUtc(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
}
