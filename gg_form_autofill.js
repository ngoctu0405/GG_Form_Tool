import "dotenv/config";

import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import {
  random_name,
  random_phone,
  random_address,
  random_gender,
  random_email,
  random_id,
  random_life_profile,
} from "./random/random.js";

// ============================================================
// CONFIG
// ============================================================

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "qwen/qwen3.6-27b";

if (!GROQ_API_KEY) {
  console.warn(
    "⚠ Không tìm thấy GROQ_API_KEY; câu tự luận dùng Groq sẽ báo lỗi.",
  );
}

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(ROOT_DIR, "web", "config.json");

const DEFAULT_CONFIG = {
  FORM_URL: "https://forms.gle/GygZdtryXgfkMwJ26",
  TOTAL_SUBMISSIONS: 20,
  DELAY_BETWEEN_SUBMISSIONS: 1200,
  HEADLESS: false,

  QUESTION_TYPE_WEIGHTS: {
    multipleChoice: { 1: 15, 2: 15, 3: 20, 4: 25, 5: 25 },
    dropdown: { 1: 15, 2: 15, 3: 20, 4: 25, 5: 25 },
    linearScale: { 1: 15, 2: 15, 3: 20, 4: 25, 5: 25 },
    rating: { 1: 15, 2: 15, 3: 20, 4: 25, 5: 25 },
    multipleChoiceGrid: { 1: 15, 2: 15, 3: 20, 4: 25, 5: 25 },
  },
};

function loadConfig() {
  try {
    return {
      ...DEFAULT_CONFIG,
      ...JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8")),
    };
  } catch (error) {
    console.warn(
      `Không đọc được web/config.json, dùng cấu hình mặc định: ${error.message}`,
    );
    return DEFAULT_CONFIG;
  }
}

async function askAI(question, { multiline = false, person = null } = {}) {
  if (!GROQ_API_KEY) throw new Error("Chưa cấu hình GROQ_API_KEY");

  const profileContext = person
    ? [
        `tuổi ${person.age}`,
        person.status,
        person.grade,
        person.educationLevel,
        person.school,
        person.studentYear,
        person.major,
        person.occupation,
      ]
        .filter(Boolean)
        .join(", ")
    : "";

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: "system",
            content: multiline
              ? "Bạn đang trả lời một Google Form bằng tiếng Việt. Hãy trả lời tự nhiên ở ngôi thứ nhất, đúng trọng tâm trong 2-4 câu. Không nhắc đến AI, không giải thích và chỉ trả về nội dung câu trả lời."
              : "Bạn đang trả lời nhanh một câu hỏi trong Google Form bằng tiếng Việt. Hãy trả lời tự nhiên ở ngôi thứ nhất bằng một cụm từ hoặc một câu ngắn. Không nhắc đến AI, không giải thích và chỉ trả về nội dung câu trả lời.",
          },
          {
            role: "user",
            content: profileContext
              ? `Hồ sơ người trả lời: ${profileContext}.\nCâu hỏi: ${question}`
              : question,
          },
        ],
        temperature: 0.75,
        max_tokens: multiline ? 180 : 60,
        reasoning_effort: "none",
        include_reasoning: false,
      }),
      signal: AbortSignal.timeout(15000),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API lỗi ${response.status}: ${error}`);
  }

  const data = await response.json();

  return data.choices[0].message.content.trim();
}

const CONFIG = loadConfig();
const FORM_URL = CONFIG.FORM_URL;

// ============================================================
// SỐ LẦN MUỐN ĐIỀN + GỬI
// ============================================================
//
// 1  = 1 lần
// 5  = 5 lần
// 10 = 10 lần
//
const TOTAL_SUBMISSIONS = CONFIG.TOTAL_SUBMISSIONS;

// false = nhìn Chrome chạy
// true = chạy ẩn
const HEADLESS = CONFIG.HEADLESS;

// Delay giữa từng thao tác
const STEP_DELAY = 200;

// Delay giữa 2 lượt submit
const DELAY_BETWEEN_SUBMISSIONS = CONFIG.DELAY_BETWEEN_SUBMISSIONS;

// ============================================================
// TỶ LỆ 1 -> 5
// ============================================================
//
// 1 = 15%
// 2 = 15%
// 3 = 20%
// 4 = 25%
// 5 = 25%
//
// 3 -> 5 = 70%
//

const LEGACY_WEIGHTS =
  CONFIG.RATING_WEIGHTS || DEFAULT_CONFIG.QUESTION_TYPE_WEIGHTS.linearScale;
const QUESTION_TYPE_WEIGHTS = Object.fromEntries(
  Object.keys(DEFAULT_CONFIG.QUESTION_TYPE_WEIGHTS).map((type) => [
    type,
    CONFIG.QUESTION_TYPE_WEIGHTS?.[type] || LEGACY_WEIGHTS,
  ]),
);

// ============================================================
// LINK
// ============================================================

const LINK_DATA = [
  "https://drive.google.com/",
  "https://photos.google.com/",
  "https://www.google.com/",
  "https://www.youtube.com/",
  "https://www.instagram.com/",
];

// ============================================================
// RANDOM HELPERS
// ============================================================

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function weightedRandom(weights) {
  const entries = Object.entries(weights);

  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);

  let random = Math.random() * total;

  for (const [value, weight] of entries) {
    random -= weight;

    if (random <= 0) {
      return Number(value);
    }
  }

  return Number(entries[entries.length - 1][0]);
}

function weightsFor(type) {
  return QUESTION_TYPE_WEIGHTS[type] || QUESTION_TYPE_WEIGHTS.multipleChoice;
}

function randomRating(type = "linearScale") {
  return weightedRandom(weightsFor(type));
}

// ============================================================
// TÍNH ĐỘ TÍCH CỰC CỦA ĐÁP ÁN
// ============================================================

function getChoiceWeight(text, index, count, type = "multipleChoice") {
  const t = String(text).trim().toLowerCase();

  // Nếu option là số 1 -> 5
  if (/^[1-5]$/.test(t)) {
    return weightsFor(type)[Number(t)] ?? 1;
  }

  // ========================================
  // NEGATIVE
  // ========================================

  const negative = [
    "không muốn",
    "không còn",
    "không có cảm xúc",
    "không có gì",
    "không còn gì",
    "không muốn gì",
    "từ chối",
    "quên nhau",
    "hết sạch",
    "rất thấp",
    "rất tệ",
    "không tốt",
    "không thích",
  ];

  if (negative.some((word) => t.includes(word))) {
    return weightsFor(type)[1];
  }

  // ========================================
  // RẤT TÍCH CỰC
  // ========================================

  const veryPositive = [
    "rất muốn",
    "rất cao",
    "rất nhiều",
    "rất tốt",
    "đồng ý ngay",
    "100%",
    "quay lại với nhau",
    "cho nhau cơ hội",
    "chờ mình rủ",
    "chờ tin nhắn",
    "vui hẳn",
    "tim đập",
    "hình như vẫn còn",
    "cả hai",
    "thường xuyên",
    "rất thích",
    "rất nhớ",
  ];

  if (veryPositive.some((word) => t.includes(word))) {
    return weightsFor(type)[5];
  }

  // ========================================
  // TÍCH CỰC
  // ========================================

  const positive = [
    "khá muốn",
    "khá cao",
    "khá nhiều",
    "tốt",
    "đồng ý",
    "có ❤️",
    "muốn nói chuyện",
    "muốn gặp",
    "nói chuyện lại",
    "tìm hiểu lại",
    "hiện tại",
    "75%",
    "hơi nhớ",
    "hơi rung động",
    "vui",
    "hạnh phúc",
  ];

  if (positive.some((word) => t.includes(word))) {
    return weightsFor(type)[4];
  }

  // ========================================
  // TRUNG BÌNH
  // ========================================

  const neutral = [
    "50/50",
    "bình thường",
    "có thể",
    "không chắc",
    "xem xét",
    "một chút",
    "thỉnh thoảng",
    "đôi khi",
  ];

  if (neutral.some((word) => t.includes(word))) {
    return weightsFor(type)[3];
  }

  // ========================================
  // TỪ NGẮN
  // ========================================

  if (t === "có") {
    return weightsFor(type)[4];
  }

  if (t === "muốn") {
    return weightsFor(type)[4];
  }

  if (t === "không") {
    return weightsFor(type)[1];
  }

  // Không nhận diện được nội dung thì ánh xạ vị trí đáp án vào thang 1–5.
  const level = Math.round((index / Math.max(count - 1, 1)) * 4) + 1;
  return weightsFor(type)[level];
}

// ============================================================
// CHỌN THEO WEIGHT
// ============================================================

function weightedChoiceIndex(texts, type = "multipleChoice") {
  const weights = texts.map((text, index) =>
    getChoiceWeight(text, index, texts.length, type),
  );

  const total = weights.reduce((a, b) => a + b, 0);

  let value = Math.random() * total;

  for (let i = 0; i < weights.length; i++) {
    value -= weights[i];

    if (value <= 0) {
      return i;
    }
  }

  return texts.length - 1;
}

function weightedSampleIndexes(texts, amount, type = "multipleChoice") {
  const available = texts.map((text, index) => ({
    text,
    index,
  }));

  const result = [];

  while (result.length < amount && available.length) {
    const currentTexts = available.map((item) => item.text);

    const position = weightedChoiceIndex(currentTexts, type);

    result.push(available[position].index);

    available.splice(position, 1);
  }

  return result;
}

// ============================================================
// DATE
// ============================================================

function randomDateParts() {
  const start = new Date(2019, 0, 1).getTime();

  const end = Date.now();

  const date = new Date(start + Math.random() * (end - start));

  const day = String(date.getDate()).padStart(2, "0");

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const year = String(date.getFullYear());

  return {
    day,
    month,
    year,
    iso: `${year}-${month}-${day}`,
  };
}

// ============================================================
// TIME
// ============================================================

function randomTimeParts() {
  const hour = randomInt(0, 23);

  const minute = pick([
    "00",
    "05",
    "10",
    "15",
    "20",
    "25",
    "30",
    "35",
    "40",
    "45",
    "50",
    "55",
  ]);

  const h = String(hour).padStart(2, "0");

  return {
    hour: h,
    minute,
    value: `${h}:${minute}`,
  };
}

// ============================================================
// RANDOM PERSON
// ============================================================

function generatePerson() {
  const gender = random_gender();

  const name = random_name(gender);

  const age = randomInt(6, 45);

  const address = random_address();

  const lifeProfile = random_life_profile(age, address);

  return {
    gender,

    name,

    age,

    birthYear: String(new Date().getFullYear() - age),

    phone: random_phone(),

    address,

    email: random_email(name),

    id: random_id(address),

    ...lifeProfile,
  };
}

// ============================================================
// GET QUESTION
// ============================================================

async function getQuestionByTitle(page, title) {
  const question = page
    .locator('[role="listitem"]')
    .filter({
      hasText: title,
    })
    .first();

  await question.waitFor({
    state: "visible",
    timeout: 10000,
  });

  return question;
}

// ============================================================
// TEXT
// ============================================================

async function fillTextQuestion(page, title, value) {
  const question = await getQuestionByTitle(page, title);

  const input = question
    .locator(
      'input[type="text"], input[type="email"], input[type="url"], textarea',
    )
    .first();

  if (!(await input.count())) {
    console.log(`⚠ Không tìm thấy input: ${title}`);

    return;
  }

  await input.scrollIntoViewIfNeeded();

  await input.fill(String(value));

  console.log(`✓ ${title} => ${value}`);

  await page.waitForTimeout(STEP_DELAY);
}

// ============================================================
// RADIO
// ============================================================

async function chooseRandomRadio(page, title) {
  const question = await getQuestionByTitle(page, title);

  const options = question.locator('[role="radio"]:visible');

  const count = await options.count();

  if (!count) {
    console.log(`⚠ Không tìm thấy radio: ${title}`);

    return;
  }

  const texts = await options.allTextContents();

  const index = weightedChoiceIndex(texts);

  console.log(`✓ ${title} => ${texts[index]}`);

  await options.nth(index).click();

  await page.waitForTimeout(STEP_DELAY);
}

// ============================================================
// CHECKBOX
// ============================================================

async function chooseRandomCheckboxes(page, title) {
  const question = await getQuestionByTitle(page, title);

  const options = question.locator('[role="checkbox"]:visible');

  const count = await options.count();

  if (!count) {
    return;
  }

  const texts = await options.allTextContents();

  // 20% chọn 1
  // 60% chọn 2
  // 20% chọn 3

  const roll = Math.random();

  let amount;

  if (roll < 0.2) {
    amount = 1;
  } else if (roll < 0.8) {
    amount = 2;
  } else {
    amount = 3;
  }

  amount = Math.min(amount, count);

  const indexes = weightedSampleIndexes(texts, amount);

  for (const index of indexes) {
    console.log(`   ✓ ${texts[index]}`);

    await options.nth(index).click();

    await page.waitForTimeout(80);
  }

  await page.waitForTimeout(STEP_DELAY);
}

// ============================================================
// DROPDOWN
// ============================================================

async function chooseRandomDropdown(page, title) {
  const question = await getQuestionByTitle(page, title);

  const dropdown = question.locator('[role="listbox"]').first();

  await dropdown.scrollIntoViewIfNeeded();

  await dropdown.click();

  await page.waitForTimeout(300);

  const options = question.locator('[role="option"]');

  const count = await options.count();

  if (!count) {
    throw new Error(`Không thấy dropdown options: ${title}`);
  }

  const allTexts = await options.allTextContents();

  const valid = [];

  for (let i = 0; i < allTexts.length; i++) {
    const text = allTexts[i].trim();

    if (text && !/^chọn$/i.test(text)) {
      valid.push({
        text,
        originalIndex: i,
      });
    }
  }

  const texts = valid.map((x) => x.text);

  const selectedIndex = weightedChoiceIndex(texts);

  const selected = valid[selectedIndex];

  console.log(`✓ ${title} => ${selected.text}`);

  // Focus đang ở dropdown.
  // Đi xuống tới option cần chọn.

  const steps = selectedIndex + 1;

  for (let i = 0; i < steps; i++) {
    await page.keyboard.press("ArrowDown");

    await page.waitForTimeout(60);
  }

  await page.keyboard.press("Enter");

  await page.waitForTimeout(300);
}

// ============================================================
// SCALE / RATING
// ============================================================

async function chooseWeightedScale(page, title) {
  const question = await getQuestionByTitle(page, title);

  const options = question.locator('[role="radio"]:visible');

  const count = await options.count();

  if (!count) {
    return;
  }

  let rating = randomRating();

  rating = Math.min(rating, count);

  console.log(`✓ ${title} => ${rating}`);

  await options.nth(rating - 1).click();

  await page.waitForTimeout(STEP_DELAY);
}

// ============================================================
// RADIO GRID
// ============================================================

async function fillRadioGrid(page, title) {
  const question = await getQuestionByTitle(page, title);

  const rows = question.locator('[role="radiogroup"]');

  const rowCount = await rows.count();

  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);

    const options = row.locator('[role="radio"]:visible');

    const count = await options.count();

    if (!count) {
      continue;
    }

    // Grid 5 cột dùng
    // đúng tỷ lệ 15/15/20/25/25

    if (count === 5) {
      const rating = randomRating();

      await options.nth(rating - 1).click();
    } else {
      const texts = await options.allTextContents();

      const index = weightedChoiceIndex(texts);

      await options.nth(index).click();
    }

    await page.waitForTimeout(80);
  }

  console.log(`✓ Grid: ${title}`);
}

// ============================================================
// CHECKBOX GRID
// ============================================================

async function fillCheckboxGrid(page, title) {
  const question = await getQuestionByTitle(page, title);

  const groups = question.locator('[role="group"]');

  const groupCount = await groups.count();

  for (let i = 0; i < groupCount; i++) {
    const group = groups.nth(i);

    const options = group.locator('[role="checkbox"]:visible');

    const count = await options.count();

    if (!count) {
      continue;
    }

    const texts = await options.allTextContents();

    const amount = Math.random() < 0.85 ? 1 : Math.min(2, count);

    const indexes = weightedSampleIndexes(texts, amount);

    for (const index of indexes) {
      await options.nth(index).click();

      await page.waitForTimeout(70);
    }
  }

  console.log(`✓ Checkbox Grid: ${title}`);
}

// ============================================================
// DATE
// ============================================================

async function fillDateQuestion(page, title, date = randomDateParts()) {
  const question = await getQuestionByTitle(page, title);

  const native = question.locator('input[type="date"]').first();

  if (await native.count()) {
    await native.fill(date.iso);

    console.log(`✓ ${title} => ${date.iso}`);

    return;
  }

  const inputs = question.locator("input:visible");

  const count = await inputs.count();

  let found = false;

  for (let i = 0; i < count; i++) {
    const input = inputs.nth(i);

    const aria = (await input.getAttribute("aria-label")) ?? "";

    const placeholder = (await input.getAttribute("placeholder")) ?? "";

    const label = `${aria} ${placeholder}`.toLowerCase();

    if (/day|ngày/.test(label)) {
      await input.fill(date.day);

      found = true;
    } else if (/month|tháng/.test(label)) {
      await input.fill(date.month);

      found = true;
    } else if (/year|năm/.test(label)) {
      await input.fill(date.year);

      found = true;
    }
  }

  if (!found && count >= 3) {
    await inputs.nth(0).fill(date.day);

    await inputs.nth(1).fill(date.month);

    await inputs.nth(2).fill(date.year);
  }

  console.log(`✓ ${title} => ${date.iso}`);
}

// ============================================================
// TIME
// ============================================================

async function fillTimeQuestion(page, title, time = randomTimeParts()) {
  const question = await getQuestionByTitle(page, title);

  const native = question.locator('input[type="time"]').first();

  if (await native.count()) {
    await native.fill(time.value);

    console.log(`✓ ${title} => ${time.value}`);

    return;
  }

  const inputs = question.locator("input:visible");

  const count = await inputs.count();

  let hourFound = false;
  let minuteFound = false;

  for (let i = 0; i < count; i++) {
    const input = inputs.nth(i);

    const aria = (await input.getAttribute("aria-label")) ?? "";

    const placeholder = (await input.getAttribute("placeholder")) ?? "";

    const label = `${aria} ${placeholder}`.toLowerCase();

    if (/hour|giờ/.test(label)) {
      await input.fill(time.hour);

      hourFound = true;
    } else if (/minute|phút/.test(label)) {
      await input.fill(time.minute);

      minuteFound = true;
    }
  }

  if (count >= 2 && !hourFound && !minuteFound) {
    await inputs.nth(0).fill(time.hour);

    await inputs.nth(1).fill(time.minute);
  }

  console.log(`✓ ${title} => ${time.value}`);
}

// ============================================================
// NEXT
// ============================================================

async function nextPage(page) {
  const nextButton = page
    .getByRole("button", {
      name: /tiếp|next/i,
    })
    .first();

  await nextButton.waitFor({
    state: "visible",
    timeout: 10000,
  });

  await nextButton.scrollIntoViewIfNeeded();

  await nextButton.click();

  await page.waitForTimeout(600);
}

// ============================================================
// SUBMIT
// ============================================================
async function submit(page) {
  console.log("\n🚀 ĐANG SUBMIT FORM...");

  await page.waitForTimeout(500);

  let clicked = false;

  // ============================================================
  // CÁCH 1: TÌM CHỮ "Gửi" TRỰC TIẾP
  // ============================================================

  const textCandidates = [
    page.getByText("Gửi", { exact: true }),
    page.locator('text="Gửi"'),
    page.locator("span").filter({ hasText: /^Gửi$/ }),
    page.locator("div").filter({ hasText: /^Gửi$/ }),
    page.locator('//*[normalize-space(text())="Gửi"]'),
  ];

  for (const locator of textCandidates) {
    try {
      const count = await locator.count();

      for (let i = count - 1; i >= 0; i--) {
        const element = locator.nth(i);

        if (!(await element.isVisible().catch(() => false))) {
          continue;
        }

        console.log("   → Tìm thấy chữ Gửi");

        await element.scrollIntoViewIfNeeded().catch(() => {});

        await page.waitForTimeout(200);

        // Nếu text nằm trong span thì tìm button cha
        const parentButton = element.locator(
          'xpath=ancestor-or-self::*[@role="button" or self::button][1]',
        );

        if (await parentButton.count()) {
          try {
            await parentButton.click({
              force: true,
              timeout: 3000,
            });

            clicked = true;
            break;
          } catch {}
        }

        // click thẳng text
        try {
          await element.click({
            force: true,
            timeout: 3000,
          });

          clicked = true;
          break;
        } catch {}
      }

      if (clicked) {
        break;
      }
    } catch {}
  }

  // ============================================================
  // CÁCH 2: TÌM ELEMENT BẰNG JAVASCRIPT
  // ============================================================

  if (!clicked) {
    console.log("   ⚠ Cách 1 không được, thử DOM click...");

    clicked = await page.evaluate(() => {
      function normalizeText(text) {
        return String(text || "")
          .normalize("NFC")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();
      }

      const elements = [
        ...document.querySelectorAll("span, div, button, [role='button']"),
      ];

      const textElement = elements.find((el) => {
        const text = normalizeText(el.innerText || el.textContent);

        return text === "gửi" || text === "submit";
      });

      if (!textElement) {
        return false;
      }

      const button =
        textElement.closest('[role="button"]') ||
        textElement.closest("button") ||
        textElement;

      button.scrollIntoView({
        block: "center",
        inline: "center",
      });

      button.click();

      return true;
    });
  }

  // ============================================================
  // CÁCH 3: TAB TỚI NÚT GỬI + ENTER
  // ============================================================

  if (!clicked) {
    console.log("   ⚠ DOM vẫn không được, thử TAB → ENTER...");

    // click vùng trống để reset focus
    await page
      .locator("body")
      .click({
        position: {
          x: 20,
          y: 20,
        },
      })
      .catch(() => {});

    for (let i = 0; i < 30; i++) {
      await page.keyboard.press("Tab");

      await page.waitForTimeout(80);

      const active = await page.evaluate(() => {
        const el = document.activeElement;

        if (!el) {
          return "";
        }

        return (
          el.innerText ||
          el.textContent ||
          el.getAttribute("aria-label") ||
          ""
        )
          .normalize("NFC")
          .replace(/\s+/g, " ")
          .trim();
      });

      console.log(`      TAB ${i + 1}: ${active}`);

      if (/^gửi$/i.test(active) || /^submit$/i.test(active)) {
        console.log("   → Focus đã tới nút Gửi");

        await page.keyboard.press("Enter");

        clicked = true;

        break;
      }
    }
  }

  // ============================================================
  // CÁCH 4: TÌM BOUNDING BOX RỒI MOUSE CLICK
  // ============================================================

  if (!clicked) {
    console.log("   ⚠ Thử click tọa độ nút Gửi...");

    const result = await page.evaluate(() => {
      const els = [...document.querySelectorAll("*")];

      for (const el of els) {
        const text = String(el.innerText || "")
          .normalize("NFC")
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();

        if (text !== "gửi") {
          continue;
        }

        const button =
          el.closest('[role="button"]') || el.closest("button") || el;

        const rect = button.getBoundingClientRect();

        if (rect.width > 0 && rect.height > 0) {
          return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
          };
        }
      }

      return null;
    });

    if (result) {
      await page.mouse.click(result.x, result.y);

      clicked = true;
    }
  }

  // ============================================================
  // KHÔNG CLICK ĐƯỢC
  // ============================================================

  if (!clicked) {
    throw new Error("❌ Vẫn không click được nút Gửi");
  }

  console.log("   ✓ Đã click Gửi");

  // ============================================================
  // CHỜ GOOGLE FORMS XỬ LÝ
  // ============================================================

  await page.waitForTimeout(2000);

  const bodyText = await page
    .locator("body")
    .innerText()
    .catch(() => "");

  // Nếu còn câu bắt buộc
  if (/đây là câu hỏi bắt buộc|required question/i.test(bodyText)) {
    throw new Error("❌ Còn câu bắt buộc chưa được điền");
  }

  if (
    /câu trả lời của bạn đã được ghi lại|your response has been recorded|gửi phản hồi khác|submit another response/i.test(
      bodyText,
    )
  ) {
    console.log("   ✓ Google Forms xác nhận đã nhận câu trả lời");
  } else {
    console.log("   ⚠ Đã click Gửi nhưng không thấy dòng xác nhận");
  }

  console.log("✅ SUBMIT XONG");
}

// ============================================================
// TỰ ĐỌC VÀ ĐIỀN MỌI PHẦN CỦA FORM
// ============================================================

function plainText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d");
}

async function answerForText(
  title,
  person,
  multiline = false,
  inputType = "text",
) {
  const text = plainText(title);

  if (inputType === "email" || /e-?mail/.test(text)) return person.email;
  if (inputType === "url" || /\b(link|url|website|trang web)\b/.test(text))
    return pick(LINK_DATA);
  if (
    /\b(ho va ten|ho ten|ten cua ban|your name|full name)\b/.test(text) ||
    text === "ten"
  )
    return person.name;
  if (/\b(so dien thoai|dien thoai|phone|mobile)\b/.test(text))
    return person.phone;
  if (/\b(dia chi|address)\b/.test(text)) return person.address;
  if (/\b(nam sinh|birth year)\b/.test(text)) return person.birthYear;
  if (/\b(tuoi|age)\b/.test(text))
    return String(new Date().getFullYear() - Number(person.birthYear));
  if (/\b(cccd|cmnd|can cuoc|identity|id number)\b/.test(text))
    return person.id;
  if (/\b(gioi tinh|gender|sex)\b/.test(text)) return person.gender;
  if (/\b(lop may|dang hoc lop|hoc lop|khoi lop|grade)\b/.test(text) && person.grade)
    return person.grade;
  if (/\b(cap may|cap hoc|bac hoc|education level)\b/.test(text) && person.educationLevel)
    return person.educationLevel;
  if (
    /\b(sinh vien nam may|nam thu may|nam may|student year)\b/.test(text) &&
    person.studentYear
  )
    return person.studentYear;
  if (/\b(nganh hoc|chuyen nganh|major)\b/.test(text) && person.major)
    return person.major;
  if (/\b(nghe nghiep|cong viec|viec lam|occupation|job)\b/.test(text))
    return person.occupation;
  if (
    /\b(hien dang la|hien la|dang la|hoc hay di lam|tinh trang hien tai|doi tuong|vai tro|status)\b/.test(
      text,
    )
  )
    return person.status;
  if (
    /\b(truong dai hoc|dai hoc nao|hoc dai hoc|ten dai hoc|university|college)\b/.test(
      text,
    ) ||
    /\b(hoc|theo hoc) (tai )?truong( nao)?\b/.test(text) ||
    /\btruong (ban |anh |chi |em )?(dang |tung )?(theo )?hoc\b/.test(text)
  )
    if (person.school) return person.school;
  if (/\b(ma so|code|number|so luong)\b/.test(text) || inputType === "number")
    return String(randomInt(1, 100));

  try {
    console.log(`   ↳ Đang hỏi Groq: ${title}`);
    return await askAI(title, { multiline, person });
  } catch (error) {
    throw new Error(`Groq không trả lời được câu "${title}": ${error.message}`);
  }
}

function findProfileChoiceIndex(texts, aliases) {
  const normalizedTexts = texts.map(plainText);
  const normalizedAliases = aliases.filter(Boolean).map(plainText);
  let index = normalizedTexts.findIndex((option) =>
    normalizedAliases.some((alias) => option === alias),
  );
  if (index >= 0) return index;
  index = normalizedTexts.findIndex((option) =>
    normalizedAliases.some(
      (alias) => option.includes(alias) || alias.includes(option),
    ),
  );
  return index >= 0 ? index : null;
}

function ageRangeChoiceIndex(texts, age) {
  for (let index = 0; index < texts.length; index++) {
    const option = plainText(texts[index]);
    const numbers = option.match(/\d+/g)?.map(Number) || [];
    if (/duoi|nho hon/.test(option) && numbers[0] && age < numbers[0]) return index;
    if (/tren|lon hon/.test(option) && numbers[0] && age > numbers[0]) return index;
    if (numbers.length >= 2 && age >= numbers[0] && age <= numbers[1]) return index;
    if (numbers.length === 1 && age === numbers[0]) return index;
  }
  return null;
}

function profileChoiceIndex(title, texts, person) {
  const text = plainText(title);
  const normalizedOptions = texts.map(plainText);
  const statusOptionCount = normalizedOptions.filter((option) =>
    /^(hoc sinh|sinh vien|dang di lam|nguoi di lam|di lam)$/.test(option),
  ).length;

  if (/\b(gioi tinh|gender|sex)\b/.test(text)) {
    return findProfileChoiceIndex(
      texts,
      person.gender === "male" ? ["Nam", "Male"] : ["Nữ", "Female"],
    );
  }
  if (/\b(tuoi|do tuoi|age)\b/.test(text)) {
    return ageRangeChoiceIndex(texts, person.age);
  }
  if (
    statusOptionCount >= 2 ||
    /\b(hien dang la|hien la|dang la|hoc hay di lam|tinh trang hien tai|doi tuong|vai tro|status)\b/.test(
      text,
    )
  ) {
    const aliases = {
      "Học sinh": ["Học sinh"],
      "Sinh viên": ["Sinh viên"],
      "Đang đi làm": ["Đang đi làm", "Người đi làm", "Đi làm"],
    }[person.status];
    const index = findProfileChoiceIndex(texts, aliases || [person.status]);
    if (index !== null) return index;
  }
  if (/\b(lop may|dang hoc lop|hoc lop|khoi lop|grade)\b/.test(text) && person.grade) {
    return findProfileChoiceIndex(texts, [person.grade, String(person.gradeNumber)]);
  }
  if (/\b(cap may|cap hoc|bac hoc|education level)\b/.test(text) && person.educationLevel) {
    const aliases = {
      "Tiểu học": ["Tiểu học", "Cấp 1"],
      THCS: ["THCS", "Trung học cơ sở", "Cấp 2"],
      THPT: ["THPT", "Trung học phổ thông", "Cấp 3"],
      "Đại học": ["Đại học"],
    }[person.educationLevel];
    return findProfileChoiceIndex(texts, aliases || [person.educationLevel]);
  }
  if (/\b(sinh vien nam may|nam thu may|nam may|student year)\b/.test(text) && person.studentYear) {
    const yearWords = ["nhất", "hai", "ba", "tư", "năm"];
    return findProfileChoiceIndex(texts, [
      person.studentYear,
      `Năm thứ ${person.studentYearNumber}`,
      `Năm ${yearWords[person.studentYearNumber - 1]}`,
    ]);
  }
  if (/\b(nganh hoc|chuyen nganh|major)\b/.test(text) && person.major) {
    return findProfileChoiceIndex(texts, [person.major]);
  }
  if (/\b(nghe nghiep|cong viec|viec lam|occupation|job)\b/.test(text)) {
    return findProfileChoiceIndex(texts, [person.occupation, person.status]);
  }
  if (/\b(truong|dai hoc|university|college)\b/.test(text) && person.school) {
    return findProfileChoiceIndex(texts, [person.school, person.university]);
  }
  return null;
}

async function questionTitle(question, index) {
  const heading = question.locator('[role="heading"]').first();
  const headingText = (await heading.count())
    ? await heading.innerText().catch(() => "")
    : "";
  if (headingText.trim()) return headingText.replace(/\s*\*\s*$/, "").trim();

  const text = await question.innerText().catch(() => "");
  return (
    text
      .split("\n")
      .map((line) => line.trim())
      .find(Boolean) || `Câu ${index + 1}`
  );
}

async function encodedQuestionType(question) {
  const elements = question.locator("[data-params]");
  const count = await elements.count();

  for (let index = 0; index < count; index++) {
    const params =
      (await elements.nth(index).getAttribute("data-params")) || "";
    const match = params.match(/,\s*(0|1|2|3|4|5|7|9|10|18)\s*,\s*\[\[/);
    if (match) return Number(match[1]);
  }

  return null;
}

async function chooseFromRadios(question, title, type, person) {
  const options = question.locator('[role="radio"]:visible');
  const count = await options.count();
  if (!count) return;

  const texts = await options.allTextContents();
  const rating = randomRating(type);
  const scaledIndex = Math.round(((rating - 1) / 4) * Math.max(count - 1, 0));
  const profileIndex =
    type === "multipleChoice" ? profileChoiceIndex(title, texts, person) : null;
  const index =
    profileIndex !== null
      ? profileIndex
      : ["linearScale", "rating"].includes(type)
        ? scaledIndex
        : weightedChoiceIndex(texts, type);

  await options.nth(index).scrollIntoViewIfNeeded();
  await options.nth(index).click();
  console.log(`   ✓ ${title} => ${String(texts[index] || index + 1).trim()}`);
}

async function chooseFromCheckboxes(page, question, title) {
  const options = question.locator('[role="checkbox"]:visible');
  const count = await options.count();
  if (!count) return;

  const texts = await options.allTextContents();
  const amount = Math.min(count, weightedRandom({ 1: 45, 2: 40, 3: 15 }));
  const indexes = weightedSampleIndexes(texts, amount, "multipleChoice");

  for (const index of indexes) {
    await options.nth(index).click();
    await page.waitForTimeout(60);
  }
  console.log(`   ✓ ${title} => chọn ${indexes.length} đáp án`);
}

async function chooseFromDropdown(page, question, title, person) {
  const dropdown = question.locator('[role="listbox"]:visible').first();
  if (!(await dropdown.count())) return;

  // Google Forms có thể giữ menu của dropdown trước nằm đè lên câu tiếp theo.
  // Đóng mọi menu đang mở trước khi tương tác với dropdown hiện tại.
  await page.keyboard.press("Escape").catch(() => {});
  await page.waitForTimeout(100);
  await dropdown.scrollIntoViewIfNeeded();
  await dropdown.click({ force: true });
  await page.waitForTimeout(180);

  const options = page.locator('[role="option"]:visible');
  const texts = (await options.allTextContents()).map((text) => text.trim());
  const valid = texts
    .map((text, index) => ({ text, index }))
    .filter(({ text }) => text && !/^(chọn|choose|select)$/i.test(text));
  if (!valid.length) throw new Error(`Không đọc được đáp án của câu: ${title}`);

  const validTexts = valid.map((item) => item.text);
  const profileIndex = profileChoiceIndex(title, validTexts, person);
  const selectedIndex =
    profileIndex !== null
      ? profileIndex
      : weightedChoiceIndex(validTexts, "dropdown");
  const selected = valid[selectedIndex];

  // Các option của nhiều dropdown vẫn tồn tại trong DOM và có thể che nhau.
  // Dùng bàn phím trên listbox đang focus để luôn chọn đúng dropdown hiện tại.
  for (let step = 0; step <= selectedIndex; step++) {
    await page.keyboard.press("ArrowDown");
    await page.waitForTimeout(40);
  }
  await page.keyboard.press("Enter");
  await page.waitForTimeout(120);
  console.log(`   ✓ ${title} => ${selected.text}`);
}

async function fillRadioGridDynamic(page, question, title) {
  const rows = question.locator('[role="radiogroup"]');
  const rowCount = await rows.count();

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const options = rows.nth(rowIndex).locator('[role="radio"]:visible');
    const count = await options.count();
    if (!count) continue;

    const rating = randomRating("multipleChoiceGrid");
    const optionIndex = Math.round(((rating - 1) / 4) * Math.max(count - 1, 0));
    await options.nth(optionIndex).click();
    await page.waitForTimeout(60);
  }
  console.log(`   ✓ ${title} => ${rowCount} hàng`);
}

async function fillCheckboxGridDynamic(page, question, title) {
  const groups = question.locator('[role="group"]');
  const groupCount = await groups.count();
  let filledRows = 0;

  for (let groupIndex = 0; groupIndex < groupCount; groupIndex++) {
    const group = groups.nth(groupIndex);
    const nestedGroups = await group.locator('[role="group"]').count();
    const options = group.locator('[role="checkbox"]:visible');
    const count = await options.count();
    if (!count || nestedGroups) continue;

    const texts = await options.allTextContents();
    const amount = Math.min(count, Math.random() < 0.85 ? 1 : 2);
    const indexes = weightedSampleIndexes(texts, amount, "multipleChoice");
    for (const optionIndex of indexes) await options.nth(optionIndex).click();
    filledRows++;
  }

  if (!filledRows) await chooseFromCheckboxes(page, question, title);
  else console.log(`   ✓ ${title} => ${filledRows} hàng`);
}

async function fillDateDynamic(question, title) {
  const date = randomDateParts();
  const native = question.locator('input[type="date"]:visible').first();
  if (await native.count()) {
    await native.fill(date.iso);
  } else {
    const inputs = question.locator("input:visible");
    const count = await inputs.count();
    const values = [date.day, date.month, date.year];
    for (let index = 0; index < Math.min(count, values.length); index++)
      await inputs.nth(index).fill(values[index]);
  }
  console.log(`   ✓ ${title} => ${date.iso}`);
}

async function fillTimeDynamic(question, title) {
  const time = randomTimeParts();
  const native = question.locator('input[type="time"]:visible').first();
  if (await native.count()) {
    await native.fill(time.value);
  } else {
    const inputs = question.locator("input:visible");
    const count = await inputs.count();
    const values = [time.hour, time.minute];
    for (let index = 0; index < Math.min(count, values.length); index++)
      await inputs.nth(index).fill(values[index]);
  }
  console.log(`   ✓ ${title} => ${time.value}`);
}

async function fillQuestion(page, question, index, person) {
  const title = await questionTitle(question, index);
  const encodedType = await encodedQuestionType(question);
  const textarea = question.locator("textarea:visible").first();
  const textInput = question
    .locator('input:not([type="hidden"]):not([type="file"]):visible')
    .first();
  const radioGroups = question.locator('[role="radiogroup"]');
  const checkboxGroups = question.locator('[role="group"]');
  const radioCount = await question.locator('[role="radio"]:visible').count();
  const checkboxCount = await question
    .locator('[role="checkbox"]:visible')
    .count();

  if (await question.locator('input[type="file"]:visible').count()) {
    console.log(`   ⚠ Bỏ qua câu tải tệp (cần file và đăng nhập): ${title}`);
    return;
  }
  if (
    encodedType === 9 ||
    (await question.locator('input[type="date"]:visible').count())
  )
    return fillDateDynamic(question, title);
  if (
    encodedType === 10 ||
    (await question.locator('input[type="time"]:visible').count())
  )
    return fillTimeDynamic(question, title);
  if (
    encodedType === 3 ||
    (await question.locator('[role="listbox"]:visible').count())
  )
    return chooseFromDropdown(page, question, title, person);
  if (encodedType === 7 && checkboxCount)
    return fillCheckboxGridDynamic(page, question, title);
  if ((encodedType === 7 || (await radioGroups.count()) > 1) && radioCount)
    return fillRadioGridDynamic(page, question, title);
  if (encodedType === 4 || checkboxCount)
    return chooseFromCheckboxes(page, question, title);
  if (encodedType === 18 && radioCount)
    return chooseFromRadios(question, title, "rating", person);
  if (encodedType === 5 && radioCount)
    return chooseFromRadios(question, title, "linearScale", person);
  if (encodedType === 2 || radioCount)
    return chooseFromRadios(question, title, "multipleChoice", person);

  if (await textarea.count()) {
    const answer = await answerForText(title, person, true);
    await textarea.fill(answer);
    console.log(`   ✓ ${title} => ${answer}`);
    return;
  }

  if (await textInput.count()) {
    const inputType = (await textInput.getAttribute("type")) || "text";
    const answer = await answerForText(
      title,
      person,
      encodedType === 1,
      inputType,
    );
    await textInput.fill(answer);
    console.log(`   ✓ ${title} => ${answer}`);
    return;
  }

  if (await checkboxGroups.count())
    console.log(`   ⚠ Không xác định được loại câu: ${title}`);
}

async function fillCurrentPage(page, pageNumber, person) {
  const questions = page.locator('[role="listitem"]:visible');
  const count = await questions.count();
  console.log(`\n→ Đọc phần ${pageNumber}: ${count} câu`);

  for (let index = 0; index < count; index++) {
    await fillQuestion(page, questions.nth(index), index, person);
    await page.waitForTimeout(STEP_DELAY);
  }
}

async function visibleNextButton(page) {
  const candidates = page.getByRole("button", { name: /^(tiếp|next)$/i });
  const count = await candidates.count();
  for (let index = 0; index < count; index++) {
    if (
      await candidates
        .nth(index)
        .isVisible()
        .catch(() => false)
    )
      return candidates.nth(index);
  }
  return null;
}

async function fillOneForm(page, person) {
  for (let pageNumber = 1; pageNumber <= 50; pageNumber++) {
    await fillCurrentPage(page, pageNumber, person);
    const nextButton = await visibleNextButton(page);
    if (!nextButton) return;

    await nextButton.scrollIntoViewIfNeeded();
    await nextButton.click();
    await page.waitForTimeout(700);
  }

  throw new Error("Form có quá 50 phần hoặc đang bị lặp điều hướng.");
}

// ============================================================
// MỞ FORM MỚI
// ============================================================

async function openNewForm(page) {
  console.log("\n🌐 MỞ FORM MỚI...");

  await page.goto(FORM_URL, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  await page.waitForTimeout(1000);

  console.log("✓ Đã mở form");
}

// ============================================================
// MAIN
// ============================================================

async function run() {
  console.log("\n======================================");

  console.log("GOOGLE FORM AUTO FILL");

  console.log(`Số lượt: ${TOTAL_SUBMISSIONS}`);
  console.log(`Chế độ: ${HEADLESS ? "Chạy ẩn" : "Hiện trình duyệt"}`);

  console.log("======================================");

  let browser;
  if (HEADLESS) {
    browser = await chromium.launch({ headless: true });
  } else {
    try {
      browser = await chromium.launch({
        channel: "chrome",
        headless: false,
        args: ["--start-maximized"],
      });
      console.log("Trình duyệt: Google Chrome (hiển thị)");
    } catch (error) {
      console.warn(
        `Không mở được Google Chrome (${error.message}); chuyển sang Chromium.`,
      );
      browser = await chromium.launch({
        headless: false,
        args: ["--start-maximized"],
      });
      console.log("Trình duyệt: Chromium (hiển thị)");
    }
  }

  const context = await browser.newContext(HEADLESS ? {} : { viewport: null });

  let successCount = 0;

  try {
    for (let submission = 1; submission <= TOTAL_SUBMISSIONS; submission++) {
      console.log("\n\n======================================");

      console.log(`FORM ${submission}/${TOTAL_SUBMISSIONS}`);

      console.log("======================================");

      console.log("\n🗂 MỞ TAB MỚI...");
      const page = await context.newPage();

      try {
        await openNewForm(page);

        const person = generatePerson();
        console.log("\n👤 Person:");
        console.log(person);

        await fillOneForm(page, person);
        await submit(page);
        successCount++;
      } catch (error) {
        try {
          await page.screenshot({
            path: "form-error.png",
            fullPage: true,
          });
          console.log("📸 Đã lưu form-error.png");
        } catch {}
        throw error;
      } finally {
        await page.close().catch(() => {});
        console.log("🗙 Đã đóng tab của lượt này");
      }

      console.log("\n======================================");

      console.log(`✅ XONG FORM ${submission}/${TOTAL_SUBMISSIONS}`);

      console.log(`Đã gửi thành công: ${successCount}`);

      console.log("======================================");

      // ====================================
      // CÒN LƯỢT THÌ CHỜ
      // Sau đó vòng for sẽ tự goto form mới
      // ====================================

      if (submission < TOTAL_SUBMISSIONS) {
        console.log(`\n⏳ Chuẩn bị làm form ${submission + 1}...`);

        await new Promise((resolve) =>
          setTimeout(resolve, DELAY_BETWEEN_SUBMISSIONS),
        );
      }
    }

    console.log("\n\n======================================");

    console.log("🎉 HOÀN THÀNH TẤT CẢ");

    console.log(`Đã gửi ${successCount}/${TOTAL_SUBMISSIONS} form`);

    console.log("======================================\n");
  } catch (error) {
    console.error("\n❌ ERROR:");

    console.error(error);
    console.error(`__FORMFLOW_ERROR__${error?.message || String(error)}`);
    process.exitCode = 1;

    console.log(`\nĐã gửi được ${successCount}/${TOTAL_SUBMISSIONS}`);
  } finally {
    await browser.close();
  }
}

// ============================================================
// START
// ============================================================

run();
