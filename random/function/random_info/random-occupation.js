import fs from "fs";
import path from "path";

export function random_occupation() {
  const filePath = path.join(
    import.meta.dirname,
    "../../../data/occupations.txt",
  );

  const occupations = fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return occupations[Math.floor(Math.random() * occupations.length)];
}
