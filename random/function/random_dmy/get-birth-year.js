import { random_age } from "../random_info/random-age.js";

export function get_birth_year(min, max) {
  const age = random_age(min, max);

  const currentYear = new Date().getFullYear();

  return currentYear - age;
}
