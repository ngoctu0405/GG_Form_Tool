import { random_date } from "./random_dmy/random-date.js";
import { random_time } from "./random-time.js";

export function random_date_time() {
  const date = random_date();
  const time = random_time();

  return `${date} ${time}`;
}
