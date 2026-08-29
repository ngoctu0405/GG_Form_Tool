import fs from "fs";
import path from "path";

export function random_address() {
  const files = [
    "../../../data/addresses/ha-noi.txt",
    "../../../data/addresses/ho-chi-minh.txt",
    "../../../data/addresses/other-provinces.txt",
  ];

  const addresses = files.flatMap((file) => {
    const filePath = path.join(import.meta.dirname, file);

    return fs
      .readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  });

  const randomIndex = Math.floor(Math.random() * addresses.length);

  return addresses[randomIndex];
}
