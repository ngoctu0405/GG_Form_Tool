import fs from "fs";
import path from "path";

const filePath = path.join(import.meta.dirname, "../../../data/location.json");

const LOCATIONS = JSON.parse(fs.readFileSync(filePath, "utf8"));

function pick(array) {
  if (!Array.isArray(array) || array.length === 0) {
    throw new Error("Không có dữ liệu để random");
  }

  return array[Math.floor(Math.random() * array.length)];
}

export function random_address() {
  // Random tỉnh / thành phố
  const provinces = Object.keys(LOCATIONS);
  const province = pick(provinces);

  // Random phường / xã thuộc tỉnh đó
  const wards = Object.keys(LOCATIONS[province]);
  const ward = pick(wards);

  // Random đường thuộc phường / xã
  const streets = LOCATIONS[province][ward];

  const street = pick(streets);

  // Random số nhà từ 1 -> 500
  const houseNumber = Math.floor(Math.random() * 500) + 1;

  return `${houseNumber} ${street}, ${ward}, ${province}`;
}
