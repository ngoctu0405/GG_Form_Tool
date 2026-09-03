import fs from "fs";
import path from "path";

import { random_occupation } from "./random-occupation.js";

const DATA_DIR = path.join(import.meta.dirname, "../../../data");

function readJsonArray(...segments) {
  const filePath = path.join(DATA_DIR, ...segments);
  const value = JSON.parse(fs.readFileSync(filePath, "utf8"));
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`Dữ liệu không hợp lệ hoặc rỗng: ${filePath}`);
  }
  return value;
}

const PRIMARY_SCHOOLS = readJsonArray("schools", "primary-schools.json");
const MIDDLE_SCHOOLS = readJsonArray("schools", "middle-schools.json");
const HIGH_SCHOOLS = readJsonArray("schools", "high-schools.json");
const UNIVERSITIES = readJsonArray("schools", "universities.json");
const MAJORS = readJsonArray("majors.json");

const PROVINCE_ALIASES = {
  "Thành phố Hồ Chí Minh": [
    "Thành phố Hồ Chí Minh",
    "Hồ Chí Minh",
    "Bình Dương",
    "Bà Rịa - Vũng Tàu",
  ],
  "Đồng Nai": ["Đồng Nai", "Bình Phước"],
  "Tây Ninh": ["Tây Ninh", "Long An"],
  "Lâm Đồng": ["Lâm Đồng", "Bình Thuận", "Đắk Nông"],
  "Thành phố Cần Thơ": ["Cần Thơ", "Hậu Giang", "Sóc Trăng"],
  "Vĩnh Long": ["Vĩnh Long", "Bến Tre", "Trà Vinh"],
  "Đồng Tháp": ["Đồng Tháp", "Tiền Giang"],
  "Cà Mau": ["Cà Mau", "Bạc Liêu"],
  "An Giang": ["An Giang", "Kiên Giang"],
  "Quảng Trị": ["Quảng Trị", "Quảng Bình"],
  "Thành phố Huế": ["Huế", "Thừa Thiên Huế"],
  "Đà Nẵng": ["Đà Nẵng", "Quảng Nam"],
  "Quảng Ngãi": ["Quảng Ngãi", "Kon Tum"],
  "Gia Lai": ["Gia Lai", "Bình Định", "Quy Nhơn"],
  "Khánh Hòa": ["Khánh Hòa", "Ninh Thuận"],
  "Đắk Lắk": ["Đắk Lắk", "Phú Yên"],
};

const UNIVERSITY_HINTS = {
  "Thanh Hóa": ["Hồng Đức"],
  "Nghệ An": ["Đại học Vinh", "Y khoa Vinh"],
  "Hà Tĩnh": ["Đại học Vinh"],
  "Quảng Trị": ["Đại học Huế"],
  "Quảng Ngãi": ["Phạm Văn Đồng"],
  "Gia Lai": ["Quy Nhơn"],
  "Đắk Lắk": ["Tây Nguyên"],
  "Cà Mau": ["Cần Thơ", "Tây Đô"],
  "Tây Ninh": ["Thành phố Hồ Chí Minh", "Sài Gòn"],
};

function plainText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d");
}

function pick(values) {
  return values[Math.floor(Math.random() * values.length)];
}

function addressParts(address) {
  const parts = String(address)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  return {
    province: parts.at(-1) || "",
    locality: (parts.at(-2) || "")
      .replace(/^(phường|xã|thị trấn)\s+/i, "")
      .trim(),
  };
}

function aliasesFor(province) {
  return PROVINCE_ALIASES[province] || [province];
}

function schoolsInProvince(schools, province) {
  const aliases = aliasesFor(province).map(plainText);
  return schools.filter((school) => {
    const normalized = plainText(school);
    return aliases.some((alias) => normalized.endsWith(alias));
  });
}

function pickSchool(schools, province, locality, label) {
  const matches = schoolsInProvince(schools, province);
  if (matches.length) return pick(matches);
  return `Trường ${label} ${locality || province}`;
}

function pickUniversity(province) {
  const matches = schoolsInProvince(UNIVERSITIES, province);
  const hints = (UNIVERSITY_HINTS[province] || []).map(plainText);
  const hinted = UNIVERSITIES.filter((university) =>
    hints.some((hint) => plainText(university).includes(hint)),
  );
  return pick(matches.length ? matches : hinted.length ? hinted : UNIVERSITIES);
}

function pickMajor(university) {
  const name = plainText(university);
  const rules = [
    {
      pattern: /y duoc|y khoa|dai hoc y|duoc ha noi/,
      keywords: ["Y khoa", "Dược học", "Điều dưỡng", "Răng - Hàm - Mặt"],
    },
    {
      pattern: /ngoai ngu|dai hoc ha noi/,
      keywords: ["Ngôn ngữ Anh", "Ngôn ngữ Trung Quốc"],
    },
    {
      pattern: /luat/,
      keywords: ["Luật", "Luật kinh tế"],
    },
    {
      pattern: /su pham|giao duc/,
      keywords: ["Sư phạm Toán học", "Sư phạm Ngữ văn", "Sư phạm Tiếng Anh"],
    },
    {
      pattern: /nong lam|nong nghiep/,
      keywords: [
        "Nông nghiệp",
        "Thú y",
        "Công nghệ sinh học",
        "Công nghệ thực phẩm",
        "Quản lý tài nguyên và môi trường",
      ],
    },
    {
      pattern: /kinh te|thuong mai|ngan hang|tai chinh|kinh doanh/,
      keywords: [
        "Quản trị kinh doanh",
        "Kinh doanh quốc tế",
        "Marketing",
        "Tài chính - Ngân hàng",
        "Kế toán",
        "Kiểm toán",
        "Kinh tế",
        "Thương mại điện tử",
        "Logistics và quản lý chuỗi cung ứng",
      ],
    },
    {
      pattern: /bach khoa|ky thuat|cong nghe|giao thong|dien luc|mo - dia chat|xay dung|thuy loi|fpt|phenikaa/,
      keywords: [
        "Công nghệ thông tin",
        "Khoa học máy tính",
        "Kỹ thuật phần mềm",
        "An toàn thông tin",
        "Trí tuệ nhân tạo",
        "Khoa học dữ liệu",
        "Hệ thống thông tin",
        "Kỹ thuật điện",
        "Kỹ thuật điện tử - viễn thông",
        "Kỹ thuật điều khiển và tự động hóa",
        "Kỹ thuật cơ khí",
        "Kỹ thuật ô tô",
        "Kỹ thuật xây dựng",
      ],
    },
    {
      pattern: /kien truc/,
      keywords: ["Kiến trúc", "Thiết kế đồ họa", "Kỹ thuật xây dựng"],
    },
    {
      pattern: /xa hoi|nhan van|van hoa|bao chi|ngoai giao/,
      keywords: [
        "Quan hệ quốc tế",
        "Truyền thông đa phương tiện",
        "Quan hệ công chúng",
        "Báo chí",
        "Tâm lý học",
        "Công tác xã hội",
        "Ngôn ngữ Anh",
      ],
    },
    {
      pattern: /khoa hoc tu nhien/,
      keywords: [
        "Công nghệ thông tin",
        "Khoa học máy tính",
        "Trí tuệ nhân tạo",
        "Khoa học dữ liệu",
        "Công nghệ sinh học",
      ],
    },
  ];

  const rule = rules.find(({ pattern }) => pattern.test(name));
  if (!rule) return pick(MAJORS);
  const candidates = MAJORS.filter((major) => rule.keywords.includes(major));
  return pick(candidates.length ? candidates : MAJORS);
}

function workingOccupation() {
  let occupation = random_occupation();
  while (plainText(occupation) === "sinh vien") {
    occupation = random_occupation();
  }
  return occupation;
}

export function random_life_profile(age, address) {
  const { province, locality } = addressParts(address);

  if (age < 18) {
    const gradeNumber = Math.max(1, Math.min(12, age - 5));
    const educationLevel =
      gradeNumber <= 5 ? "Tiểu học" : gradeNumber <= 9 ? "THCS" : "THPT";
    const schoolList =
      gradeNumber <= 5
        ? PRIMARY_SCHOOLS
        : gradeNumber <= 9
          ? MIDDLE_SCHOOLS
          : HIGH_SCHOOLS;

    return {
      status: "Học sinh",
      occupation: "Học sinh",
      grade: `Lớp ${gradeNumber}`,
      gradeNumber,
      educationLevel,
      studentYear: "",
      university: "",
      major: "",
      school: pickSchool(schoolList, province, locality, educationLevel),
    };
  }

  if (age <= 23) {
    const university = pickUniversity(province);
    const studentYearNumber = Math.min(5, Math.max(1, age - 17));
    return {
      status: "Sinh viên",
      occupation: "Sinh viên",
      grade: "",
      gradeNumber: null,
      educationLevel: "Đại học",
      studentYear: `Năm ${studentYearNumber}`,
      studentYearNumber,
      university,
      major: pickMajor(university),
      school: university,
    };
  }

  return {
    status: "Đang đi làm",
    occupation: workingOccupation(),
    grade: "",
    gradeNumber: null,
    educationLevel: "",
    studentYear: "",
    studentYearNumber: null,
    university: "",
    major: "",
    school: "",
  };
}
