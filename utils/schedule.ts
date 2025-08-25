import { Schedule } from "@/interfaces/schedule.interface";

export function isWithinAnyWindow(
  schedules: Schedule[] | undefined | null,
  now = new Date()
) {
  if (!schedules || schedules.length === 0) return false;
  const pad = (n: number) => String(n).padStart(2, "0");
  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const cur = `${hh}:${mm}`;

  return schedules.some((s) => {
    const start = s.t_start ?? "08:00";
    const end = s.t_end ?? "20:00";
    return start <= cur && cur <= end;
  });
}
