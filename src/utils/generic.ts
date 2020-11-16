const timeUnit = ["year", "month", "week", "day", "hour", "minute", "second"] as const;
type TimeUnit = ArrayElement<typeof timeUnit>;
type ArrayElement<A> = A extends readonly (infer T)[]
  ? T
  : never;

type TimeDescription = {
  [T in TimeUnit]?: number
}

const secInMs = (sec: number) => sec * 1000;
const minuteInMs = (minute: number) => secInMs(minute * 60);
const hourInMs = (hour: number) => minuteInMs(hour * 60);
const dayInMs = (day: number) => hourInMs(day * 24);
const weekInMs = (week: number) => dayInMs(7);
const monthInMs = (month: number) => dayInMs(30);
const yearInMs = (year: number) => dayInMs(365);
const unitToMs: {[T in TimeUnit]: (unit: number) => number} = {
  day: dayInMs,
  hour: hourInMs,
  minute: minuteInMs,
  month: monthInMs,
  second: secInMs,
  week: weekInMs,
  year: yearInMs,
}

export const convertTimeToMs = (timeDesc: TimeDescription): number => {
  return Object.entries(timeDesc)
    .map(([unit, val]) => {
      if (val) return unitToMs[unit as TimeUnit](val);
      return 0;
    })
    .reduce((acc, ms) => acc + ms, 0);
}
