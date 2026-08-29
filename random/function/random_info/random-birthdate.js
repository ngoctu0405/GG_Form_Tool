import { random_age } from "./random-age.js";
import { get_birth_year } from "../random_dmy/get-birth-year.js";
import { random_month } from "../random_dmy/random-month.js";
import { random_date } from "../random_dmy/random-date.js";

export function random_birthdate(min, max) {
  const age = random_age(min, max);

  const year = get_birth_year(age);

  const month = random_month();

  const day = random_date(year, month);

  return `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
}
