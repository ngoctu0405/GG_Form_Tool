import { random_address } from "./random-address.js";

export function random_id() {
  const address = random_address();

  const provinceCodes = {
    "Hà Nội": "001",
    "Hà Giang": "002",
    "Cao Bằng": "004",
    "Bắc Kạn": "006",
    "Tuyên Quang": "008",
    "Lào Cai": "010",
    "Điện Biên": "011",
    "Lai Châu": "012",
    "Sơn La": "014",
    "Yên Bái": "015",
    "Hòa Bình": "017",
    "Thái Nguyên": "019",
    "Lạng Sơn": "020",
    "Quảng Ninh": "022",
    "Bắc Giang": "024",
    "Phú Thọ": "025",
    "Vĩnh Phúc": "026",
    "Bắc Ninh": "027",
    "Hải Dương": "030",
    "Hải Phòng": "031",
    "Hưng Yên": "033",
    "Thái Bình": "034",
    "Hà Nam": "035",
    "Nam Định": "036",
    "Ninh Bình": "037",
    "Thanh Hóa": "038",
    "Nghệ An": "040",
    "Hà Tĩnh": "042",
    "Quảng Bình": "044",
    "Quảng Trị": "045",
    "Thừa Thiên Huế": "046",
    "Đà Nẵng": "048",
    "Quảng Nam": "049",
    "Quảng Ngãi": "051",
    "Bình Định": "052",
    "Phú Yên": "054",
    "Khánh Hòa": "056",
    "Ninh Thuận": "058",
    "Bình Thuận": "060",
    "Kon Tum": "062",
    "Gia Lai": "064",
    "Đắk Lắk": "066",
    "Đắk Nông": "067",
    "Lâm Đồng": "068",
    "Bình Phước": "070",
    "Tây Ninh": "072",
    "Bình Dương": "074",
    "Đồng Nai": "075",
    "Bà Rịa - Vũng Tàu": "077",
    "Hồ Chí Minh": "079",
    "Long An": "080",
    "Tiền Giang": "082",
    "Bến Tre": "083",
    "Trà Vinh": "084",
    "Vĩnh Long": "086",
    "Đồng Tháp": "087",
    "An Giang": "089",
    "Kiên Giang": "091",
    "Cần Thơ": "092",
    "Hậu Giang": "093",
    "Sóc Trăng": "094",
    "Bạc Liêu": "095",
    "Cà Mau": "096",
  };

  const province = Object.keys(provinceCodes).find((name) =>
    address.includes(name),
  );

  if (!province) {
    throw new Error("Không xác định được tỉnh từ địa chỉ");
  }

  const code = provinceCodes[province];

  const number = Math.floor(100000000 + Math.random() * 900000000);

  return `${code}${number}`;
}
