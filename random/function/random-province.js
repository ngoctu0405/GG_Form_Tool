import fs from "fs";
import path from "path";

export function random_province() {
  const filePath = path.join(
    import.meta.dirname,
    "../../data/provinces-34.txt",
  );

  const provinces = fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const randomIndex = Math.floor(Math.random() * provinces.length);

  return provinces[randomIndex];
}
