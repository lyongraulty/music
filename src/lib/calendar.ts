export type CalendarEvent = {
  id: string;
  title: string;
  location: string;
  start: string;
  end: string;
  dateLabel: string;
  timeLabel: string;
  isAllDay: boolean;
};

type IcsEvent = {
  uid: string;
  summary: string;
  location: string;
  dtstart: IcsDate | null;
  dtend: IcsDate | null;
  rrule: string;
  exdates: IcsDate[];
  recurrenceId: IcsDate | null;
};

type IcsDate = {
  date: Date;
  isAllDay: boolean;
  source: string;
};

const calendarUrl =
  "https://calendar.google.com/calendar/ical/7b3e09ff3bc9fed8546eeae0310c3ad8ac0e353165da42b1210f7a6abb80f200%40group.calendar.google.com/public/basic.ics";

const timeZone = "America/Chicago";
const dayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
  timeZone,
});
const yearFormatter = new Intl.DateTimeFormat("en-US", { year: "numeric", timeZone });
const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
  timeZone,
});

export async function fetchUpcomingShows(limit = 8): Promise<CalendarEvent[]> {
  const response = await fetch(calendarUrl, {
    next: { revalidate: 900 },
    headers: { Accept: "text/calendar,text/plain,*/*" },
  });

  if (!response.ok) {
    throw new Error(`Calendar request failed with ${response.status}`);
  }

  return getUpcomingShowsFromIcs(await response.text(), limit);
}

export function getUpcomingShowsFromIcs(ics: string, limit = 8, now = new Date()): CalendarEvent[] {
  const today = startOfDayInTimeZone(now);
  const parsedEvents = parseIcsEvents(ics);
  const recurrenceOverrides = new Set(
    parsedEvents.flatMap((event) => {
      if (!event.recurrenceId) return [];
      return [`${event.uid}:${event.recurrenceId.source}`, `${baseGoogleRecurringUid(event.uid)}:${event.recurrenceId.source}`];
    }),
  );

  const shows = parsedEvents.flatMap((event) =>
    expandEvent(event, today, recurrenceOverrides).filter((show) => show.end.getTime() >= today.getTime()),
  );

  return shows
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, limit)
    .map((show) => formatEvent(show));
}

function parseIcsEvents(ics: string): IcsEvent[] {
  const lines = unfoldIcs(ics);
  const events: IcsEvent[] = [];
  let current: IcsEvent | null = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      current = {
        uid: "",
        summary: "",
        location: "",
        dtstart: null,
        dtend: null,
        rrule: "",
        exdates: [],
        recurrenceId: null,
      };
      continue;
    }

    if (line === "END:VEVENT") {
      if (current?.uid && current.dtstart && current.summary) {
        events.push(current);
      }
      current = null;
      continue;
    }

    if (!current) continue;

    const { name, value } = splitProperty(line);
    if (name === "UID") current.uid = value;
    if (name === "SUMMARY") current.summary = decodeIcsText(value);
    if (name === "LOCATION") current.location = decodeIcsText(value);
    if (name === "DTSTART") current.dtstart = parseIcsDate(line, value);
    if (name === "DTEND") current.dtend = parseIcsDate(line, value);
    if (name === "RRULE") current.rrule = value;
    if (name === "EXDATE") current.exdates.push(...value.split(",").map((date) => parseIcsDate(line, date)));
    if (name === "RECURRENCE-ID") current.recurrenceId = parseIcsDate(line, value);
  }

  return events;
}

function expandEvent(
  event: IcsEvent,
  today: Date,
  recurrenceOverrides: Set<string>,
): Array<IcsEvent & { start: Date; end: Date; instanceKey: string }> {
  if (!event.dtstart) return [];

  if (!event.rrule) {
    return [withDates(event, event.dtstart.date)];
  }

  const rule = parseRrule(event.rrule);
  if (rule.FREQ !== "MONTHLY" || !rule.BYDAY) {
    return [withDates(event, event.dtstart.date)];
  }

  const until = rule.UNTIL ? parseIcsDate(`UNTIL:${rule.UNTIL}`, rule.UNTIL).date : addMonths(today, 18);
  const endSearch = until.getTime() < addMonths(today, 18).getTime() ? until : addMonths(today, 18);
  const candidates: Array<IcsEvent & { start: Date; end: Date; instanceKey: string }> = [];
  const exdates = new Set(event.exdates.map((date) => date.source));

  const firstOccurrence = getZonedParts(event.dtstart.date);

  for (let index = 0; index < 18; index += 1) {
    const monthCursor = addMonthsToParts(firstOccurrence.year, firstOccurrence.month - 1, index);
    const occurrence = nthWeekdayOfMonth(monthCursor.year, monthCursor.month, rule.BYDAY);
    if (!occurrence) continue;

    const start = zonedDateToUtc(
      occurrence.getFullYear(),
      occurrence.getMonth(),
      occurrence.getDate(),
      firstOccurrence.hour,
      firstOccurrence.minute,
      firstOccurrence.second,
    );
    if (start > endSearch) break;

    const source = formatFloatingSource(start, event.dtstart.source);
    const instanceKey = `${event.uid}:${source}`;

    if (start < event.dtstart.date || exdates.has(source) || recurrenceOverrides.has(instanceKey)) continue;
    candidates.push(withDates(event, start, source));
  }

  return candidates;
}

function withDates(event: IcsEvent, start: Date, instanceSource = event.dtstart?.source ?? "") {
  const duration = event.dtstart && event.dtend ? event.dtend.date.getTime() - event.dtstart.date.getTime() : 0;
  const end = duration > 0 ? new Date(start.getTime() + duration) : start;
  return { ...event, start, end, instanceKey: `${event.uid}:${instanceSource}` };
}

function formatEvent(event: IcsEvent & { start: Date; end: Date; instanceKey: string }): CalendarEvent {
  const currentYear = yearFormatter.format(new Date());
  const eventYear = yearFormatter.format(event.start);
  const dateLabel =
    currentYear === eventYear ? dayFormatter.format(event.start) : `${dayFormatter.format(event.start)}, ${eventYear}`;

  return {
    id: event.instanceKey,
    title: event.summary,
    location: event.location,
    start: event.start.toISOString(),
    end: event.end.toISOString(),
    dateLabel,
    timeLabel: event.dtstart?.isAllDay ? "All day" : timeFormatter.format(event.start),
    isAllDay: Boolean(event.dtstart?.isAllDay),
  };
}

function unfoldIcs(ics: string) {
  return ics
    .replace(/\r\n/g, "\n")
    .split("\n")
    .reduce<string[]>((lines, line) => {
      if (/^[ \t]/.test(line) && lines.length) {
        lines[lines.length - 1] += line.slice(1);
      } else if (line.trim()) {
        lines.push(line.trimEnd());
      }
      return lines;
    }, []);
}

function splitProperty(line: string) {
  const colonIndex = line.indexOf(":");
  const key = line.slice(0, colonIndex);
  return {
    name: key.split(";")[0],
    value: line.slice(colonIndex + 1),
  };
}

function decodeIcsText(value: string) {
  return value
    .replace(/\\n/g, " ")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\")
    .replace(/\s+/g, " ")
    .trim();
}

function parseIcsDate(line: string, value: string): IcsDate {
  if (/VALUE=DATE/.test(line)) {
    const year = Number(value.slice(0, 4));
    const month = Number(value.slice(4, 6)) - 1;
    const day = Number(value.slice(6, 8));

    return {
      date: zonedDateToUtc(year, month, day),
      isAllDay: true,
      source: value,
    };
  }

  const cleaned = value.replace(/Z$/, "");
  const year = Number(cleaned.slice(0, 4));
  const month = Number(cleaned.slice(4, 6)) - 1;
  const day = Number(cleaned.slice(6, 8));
  const hour = Number(cleaned.slice(9, 11) || "0");
  const minute = Number(cleaned.slice(11, 13) || "0");
  const second = Number(cleaned.slice(13, 15) || "0");

  return {
    date: value.endsWith("Z")
      ? new Date(Date.UTC(year, month, day, hour, minute, second))
      : zonedDateToUtc(year, month, day, hour, minute, second),
    isAllDay: false,
    source: value,
  };
}

function parseRrule(rrule: string) {
  return Object.fromEntries(rrule.split(";").map((part) => part.split("="))) as Record<string, string>;
}

function nthWeekdayOfMonth(year: number, month: number, byday: string) {
  const match = byday.match(/^([1-5])([A-Z]{2})$/);
  if (!match) return null;

  const targetWeek = Number(match[1]);
  const targetDay = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"].indexOf(match[2]);
  const first = new Date(year, month, 1);
  const offset = (targetDay - first.getDay() + 7) % 7;
  const date = 1 + offset + (targetWeek - 1) * 7;
  const occurrence = new Date(year, month, date);
  return occurrence.getMonth() === month ? occurrence : null;
}

function formatFloatingSource(date: Date, originalSource: string) {
  const zoned = getZonedParts(date);
  const time = originalSource.includes("T") ? originalSource.slice(9) : "";
  return `${zoned.year}${pad(zoned.month)}${pad(zoned.day)}${time ? `T${time}` : ""}`;
}

function startOfDayInTimeZone(date: Date) {
  const parts = getZonedParts(date);
  return zonedDateToUtc(parts.year, parts.month - 1, parts.day);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, date.getDate());
}

function addMonthsToParts(year: number, month: number, months: number) {
  const date = new Date(Date.UTC(year, month + months, 1));
  return { year: date.getUTCFullYear(), month: date.getUTCMonth() };
}

function getZonedParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

function zonedDateToUtc(year: number, month: number, day: number, hour = 0, minute = 0, second = 0) {
  const target = Date.UTC(year, month, day, hour, minute, second);
  let guess = new Date(target);

  for (let index = 0; index < 3; index += 1) {
    const parts = getZonedParts(guess);
    const rendered = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
    guess = new Date(guess.getTime() - (rendered - target));
  }

  return guess;
}

function baseGoogleRecurringUid(uid: string) {
  return uid.replace(/_R\d{8}T\d{6}(?=@google\.com$)/, "");
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}
