import fs from "fs";
import path from "path";

const filePath = path.join(import.meta.dirname, "../../../data/names.json");

// Đọc JSON đúng 1 lần khi chương trình khởi động
const NAMES = JSON.parse(fs.readFileSync(filePath, "utf8"));

// Lưu những tên đã sử dụng
const usedNames = new Set();

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

export function random_name(gender) {
  // Chuẩn hóa gender
  let selectedGender = String(gender || "")
    .trim()
    .toLowerCase();

  if (selectedGender === "nam" || selectedGender === "male") {
    selectedGender = "male";
  } else if (
    selectedGender === "nữ" ||
    selectedGender === "nu" ||
    selectedGender === "female"
  ) {
    selectedGender = "female";
  } else {
    // Không truyền gender -> random nam/nữ
    selectedGender = Math.random() < 0.5 ? "male" : "female";
  }

  const data = NAMES[selectedGender];

  if (!data) {
    throw new Error(`Không tìm thấy dữ liệu gender: ${selectedGender}`);
  }

  const surnames = data.surnames;
  const middleNames = data.middle_names;
  const firstNames = data.first_names;

  // Tổng số tổ hợp tối đa của gender này
  const maxCombinations =
    surnames.length * middleNames.length * firstNames.length;

  let surname;
  let middleName;
  let firstName;
  let name;

  let attempts = 0;

  do {
    surname = pick(surnames);
    middleName = pick(middleNames);
    firstName = pick(firstNames);

    name = `${surname} ${middleName} ${firstName}`;

    attempts++;

    // Tránh vòng lặp vô hạn nếu đã dùng gần hết tên
    if (attempts > maxCombinations * 2) {
      throw new Error(`Không thể tạo thêm tên unique cho ${selectedGender}`);
    }
  } while (usedNames.has(name));

  usedNames.add(name);

  return name;
}
