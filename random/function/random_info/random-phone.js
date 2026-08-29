export function random_phone() {
  const prefixes = [
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
    "086",
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

  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

  const number = Math.floor(1000000 + Math.random() * 9000000);

  return `${prefix}${number}`;
}
