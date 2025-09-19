export interface Event {
  id: string;
  description: string;
  expires_at: string;
  name: string;
  severity: SeverityLevel;
  start_at: string;
}

export const severityLevels = ["L", "M", "H", "C"] as const;
export type SeverityLevel = (typeof severityLevels)[number];
