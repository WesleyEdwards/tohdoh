import { GetMineRes } from "../api/apiTypes";

export function setTokenToLocalStorage(token: string) {
  localStorage.setItem("token", token);
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function removeToken() {
  localStorage.removeItem("token");
}

export function camelToTitleCase(camelCase: string): string {
  // Returns title case from either camelCase or snake_case
  return camelCase
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (str) => str.toUpperCase());
}

export function addHoursToDate(date: Date, hoursToAdd: number): Date {
  const newDate = new Date(date.toISOString());
  console.log(date);
  newDate.setHours(date.getHours() + hoursToAdd);
  return newDate;
}

export function isoStringToLocalDateTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
}

export function hasUnscheduledEvents(mySchedules: GetMineRes): boolean {
  const {
    unscheduledEventSchedulers,
    scheduledEventSchedulers,
    dueDateEventSchedulers,
  } = mySchedules;
  return unscheduledEventSchedulers.find((schedule) => {
    return !schedule.base.scheduledEvent;
  }) ||
    scheduledEventSchedulers.find((schedule) => {
      return !schedule.base.scheduledEvent;
    }) ||
    dueDateEventSchedulers.find((schedule) => {
      return !schedule.base.scheduledEvent;
    })
    ? true
    : false;
}
