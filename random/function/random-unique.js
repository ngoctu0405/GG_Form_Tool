const used = new Set();

export function random_unique(min, max) {
  if (used.size >= max - min + 1) {
    throw new Error("Không còn giá trị để random");
  }

  let value;

  do {
    value = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (used.has(value));

  used.add(value);

  return value;
}
