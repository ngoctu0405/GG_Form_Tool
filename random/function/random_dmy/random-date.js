import { get_birth_year } from "./get-birth-year.js";
import { random_month } from "./random-month.js";

export function random_date(min, max) {
  const year = get_birth_year(min, max);

  const month = random_month();

  const daysInMonth = new Date(year, month, 0).getDate();

  return Math.floor(Math.random() * daysInMonth) + 1;
}
