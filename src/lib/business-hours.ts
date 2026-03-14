import type { OperatingHours, DaySchedule } from "@/types";

const DAY_NAMES: (keyof OperatingHours)[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function getDayName(date: Date): keyof OperatingHours {
  return DAY_NAMES[date.getDay()];
}

function parseTime(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return { hours, minutes };
}

function timeToMinutes(timeStr: string): number {
  const { hours, minutes } = parseTime(timeStr);
  return hours * 60 + minutes;
}

export function isCurrentlyOpen(
  operatingHours: OperatingHours,
  timezone: string = "Asia/Manila"
): { isOpen: boolean; nextChange: string; todayHours: string } {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  });
  const dayFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
  });

  const currentTimeStr = formatter.format(now);
  const currentDay = dayFormatter.format(now).toLowerCase() as keyof OperatingHours;
  const currentMinutes = timeToMinutes(currentTimeStr);
  const schedule: DaySchedule = operatingHours[currentDay];

  // Check if yesterday's overnight slot is still active
  const yesterdayIdx = (DAY_NAMES.indexOf(currentDay) + 6) % 7;
  const yesterdayKey = DAY_NAMES[yesterdayIdx];
  const yesterdaySchedule = operatingHours[yesterdayKey];
  if (yesterdaySchedule && !yesterdaySchedule.isClosed) {
    for (const slot of yesterdaySchedule.slots) {
      const openMin = timeToMinutes(slot.open);
      const closeMin = timeToMinutes(slot.close);
      // Overnight slot: close <= open means it wraps past midnight
      if (closeMin > 0 && closeMin <= openMin && currentMinutes < closeMin) {
        return {
          isOpen: true,
          nextChange: `Closes at ${formatTime12h(slot.close)}`,
          todayHours: schedule?.slots
            ?.map((s) => `${formatTime12h(s.open)} - ${formatTime12h(s.close)}`)
            .join(", ") ?? "Closed today",
        };
      }
    }
  }

  if (!schedule || schedule.isClosed || schedule.slots.length === 0) {
    const nextOpenDay = findNextOpenDay(operatingHours, currentDay);
    return {
      isOpen: false,
      nextChange: nextOpenDay
        ? `Opens ${nextOpenDay.day} at ${formatTime12h(nextOpenDay.time)}`
        : "Closed",
      todayHours: "Closed today",
    };
  }

  // Check if currently within any slot
  for (const slot of schedule.slots) {
    const openMin = timeToMinutes(slot.open);
    let closeMin = timeToMinutes(slot.close);

    // Handle midnight (00:00) as end of day, and overnight slots
    if (closeMin <= openMin) {
      closeMin += 24 * 60;
    }

    if (currentMinutes >= openMin && currentMinutes < closeMin) {
      return {
        isOpen: true,
        nextChange: `Closes at ${formatTime12h(slot.close)}`,
        todayHours: schedule.slots
          .map((s) => `${formatTime12h(s.open)} - ${formatTime12h(s.close)}`)
          .join(", "),
      };
    }
  }

  // Not within any slot — find next opening
  const upcomingSlot = schedule.slots.find(
    (s) => timeToMinutes(s.open) > currentMinutes
  );

  if (upcomingSlot) {
    return {
      isOpen: false,
      nextChange: `Opens at ${formatTime12h(upcomingSlot.open)}`,
      todayHours: schedule.slots
        .map((s) => `${formatTime12h(s.open)} - ${formatTime12h(s.close)}`)
        .join(", "),
    };
  }

  // Past all slots today
  const nextOpenDay = findNextOpenDay(operatingHours, currentDay);
  return {
    isOpen: false,
    nextChange: nextOpenDay
      ? `Opens ${nextOpenDay.day} at ${formatTime12h(nextOpenDay.time)}`
      : "Closed",
    todayHours: schedule.slots
      .map((s) => `${formatTime12h(s.open)} - ${formatTime12h(s.close)}`)
      .join(", "),
  };
}

function findNextOpenDay(
  hours: OperatingHours,
  currentDay: keyof OperatingHours
): { day: string; time: string } | null {
  const startIdx = DAY_NAMES.indexOf(currentDay);
  for (let i = 1; i <= 7; i++) {
    const dayKey = DAY_NAMES[(startIdx + i) % 7];
    const schedule = hours[dayKey];
    if (schedule && !schedule.isClosed && schedule.slots.length > 0) {
      return {
        day: dayKey.charAt(0).toUpperCase() + dayKey.slice(1),
        time: schedule.slots[0].open,
      };
    }
  }
  return null;
}

export function formatTime12h(time24: string): string {
  const { hours, minutes } = parseTime(time24);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function getTodaySchedule(
  operatingHours: OperatingHours,
  timezone: string = "Asia/Manila"
): DaySchedule | null {
  const now = new Date();
  const dayFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
  });
  const currentDay = dayFormatter.format(now).toLowerCase() as keyof OperatingHours;
  return operatingHours[currentDay] ?? null;
}
