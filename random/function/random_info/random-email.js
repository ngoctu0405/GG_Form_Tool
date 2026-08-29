export function random_email(name) {
  if (!name) {
    throw new Error("random_email(name): name is required");
  }

  // Tách tên thành từng chữ
  const parts = name.trim().split(/\s+/);

  // Lấy 2 chữ cuối: tên đệm + tên
  const lastTwo = parts.slice(-2).join("");

  // Bỏ dấu tiếng Việt + chuyển lowercase
  const cleanName = lastTwo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

  // Random 4 số
  const number = Math.floor(1000 + Math.random() * 9000);

  return `${cleanName}${number}@gmail.com`;
}
