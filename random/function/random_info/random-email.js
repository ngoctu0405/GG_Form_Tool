export function random_email(name) {
  if (!name) {
    throw new Error("random_email(name): name is required");
  }

  const parts = name.trim().split(/\s+/);
  const lastTwo = parts.slice(-2).join("");

  const cleanName = lastTwo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

  const number = Math.floor(1000 + Math.random() * 9000);

  return `${cleanName}${number}@gmail.com`;
}
