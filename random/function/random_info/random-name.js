import fs from "fs";
import path from "path";

const usedNames = new Set();

export function random_name(gender) {
  const folder = path.join(
    import.meta.dirname,
    `../../../data/names/${gender}`,
  );

  const firstNames = fs
    .readFileSync(path.join(folder, "first-names.txt"), "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const middleNames = fs
    .readFileSync(path.join(folder, "middle-names.txt"), "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const surnames = fs
    .readFileSync(path.join(folder, "surnames.txt"), "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  let firstName;
  let middleName;
  let surname;
  let name;

  do {
    firstName = firstNames[Math.floor(Math.random() * firstNames.length)];

    middleName = middleNames[Math.floor(Math.random() * middleNames.length)];

    surname = surnames[Math.floor(Math.random() * surnames.length)];

    name = `${surname} ${middleName} ${firstName}`;
  } while (usedNames.has(name));

  usedNames.add(name);

  return name;
}
