export function random_age(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
