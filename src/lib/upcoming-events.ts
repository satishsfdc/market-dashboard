// Upcoming economic event dates and times.
// These come from official published schedules (Federal Reserve, BLS, etc.)
// and rarely change once announced — update this file monthly as new
// release calendars are published.
//
// Sources to check when updating:
//  - FOMC meeting dates: https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm
//  - CPI/PPI/jobs report dates: https://www.bls.gov/schedule/news_release/2026_sched.htm
//  - GDP/Retail Sales/etc: https://www.bea.gov/news/schedule
//
// "fredSeries" links each event to a FRED series ID so we can show the
// latest real released value alongside the upcoming date. Leave blank
// if there's no direct FRED series for the event.

import { ImpactLevel } from "@/types";

export interface UpcomingEvent {
  id: string;
  date: string; // ISO date, YYYY-MM-DD
  time: string; // e.g. "08:30 ET"
  name: string;
  impact: ImpactLevel;
  fredSeries?: string; // FRED series ID for latest value/previous value
}

export const upcomingEvents: UpcomingEvent[] = [
  { id: "u1", date: "2026-06-17", time: "08:30 ET", name: "Retail Sales (MoM)", impact: "High", fredSeries: "RSAFS" },
  { id: "u2", date: "2026-06-18", time: "14:00 ET", name: "FOMC Rate Decision", impact: "High", fredSeries: "FEDFUNDS" },
  { id: "u3", date: "2026-06-18", time: "14:30 ET", name: "Fed Chair Press Conference", impact: "High" },
  { id: "u4", date: "2026-06-19", time: "08:30 ET", name: "Initial Jobless Claims", impact: "Medium" },
  { id: "u5", date: "2026-06-20", time: "09:45 ET", name: "ISM Manufacturing PMI", impact: "Medium" },
  { id: "u6", date: "2026-07-02", time: "08:30 ET", name: "Non-Farm Payrolls", impact: "High" },
  { id: "u7", date: "2026-07-02", time: "08:30 ET", name: "Unemployment Rate", impact: "High", fredSeries: "UNRATE" },
  { id: "u8", date: "2026-07-11", time: "08:30 ET", name: "Core CPI (MoM)", impact: "High", fredSeries: "CPILFESL" },
  { id: "u9", date: "2026-07-15", time: "08:30 ET", name: "PPI (MoM)", impact: "Medium", fredSeries: "PPIACO" },
  { id: "u10", date: "2026-07-29", time: "14:00 ET", name: "FOMC Rate Decision", impact: "High", fredSeries: "FEDFUNDS" },
];

// Returns events within the current week (Mon-Sun) and next week, based on `now`.
export function splitEventsByWeek(now: Date) {
  const startOfThisWeek = new Date(now);
  const day = startOfThisWeek.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;
  startOfThisWeek.setDate(startOfThisWeek.getDate() + diffToMonday);
  startOfThisWeek.setHours(0, 0, 0, 0);

  const startOfNextWeek = new Date(startOfThisWeek);
  startOfNextWeek.setDate(startOfNextWeek.getDate() + 7);

  const startOfWeekAfter = new Date(startOfNextWeek);
  startOfWeekAfter.setDate(startOfWeekAfter.getDate() + 7);

  const thisWeek = upcomingEvents.filter((e) => {
    const d = new Date(e.date + "T00:00:00");
    return d >= startOfThisWeek && d < startOfNextWeek;
  });

  const nextWeek = upcomingEvents.filter((e) => {
    const d = new Date(e.date + "T00:00:00");
    return d >= startOfNextWeek && d < startOfWeekAfter;
  });

  return { thisWeek, nextWeek };
}
