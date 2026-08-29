const fs = require("fs");
const path = require("path");

// ==========================================
// CẤU HÌNH
// ==========================================

const OUTPUT_DIR = path.join(__dirname, "data");

const NAMES_DIR = path.join(OUTPUT_DIR, "names");
const ADDRESSES_DIR = path.join(OUTPUT_DIR, "addresses");

const TOTAL_MALE_NAMES = 2000;
const TOTAL_FEMALE_NAMES = 2000;

const TOTAL_PHONES = 8000;

const TOTAL_HCM_ADDRESSES = 3000;
const TOTAL_HANOI_ADDRESSES = 1000;
const TOTAL_OTHER_ADDRESSES = 4000;

// ==========================================
// TẠO FOLDER
// ==========================================

fs.mkdirSync(OUTPUT_DIR, {
  recursive: true,
});

fs.mkdirSync(NAMES_DIR, {
  recursive: true,
});

fs.mkdirSync(ADDRESSES_DIR, {
  recursive: true,
});

// ==========================================
// HỌ
// ==========================================

const SURNAMES = [
  "Nguyễn",
  "Trần",
  "Lê",
  "Phạm",
  "Hoàng",
  "Huỳnh",
  "Phan",
  "Vũ",
  "Võ",
  "Đặng",
  "Bùi",
  "Đỗ",
  "Hồ",
  "Ngô",
  "Dương",
  "Lý",
  "Đinh",
  "Mai",
  "Trương",
  "Cao",
  "Tô",
  "Lâm",
  "Đoàn",
  "Lương",
  "Phùng",
  "Quách",
  "Hà",
  "Tạ",
  "Vương",
  "Đào",
  "Chu",
  "Đàm",
  "Kiều",
  "Thái",
  "Châu",
  "La",
  "Tăng",
  "Lưu",
  "Ninh",
  "Triệu",
  "Khương",
  "Mạc",
  "Thân",
  "Diệp",
  "Đồng",
  "Hứa",
  "Tống",
  "Chung",
  "Từ",
  "Mã",
  "Tôn",
  "Hồng",
  "Tần",
  "Tiêu",
  "Chế",
  "Quan",
  "Âu",
  "Ông",
  "Vi",
  "Sơn",
  "Liêu",
  "Lục",
  "Kim",
  "Trang",
  "Thạch",
  "Chương",
  "Cấn",
  "Bạch",
  "Đường",
  "Tào",
  "Mạnh",
  "Thạch",
  "Lăng",
];

// ==========================================
// TÊN NAM
// ==========================================

const MALE_FIRST_NAMES = [
  "An",
  "Anh",
  "Bách",
  "Bình",
  "Chính",
  "Cường",
  "Dũng",
  "Đạt",
  "Đăng",
  "Đức",
  "Duy",
  "Hải",
  "Hào",
  "Hiếu",
  "Hoàng",
  "Hùng",
  "Hưng",
  "Khang",
  "Khánh",
  "Kiên",
  "Long",
  "Lộc",
  "Minh",
  "Nam",
  "Nghĩa",
  "Nguyên",
  "Phong",
  "Phúc",
  "Quân",
  "Quang",
  "Sơn",
  "Tài",
  "Thắng",
  "Thành",
  "Thiện",
  "Thông",
  "Toàn",
  "Trí",
  "Trung",
  "Tuấn",
  "Tùng",
  "Vinh",
  "Việt",
  "Khôi",
  "Khoa",
  "Nhân",
  "Nhật",
  "Tâm",
  "Thiên",
  "Thái",
  "Triều",
  "Trường",
  "Huy",
  "Huyền",
  "Khải",
  "Khiêm",
  "Lâm",
  "Mạnh",
  "Nghị",
  "Phát",
  "Tấn",
  "Tín",
  "Trọng",
  "Vũ",
  "Bảo",
  "Gia",
  "Hậu",
  "Kỳ",
  "Lợi",
  "Phú",
  "Tâm",
  "Thịnh",
  "Vĩ",
];

// ==========================================
// TÊN NỮ
// ==========================================

const FEMALE_FIRST_NAMES = [
  "An",
  "Anh",
  "Chi",
  "Châu",
  "Diệp",
  "Dung",
  "Giang",
  "Hà",
  "Hạnh",
  "Hiền",
  "Hoa",
  "Hương",
  "Khánh",
  "Lan",
  "Linh",
  "Ly",
  "Mai",
  "My",
  "Ngân",
  "Ngọc",
  "Nhi",
  "Nhung",
  "Oanh",
  "Phương",
  "Quỳnh",
  "Thảo",
  "Trang",
  "Trâm",
  "Uyên",
  "Vân",
  "Vy",
  "Yến",
  "Tâm",
  "Tiên",
  "Tú",
  "Huyền",
  "Mỹ",
  "Thanh",
  "Thư",
  "Trinh",
  "Như",
  "Kim",
  "Bích",
  "Diễm",
  "Hạ",
  "Nguyệt",
  "Ánh",
  "Hân",
  "Khanh",
  "Lệ",
  "Mẫn",
  "Nhã",
  "Quyên",
  "Tuyết",
  "Vân",
  "Xuân",
  "Yên",
  "Thùy",
  "Tường",
  "Lam",
  "Phúc",
  "Kiều",
  "Minh",
  "Nhật",
  "Thy",
  "Hồng",
  "Loan",
  "Mộng",
  "Duyên",
  "Khả",
];

// ==========================================
// TÊN ĐỆM NAM
// ==========================================

const MALE_MIDDLE_NAMES = [
  "Văn",
  "Hữu",
  "Đức",
  "Minh",
  "Quốc",
  "Anh",
  "Tuấn",
  "Thanh",
  "Công",
  "Xuân",
  "Duy",
  "Hoàng",
  "Trọng",
  "Đình",
  "Ngọc",
  "Chí",
  "Mạnh",
  "Phúc",
  "Gia",
  "Khắc",
  "Nhật",
  "Thiên",
  "Thành",
  "Quang",
  "Bảo",
  "Hải",
  "Tấn",
  "Đăng",
  "Thế",
  "Cao",
  "Thái",
  "Việt",
  "Trường",
  "Khải",
  "Đình",
  "Phi",
  "Huy",
  "Tùng",
  "Phước",
  "Nhân",
];

// ==========================================
// TÊN ĐỆM NỮ
// ==========================================

const FEMALE_MIDDLE_NAMES = [
  "Thị",
  "Ngọc",
  "Thu",
  "Thanh",
  "Kim",
  "Hoài",
  "Bảo",
  "Minh",
  "Khánh",
  "Mai",
  "Phương",
  "Quỳnh",
  "Diệu",
  "Thùy",
  "Hồng",
  "Mỹ",
  "Tú",
  "Gia",
  "Như",
  "Anh",
  "Lan",
  "Hà",
  "Tường",
  "Ánh",
  "Trúc",
  "Bích",
  "Thanh",
  "Nguyệt",
  "Xuân",
  "Hoàng",
  "Kiều",
  "Nhã",
  "Mộng",
  "Tuyết",
  "Hạ",
  "Uyên",
  "Khả",
  "Diễm",
  "Linh",
  "Hân",
];

// ==========================================
// RANDOM
// ==========================================

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ==========================================
// TẠO TÊN NAM
// ==========================================

function createMaleName() {
  const surname = randomItem(SURNAMES);
  const middle = randomItem(MALE_MIDDLE_NAMES);
  const first = randomItem(MALE_FIRST_NAMES);

  return `${surname} ${middle} ${first}`;
}

// ==========================================
// TẠO TÊN NỮ
// ==========================================

function createFemaleName() {
  const surname = randomItem(SURNAMES);
  const middle = randomItem(FEMALE_MIDDLE_NAMES);
  const first = randomItem(FEMALE_FIRST_NAMES);

  return `${surname} ${middle} ${first}`;
}

// ==========================================
// TẠO TÊN KHÔNG TRÙNG
// ==========================================

function generateUniqueData(count, generator) {
  const result = new Set();

  while (result.size < count) {
    result.add(generator());
  }

  return [...result];
}

// ==========================================
// TẠO 2000 TÊN NAM
// ==========================================

console.log("Đang tạo tên nam...");

const maleNames = generateUniqueData(TOTAL_MALE_NAMES, createMaleName);

fs.writeFileSync(
  path.join(NAMES_DIR, "male-names.txt"),
  maleNames.join("\n"),
  "utf8",
);

console.log(`✓ male-names.txt → ${maleNames.length} tên nam`);

// ==========================================
// TẠO 2000 TÊN NỮ
// ==========================================

console.log("Đang tạo tên nữ...");

const femaleNames = generateUniqueData(TOTAL_FEMALE_NAMES, createFemaleName);

fs.writeFileSync(
  path.join(NAMES_DIR, "female-names.txt"),
  femaleNames.join("\n"),
  "utf8",
);

console.log(`✓ female-names.txt → ${femaleNames.length} tên nữ`);

// ==========================================
// ĐẦU SỐ ĐIỆN THOẠI
// ==========================================

const PHONE_PREFIXES = [
  "032",
  "033",
  "034",
  "035",
  "036",
  "037",
  "038",
  "039",
  "096",
  "097",
  "098",
  "070",
  "076",
  "077",
  "078",
  "079",
  "089",
  "090",
  "093",
  "081",
  "082",
  "083",
  "084",
  "085",
  "088",
  "091",
  "094",
];

// ==========================================
// KIỂM TRA SỐ ĐẸP
// ==========================================

function isBeautifulPhone(phone) {
  const digits = phone.slice(3);

  // 3 số giống nhau liên tiếp
  if (/(\d)\1{2,}/.test(digits)) {
    return true;
  }

  // 4 số giống nhau
  if (/(\d)\1{3,}/.test(digits)) {
    return true;
  }

  // ABAB
  if (/(\d{2})\1/.test(digits)) {
    return true;
  }

  // ABCABC
  if (/(\d{3})\1/.test(digits)) {
    return true;
  }

  // 123 / 234 / 345 / ...
  for (let i = 0; i < digits.length - 2; i++) {
    const a = Number(digits[i]);
    const b = Number(digits[i + 1]);
    const c = Number(digits[i + 2]);

    if (b === a + 1 && c === b + 1) {
      return true;
    }

    if (b === a - 1 && c === b - 1) {
      return true;
    }
  }

  // Một chữ số xuất hiện quá nhiều
  const counter = {};

  for (const digit of digits) {
    counter[digit] = (counter[digit] || 0) + 1;
  }

  const maxCount = Math.max(...Object.values(counter));

  if (maxCount >= 5) {
    return true;
  }

  return false;
}

// ==========================================
// TẠO 1 SỐ ĐIỆN THOẠI
// ==========================================

function createPhone() {
  while (true) {
    const prefix = randomItem(PHONE_PREFIXES);

    let suffix = "";

    for (let i = 0; i < 7; i++) {
      suffix += randomInt(0, 9);
    }

    const phone = prefix + suffix;

    if (!isBeautifulPhone(phone)) {
      return phone;
    }
  }
}

// ==========================================
// TẠO SỐ ĐIỆN THOẠI
// ==========================================

console.log("Đang tạo số điện thoại...");

const phones = generateUniqueData(TOTAL_PHONES, createPhone);

fs.writeFileSync(
  path.join(OUTPUT_DIR, "phone-numbers.txt"),
  phones.join("\n"),
  "utf8",
);

console.log(`✓ phone-numbers.txt → ${phones.length} số`);

// ==========================================
// ĐỊA CHỈ HỒ CHÍ MINH
// ==========================================

const HCM_AREAS = [
  "Quận 1",
  "Quận 3",
  "Quận 4",
  "Quận 5",
  "Quận 6",
  "Quận 7",
  "Quận 8",
  "Quận 10",
  "Quận 11",
  "Quận 12",
  "Bình Thạnh",
  "Tân Bình",
  "Tân Phú",
  "Phú Nhuận",
  "Gò Vấp",
  "Bình Tân",
  "Thủ Đức",
];

const HCM_STREETS = [
  "Nguyễn Trãi",
  "Cách Mạng Tháng Tám",
  "Lê Văn Sỹ",
  "Điện Biên Phủ",
  "Nguyễn Thị Minh Khai",
  "Phan Văn Trị",
  "Quang Trung",
  "Hoàng Văn Thụ",
  "Lý Thường Kiệt",
  "3 Tháng 2",
  "Võ Văn Tần",
  "Nam Kỳ Khởi Nghĩa",
  "Hai Bà Trưng",
  "Pasteur",
  "Trần Hưng Đạo",
  "Nguyễn Văn Cừ",
  "Phạm Văn Đồng",
  "Xô Viết Nghệ Tĩnh",
  "Đinh Tiên Hoàng",
  "Trường Chinh",
  "Phạm Ngọc Thạch",
  "Nguyễn Đình Chiểu",
  "Nguyễn Văn Linh",
  "Huỳnh Tấn Phát",
  "Lê Lợi",
];

// ==========================================
// TẠO ĐỊA CHỈ HCM
// ==========================================

function createHcmAddress() {
  const number = randomInt(1, 999);
  const street = randomItem(HCM_STREETS);
  const area = randomItem(HCM_AREAS);

  return `${number} ${street}, ${area}, Hồ Chí Minh`;
}

// ==========================================
// ĐỊA CHỈ HÀ NỘI
// ==========================================

const HANOI_AREAS = [
  "Ba Đình",
  "Hoàn Kiếm",
  "Tây Hồ",
  "Long Biên",
  "Cầu Giấy",
  "Đống Đa",
  "Hai Bà Trưng",
  "Hoàng Mai",
  "Thanh Xuân",
  "Nam Từ Liêm",
  "Bắc Từ Liêm",
  "Hà Đông",
  "Sóc Sơn",
  "Đông Anh",
  "Gia Lâm",
];

const HANOI_STREETS = [
  "Cầu Giấy",
  "Xuân Thủy",
  "Nguyễn Trãi",
  "Láng",
  "Kim Mã",
  "Giải Phóng",
  "Trường Chinh",
  "Hoàng Quốc Việt",
  "Phạm Hùng",
  "Nguyễn Chí Thanh",
  "Đội Cấn",
  "Thái Hà",
  "Xã Đàn",
  "Tôn Đức Thắng",
  "Trần Duy Hưng",
  "Lê Văn Lương",
  "Nguyễn Văn Cừ",
  "Minh Khai",
  "Bạch Mai",
  "Đại Cồ Việt",
  "Hoàng Hoa Thám",
  "Nguyễn Khuyến",
  "Phan Đình Phùng",
  "Hai Bà Trưng",
  "Lê Duẩn",
];

// ==========================================
// TẠO ĐỊA CHỈ HÀ NỘI
// ==========================================

function createHanoiAddress() {
  const number = randomInt(1, 999);
  const street = randomItem(HANOI_STREETS);
  const area = randomItem(HANOI_AREAS);

  return `${number} ${street}, ${area}, Hà Nội`;
}

// ==========================================
// 34 TỈNH / THÀNH PHỐ
// ==========================================

const PROVINCES_34 = [
  "An Giang",
  "Bắc Ninh",
  "Cà Mau",
  "Cao Bằng",
  "Cần Thơ",
  "Đà Nẵng",
  "Đắk Lắk",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Nội",
  "Hà Tĩnh",
  "Hải Phòng",
  "Hồ Chí Minh",
  "Hưng Yên",
  "Khánh Hòa",
  "Lai Châu",
  "Lạng Sơn",
  "Lào Cai",
  "Lâm Đồng",
  "Nghệ An",
  "Ninh Bình",
  "Phú Thọ",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sơn La",
  "Tây Ninh",
  "Thanh Hóa",
  "Thái Nguyên",
  "Tuyên Quang",
  "Vĩnh Long",
  "Huế",
];

// ==========================================
// KHU VỰC CÁC TỈNH / THÀNH KHÁC
// ==========================================

const OTHER_AREAS = {
  "An Giang": ["Long Xuyên", "Châu Đốc", "Tịnh Biên", "Châu Thành"],

  "Bắc Ninh": ["Bắc Ninh", "Từ Sơn", "Yên Phong", "Quế Võ"],

  "Cà Mau": ["Cà Mau", "U Minh", "Trần Văn Thời", "Đầm Dơi"],

  "Cao Bằng": ["Cao Bằng", "Trùng Khánh", "Hòa An", "Nguyên Bình"],

  "Cần Thơ": ["Ninh Kiều", "Bình Thủy", "Cái Răng", "Ô Môn"],

  "Đà Nẵng": ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn"],

  "Đắk Lắk": ["Buôn Ma Thuột", "Ea Kar", "Krông Pắc", "Cư M'gar"],

  "Điện Biên": ["Điện Biên Phủ", "Mường Lay", "Điện Biên", "Tuần Giáo"],

  "Đồng Nai": ["Biên Hòa", "Long Khánh", "Nhơn Trạch", "Trảng Bom"],

  "Đồng Tháp": ["Cao Lãnh", "Sa Đéc", "Hồng Ngự", "Lấp Vò"],

  "Gia Lai": ["Pleiku", "An Khê", "Ayun Pa", "Chư Păh"],

  "Hà Tĩnh": ["Hà Tĩnh", "Hồng Lĩnh", "Kỳ Anh", "Nghi Xuân"],

  "Hải Phòng": ["Hồng Bàng", "Lê Chân", "Ngô Quyền", "Kiến An"],

  "Hưng Yên": ["Hưng Yên", "Mỹ Hào", "Văn Lâm", "Khoái Châu"],

  "Khánh Hòa": ["Nha Trang", "Cam Ranh", "Ninh Hòa", "Diên Khánh"],

  "Lai Châu": ["Lai Châu", "Phong Thổ", "Tam Đường", "Than Uyên"],

  "Lạng Sơn": ["Lạng Sơn", "Cao Lộc", "Hữu Lũng", "Chi Lăng"],

  "Lào Cai": ["Lào Cai", "Sa Pa", "Bát Xát", "Bảo Thắng"],

  "Lâm Đồng": ["Đà Lạt", "Bảo Lộc", "Đức Trọng", "Di Linh"],

  "Nghệ An": ["Vinh", "Cửa Lò", "Diễn Châu", "Nghi Lộc"],

  "Ninh Bình": ["Hoa Lư", "Tam Điệp", "Nho Quan", "Kim Sơn"],

  "Phú Thọ": ["Việt Trì", "Phú Thọ", "Lâm Thao", "Thanh Sơn"],

  "Quảng Ngãi": ["Quảng Ngãi", "Đức Phổ", "Sơn Tịnh", "Tư Nghĩa"],

  "Quảng Ninh": ["Hạ Long", "Móng Cái", "Cẩm Phả", "Uông Bí"],

  "Quảng Trị": ["Đông Hà", "Quảng Trị", "Vĩnh Linh", "Gio Linh"],

  "Sơn La": ["Sơn La", "Mộc Châu", "Mai Sơn", "Thuận Châu"],

  "Tây Ninh": ["Tân An", "Mộc Hóa", "Bến Lức", "Đức Hòa"],

  "Thanh Hóa": ["Thanh Hóa", "Sầm Sơn", "Bỉm Sơn", "Nghi Sơn"],

  "Thái Nguyên": ["Thái Nguyên", "Sông Công", "Phổ Yên", "Đại Từ"],

  "Tuyên Quang": ["Tuyên Quang", "Hàm Yên", "Yên Sơn", "Na Hang"],

  "Vĩnh Long": ["Vĩnh Long", "Bình Minh", "Long Hồ", "Mang Thít"],

  Huế: ["Thuận Hóa", "Phú Xuân", "Hương Thủy", "Hương Trà"],
};

// ==========================================
// ĐƯỜNG PHỐ CHUNG
// ==========================================

const OTHER_STREETS = [
  "Nguyễn Huệ",
  "Trần Hưng Đạo",
  "Lê Lợi",
  "Quang Trung",
  "Phan Đình Phùng",
  "Hoàng Văn Thụ",
  "Lý Thường Kiệt",
  "Hai Bà Trưng",
  "Nguyễn Trãi",
  "Trần Phú",
  "Đinh Tiên Hoàng",
  "Cách Mạng Tháng Tám",
  "Phạm Văn Đồng",
  "Nguyễn Văn Cừ",
  "Võ Thị Sáu",
  "Lê Duẩn",
  "Nguyễn Du",
  "Phan Chu Trinh",
  "Trần Phú",
  "Nguyễn Thái Học",
];

// ==========================================
// TẠO ĐỊA CHỈ TỈNH / THÀNH KHÁC
// ==========================================

function createOtherAddress() {
  const provinces = PROVINCES_34.filter(
    (province) => province !== "Hồ Chí Minh" && province !== "Hà Nội",
  );

  const province = randomItem(provinces);

  const areas = OTHER_AREAS[province] || ["Trung tâm"];

  const area = randomItem(areas);
  const street = randomItem(OTHER_STREETS);
  const number = randomInt(1, 999);

  return `${number} ${street}, ${area}, ${province}`;
}

// ==========================================
// TẠO 3000 ĐỊA CHỈ HỒ CHÍ MINH
// ==========================================

console.log("Đang tạo địa chỉ Hồ Chí Minh...");

const hcmAddresses = generateUniqueData(TOTAL_HCM_ADDRESSES, createHcmAddress);

fs.writeFileSync(
  path.join(ADDRESSES_DIR, "ho-chi-minh.txt"),
  hcmAddresses.join("\n"),
  "utf8",
);

console.log(`✓ ho-chi-minh.txt → ${hcmAddresses.length} địa chỉ`);

// ==========================================
// TẠO 1000 ĐỊA CHỈ HÀ NỘI
// ==========================================

console.log("Đang tạo địa chỉ Hà Nội...");

const hanoiAddresses = generateUniqueData(
  TOTAL_HANOI_ADDRESSES,
  createHanoiAddress,
);

fs.writeFileSync(
  path.join(ADDRESSES_DIR, "ha-noi.txt"),
  hanoiAddresses.join("\n"),
  "utf8",
);

console.log(`✓ ha-noi.txt → ${hanoiAddresses.length} địa chỉ`);

// ==========================================
// TẠO 4000 ĐỊA CHỈ TỈNH / THÀNH KHÁC
// ==========================================

console.log("Đang tạo địa chỉ các tỉnh/thành khác...");

const otherAddresses = generateUniqueData(
  TOTAL_OTHER_ADDRESSES,
  createOtherAddress,
);

fs.writeFileSync(
  path.join(ADDRESSES_DIR, "other-provinces.txt"),
  otherAddresses.join("\n"),
  "utf8",
);

console.log(`✓ other-provinces.txt → ${otherAddresses.length} địa chỉ`);

// ==========================================
// TẠO FILE 34 TỈNH / THÀNH
// ==========================================

fs.writeFileSync(
  path.join(OUTPUT_DIR, "provinces-34.txt"),
  PROVINCES_34.join("\n"),
  "utf8",
);

console.log(`✓ provinces-34.txt → ${PROVINCES_34.length} tỉnh/thành`);

// ==========================================
// NGHỀ NGHIỆP
// ==========================================

const OCCUPATIONS = [
  "Kỹ sư phần mềm",
  "Lập trình viên",
  "Kỹ sư xây dựng",
  "Kiến trúc sư",
  "Kế toán",
  "Kiểm toán viên",
  "Nhân viên ngân hàng",
  "Chuyên viên tài chính",
  "Nhân viên kinh doanh",
  "Nhân viên marketing",
  "Chuyên viên truyền thông",
  "Thiết kế đồ họa",
  "Nhà thiết kế thời trang",
  "Nhiếp ảnh gia",
  "Biên tập viên",
  "Nhà báo",
  "Giáo viên",
  "Giảng viên",
  "Bác sĩ",
  "Dược sĩ",
  "Điều dưỡng",
  "Kỹ thuật viên y tế",
  "Luật sư",
  "Chuyên viên pháp lý",
  "Nhân viên hành chính",
  "Nhân sự",
  "Quản lý dự án",
  "Quản lý doanh nghiệp",
  "Chuyên viên tuyển dụng",
  "Nhân viên chăm sóc khách hàng",
  "Nhân viên bán hàng",
  "Quản lý cửa hàng",
  "Đầu bếp",
  "Nhân viên nhà hàng",
  "Nhân viên khách sạn",
  "Hướng dẫn viên du lịch",
  "Tài xế",
  "Kỹ thuật viên ô tô",
  "Thợ điện",
  "Thợ cơ khí",
  "Thợ mộc",
  "Thợ xây",
  "Nhân viên logistics",
  "Nhân viên kho",
  "Nhân viên xuất nhập khẩu",
  "Chuyên viên dữ liệu",
  "Nhà phân tích dữ liệu",
  "Quản trị hệ thống",
  "Chuyên viên an ninh mạng",
  "Nhân viên thương mại điện tử",
  "Nhà kinh doanh tự do",
  "Chủ doanh nghiệp",
  "Nhân viên bảo hiểm",
  "Môi giới bất động sản",
  "Nhân viên môi giới chứng khoán",
  "Nhân viên sản xuất",
  "Công nhân kỹ thuật",
  "Nhân viên nghiên cứu",
  "Nhà khoa học",
  "Sinh viên",
  "Freelancer",
  "Nội trợ",
  "Nghệ sĩ",
  "Nhạc sĩ",
  "Ca sĩ",
  "Diễn viên",
  "Huấn luyện viên",
  "Vận động viên",
  "Nhân viên văn phòng",
  "Chuyên viên tư vấn",
  "Chuyên viên bảo hiểm",
  "Chuyên viên du lịch",
  "Nhân viên dịch vụ",
  "Nhân viên kỹ thuật",
  "Quản lý sản xuất",
  "Quản lý bán hàng",
  "Chuyên viên SEO",
  "Chuyên viên quảng cáo",
  "Chuyên viên thương hiệu",
  "Chuyên viên tuyển dụng",
  "Nhân viên vận hành",
  "Chuyên viên kiểm soát chất lượng",
  "Nhân viên phòng thí nghiệm",
  "Nhân viên thư viện",
  "Thủ thư",
  "Nhân viên bưu chính",
  "Nhân viên giao hàng",
  "Nhân viên bảo vệ",
  "Nhân viên vệ sinh",
  "Thợ sửa chữa",
  "Thợ hàn",
  "Thợ sơn",
  "Thợ cắt tóc",
  "Chuyên viên trang điểm",
  "Nhân viên spa",
  "Chuyên viên chăm sóc sắc đẹp",
  "Nhân viên bán lẻ",
  "Chủ cửa hàng",
  "Chủ hộ kinh doanh",
];

// ==========================================
// GHI FILE NGHỀ NGHIỆP
// ==========================================

fs.writeFileSync(
  path.join(OUTPUT_DIR, "occupations.txt"),
  OCCUPATIONS.join("\n"),
  "utf8",
);

console.log(`✓ occupations.txt → ${OCCUPATIONS.length} nghề nghiệp`);

// ==========================================
// HOÀN TẤT
// ==========================================

console.log("");

console.log("==============================");
console.log("ĐÃ TẠO XONG DỮ LIỆU TEST");
console.log("==============================");

console.log(`Tên nam              : ${maleNames.length}`);

console.log(`Tên nữ               : ${femaleNames.length}`);

console.log(`Số điện thoại        : ${phones.length}`);

console.log(`Địa chỉ Hồ Chí Minh  : ${hcmAddresses.length}`);

console.log(`Địa chỉ Hà Nội       : ${hanoiAddresses.length}`);

console.log(`Địa chỉ tỉnh khác    : ${otherAddresses.length}`);

console.log(`Tỉnh / thành         : ${PROVINCES_34.length}`);

console.log(`Nghề nghiệp          : ${OCCUPATIONS.length}`);

console.log("==============================");

console.log("");
console.log("Cấu trúc thư mục:");
console.log("");

console.log(`
data/
├── names/
│   ├── male-names.txt
│   └── female-names.txt
│
├── addresses/
│   ├── ho-chi-minh.txt
│   ├── ha-noi.txt
│   └── other-provinces.txt
│
├── phone-numbers.txt
├── provinces-34.txt
└── occupations.txt
`);

console.log(`Dữ liệu được lưu tại: ${OUTPUT_DIR}`);
