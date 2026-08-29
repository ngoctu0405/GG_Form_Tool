import { chromium } from "playwright";

import {
  random_name,
  random_phone,
  random_address,
  random_gender,
  random_email,
  random_id,
} from "./random/random.js";

// ============================================================
// CONFIG
// ============================================================

const FORM_URL = "https://forms.gle/GygZdtryXgfkMwJ26";

// ============================================================
// SỐ LẦN MUỐN ĐIỀN + GỬI
// ============================================================
//
// 1  = 1 lần
// 5  = 5 lần
// 10 = 10 lần
//
const TOTAL_SUBMISSIONS = 20;

// false = nhìn Chrome chạy
// true = chạy ẩn
const HEADLESS = false;

// Delay giữa từng thao tác
const STEP_DELAY = 200;

// Delay giữa 2 lượt submit
const DELAY_BETWEEN_SUBMISSIONS = 1200;

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

const RATING_WEIGHTS = {
  1: 15,
  2: 15,
  3: 20,
  4: 25,
  5: 25,
};

// ============================================================
// TEXT DATA
// ============================================================

const TEXT_DATA = {
  short: [
    "Dễ thương",
    "Quan tâm",
    "Ấm áp",
    "Đáng nhớ",
    "Vui tính",
    "Tốt bụng",
    "Thân thiện",
  ],

  memory: [
    "Những lần hai đứa ngồi nói chuyện rất lâu.",
    "Mình vẫn nhớ những lần đi chơi và nói chuyện cùng nhau.",
    "Có vài khoảnh khắc nhỏ nhưng đến giờ mình vẫn nhớ.",
    "Mình nhớ nhất những lúc hai đứa vui vẻ và thoải mái với nhau.",
    "Mình vẫn nhớ những câu chuyện cũ của hai đứa.",
  ],

  paragraph: [
    "Mình vẫn nhớ những khoảng thời gian hai đứa từng ở bên nhau. Dù đã qua một thời gian nhưng thỉnh thoảng mình vẫn nghĩ lại và thấy đó là những kỷ niệm đẹp.",

    "Có nhiều chuyện cũ mình vẫn nhớ. Mình nghĩ khoảng thời gian đó vẫn có ý nghĩa với mình và nếu có dịp thì mình vẫn muốn nói chuyện lại một cách thoải mái.",

    "Mình thấy những gì đã xảy ra đều là một phần của quá khứ. Có vui, có buồn, nhưng nhìn chung mình vẫn trân trọng những kỷ niệm đó.",

    "Nếu có cơ hội nói chuyện lại, mình muốn mọi thứ nhẹ nhàng hơn, thẳng thắn hơn và không còn những hiểu lầm như trước.",

    "Nếu hai đứa có cơ hội nói chuyện lại thì mình muốn bắt đầu bằng những cuộc trò chuyện bình thường và để mọi thứ diễn ra tự nhiên.",
  ],

  message: [
    "Mình vẫn nhớ bạn.",
    "Hy vọng chúng ta có thể nói chuyện lại.",
    "Chúc bạn luôn vui vẻ nhé.",
    "Có lẽ mình vẫn còn một chút tình cảm.",
    "Nếu có dịp thì mình muốn hai đứa nói chuyện lại một lần.",
    "Lâu rồi không nói chuyện, hy vọng bạn vẫn ổn.",
  ],
};

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

function randomRating() {
  return weightedRandom(RATING_WEIGHTS);
}

// ============================================================
// TÍNH ĐỘ TÍCH CỰC CỦA ĐÁP ÁN
// ============================================================

function getChoiceWeight(text, index, count) {
  const t = String(text).trim().toLowerCase();

  // Nếu option là số 1 -> 5
  if (/^[1-5]$/.test(t)) {
    return RATING_WEIGHTS[Number(t)] ?? 1;
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
    return 3;
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
    return 35;
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
    return 25;
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
    return 15;
  }

  // ========================================
  // TỪ NGẮN
  // ========================================

  if (t === "có") {
    return 25;
  }

  if (t === "muốn") {
    return 25;
  }

  if (t === "không") {
    return 5;
  }

  // Nếu không nhận diện được,
  // hơi ưu tiên option phía cuối.
  return 10 + (index / Math.max(count - 1, 1)) * 10;
}

// ============================================================
// CHỌN THEO WEIGHT
// ============================================================

function weightedChoiceIndex(texts) {
  const weights = texts.map((text, index) =>
    getChoiceWeight(text, index, texts.length),
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

function weightedSampleIndexes(texts, amount) {
  const available = texts.map((text, index) => ({
    text,
    index,
  }));

  const result = [];

  while (result.length < amount && available.length) {
    const currentTexts = available.map((item) => item.text);

    const position = weightedChoiceIndex(currentTexts);

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

  const age = randomInt(18, 30);

  return {
    gender,

    name,

    birthYear: String(new Date().getFullYear() - age),

    phone: random_phone(),

    address: random_address(),

    email: random_email(name),

    id: random_id(),
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

  const options = page.locator('[role="option"]:visible');

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
// PHẦN 1
// ============================================================

async function fillPart1(page, person) {
  console.log("\n→ Phần 1");

  await fillTextQuestion(page, "Tên", person.name);

  await fillTextQuestion(page, "Năm sinh", person.birthYear);

  await fillTextQuestion(page, "Email", person.email);

  await fillTextQuestion(page, "Địa chỉ", person.address);

  await fillTextQuestion(page, "Số điện thoại", person.phone);
}

// ============================================================
// PHẦN 2
// ============================================================

async function fillPart2(page) {
  console.log("\n→ Phần 2");

  const questions = [
    "Bạn còn thích mình không?",

    "Khi vô tình gặp lại mình, cảm xúc đầu tiên của bạn là gì?",

    "Nếu mình chủ động nhắn tin hỏi thăm, bạn sẽ?",

    "Nếu có cơ hội quay lại khoảng thời gian hai đứa còn bên nhau, bạn có muốn không?",

    "Nếu hôm nay mình rủ bạn đi uống nước riêng, bạn sẽ?",
  ];

  for (const title of questions) {
    await chooseRandomRadio(page, title);
  }
}

// ============================================================
// PHẦN 3
// ============================================================

async function fillPart3(page) {
  console.log("\n→ Phần 3");

  const questions = [
    "Điều gì về mình khiến bạn vẫn còn nhớ?",

    "Những điều nào bạn từng muốn làm cùng mình?",

    "Nếu hiện tại mình vẫn còn quan tâm bạn, bạn sẽ cảm thấy?",

    "Bạn từng nhớ mình vì những điều nào?",

    "Nếu chúng ta nói chuyện lại, bạn muốn làm gì?",
  ];

  for (const title of questions) {
    await chooseRandomCheckboxes(page, title);
  }
}

// ============================================================
// PHẦN 4
// ============================================================

async function fillPart4(page) {
  console.log("\n→ Phần 4");

  const questions = [
    "Theo bạn, khả năng hai đứa nói chuyện lại thường xuyên là:",

    "Nếu mình rủ bạn đi uống nước riêng, bạn sẽ:",

    "Nếu phải chọn một mức độ tình cảm hiện tại dành cho mình:",

    "Mức độ bạn muốn gặp lại mình?",

    "Nếu được chọn một điều cho mối quan hệ này?",
  ];

  for (const title of questions) {
    await chooseRandomDropdown(page, title);
  }
}

// ============================================================
// PHẦN 5
// ============================================================

async function fillPart5(page) {
  console.log("\n→ Phần 5");

  const questions = [
    "Link một bức ảnh khiến bạn nhớ đến mình?",
    "Link một bức ảnh kỷ niệm của hai đứa?",
    "Link một bức ảnh mà bạn nghĩ mình sẽ thích?",
    "Link một bức ảnh thể hiện tâm trạng hiện tại của bạn?",
    "Link bất kỳ hình ảnh / tệp nào bạn muốn gửi cho mình?",
  ];

  for (const title of questions) {
    await fillTextQuestion(page, title, pick(LINK_DATA));
  }
}

// ============================================================
// PHẦN 6
// ============================================================

async function fillPart6(page) {
  console.log("\n→ Phần 6");

  const questions = [
    "Bạn còn thích mình đến mức nào?",
    "Bạn còn nhớ mình đến mức nào?",
    "Bạn muốn nói chuyện lại với mình đến mức nào?",
    "Bạn hài lòng với những gì hai đứa từng có?",
    "Bạn nghĩ chúng ta còn cơ hội đến mức nào?",
  ];

  for (const title of questions) {
    await chooseWeightedScale(page, title);
  }
}

// ============================================================
// PHẦN 7
// ============================================================

async function fillPart7(page) {
  console.log("\n→ Phần 7");

  const questions = [
    "Bạn đánh giá mình là người yêu như thế nào?",
    "Bạn đánh giá mức độ quan tâm của mình trước đây?",
    "Bạn đánh giá những kỷ niệm của chúng ta?",
    "Bạn đánh giá khả năng chúng ta nói chuyện lại?",
    "Bạn đánh giá cảm xúc hiện tại dành cho mình?",
  ];

  for (const title of questions) {
    await chooseWeightedScale(page, title);
  }
}

// ============================================================
// PHẦN 8
// ============================================================

async function fillPart8(page) {
  console.log("\n→ Phần 8");

  const questions = [
    "Mức độ cảm xúc của bạn dành cho mình",
    "Bạn cảm thấy thế nào về những điều sau?",
    "Mức độ bạn muốn làm những việc này cùng mình",
    "Bạn đánh giá những khía cạnh này của chúng ta",
    "Bạn nghĩ mình còn xuất hiện trong cuộc sống của bạn ở mức nào?",
  ];

  for (const title of questions) {
    await fillRadioGrid(page, title);
  }
}

// ============================================================
// PHẦN 9
// ============================================================

async function fillPart9(page) {
  console.log("\n→ Phần 9");

  const questions = [
    "Những điều bạn từng làm vì mình",
    "Những điều bạn muốn làm nếu gặp lại mình",
    "Những điều khiến bạn nhớ về mình",
    "Những cảm xúc bạn từng có với mình",
    "Những điều bạn mong muốn trong tương lai",
  ];

  for (const title of questions) {
    await fillCheckboxGrid(page, title);
  }
}

// ============================================================
// PHẦN 10
// ============================================================

async function fillPart10(page) {
  console.log("\n→ Phần 10");

  const answers = {
    "Một từ để mô tả mình?": pick(TEXT_DATA.short),

    "Bạn nhớ điều gì nhất về mình?": pick(TEXT_DATA.memory),

    "Điều đầu tiên bạn nghĩ đến khi nghe tên mình?": pick(TEXT_DATA.short),

    "Nếu được nhắn cho mình một câu, bạn sẽ nói gì?": pick(TEXT_DATA.message),

    "Bạn nghĩ mình còn tình cảm với bạn không?": pick([
      "Có",
      "Có",
      "Có lẽ",
      "Mình nghĩ là có",
      "Mình nghĩ là có",
      "Không chắc",
    ]),
  };

  for (const [question, answer] of Object.entries(answers)) {
    await fillTextQuestion(page, question, answer);
  }
}

// ============================================================
// PHẦN 11
// ============================================================

async function fillPart11(page) {
  console.log("\n→ Phần 11");

  const answers = {
    "Hãy kể một kỷ niệm về mình mà bạn vẫn còn nhớ.": pick(TEXT_DATA.memory),

    "Điều gì khiến bạn từng thích mình?": pick(TEXT_DATA.paragraph),

    "Bạn cảm thấy thế nào khi nghĩ về khoảng thời gian hai đứa từng ở bên nhau?":
      pick(TEXT_DATA.paragraph),

    "Có điều gì bạn từng muốn nói với mình nhưng chưa nói không?": pick(
      TEXT_DATA.paragraph,
    ),

    "Nếu chúng ta có cơ hội bắt đầu lại, bạn muốn mọi thứ sẽ như thế nào?":
      pick(TEXT_DATA.paragraph),
  };

  for (const [question, answer] of Object.entries(answers)) {
    await fillTextQuestion(page, question, answer);
  }
}

// ============================================================
// PHẦN 12
// ============================================================

async function fillPart12(page) {
  console.log("\n→ Phần 12");

  const questions = [
    "Ngày bạn bắt đầu có tình cảm với mình?",
    "Ngày kỷ niệm mà bạn nhớ nhất?",
    "Ngày gần nhất bạn nhớ đến mình?",
    "Nếu được chọn một ngày để gặp lại mình?",
    "Ngày bạn muốn chúng ta nói chuyện lại?",
  ];

  for (const title of questions) {
    await fillDateQuestion(page, title);
  }
}

// ============================================================
// PHẦN 13
// ============================================================

async function fillPart13(page) {
  console.log("\n→ Phần 13");

  const questions = [
    "Khoảng thời gian bạn thường nhớ đến mình?",
    "Bạn thường muốn nói chuyện với mình vào lúc nào?",
    "Nếu được gặp mình hôm nay, bạn muốn gặp lúc mấy giờ?",
    "Bạn thường xem lại tin nhắn cũ vào lúc nào?",
    "Nếu mình nhắn cho bạn ngay bây giờ, bạn muốn nhận tin lúc mấy giờ?",
  ];

  for (const title of questions) {
    await fillTimeQuestion(page, title);
  }
}

// ============================================================
// ĐIỀN 1 FORM
// ============================================================

async function fillOneForm(page, person) {
  await fillPart1(page, person);

  await nextPage(page);

  await fillPart2(page);
  await nextPage(page);

  await fillPart3(page);
  await nextPage(page);

  await fillPart4(page);
  await nextPage(page);

  await fillPart5(page);
  await nextPage(page);

  await fillPart6(page);
  await nextPage(page);

  await fillPart7(page);
  await nextPage(page);

  await fillPart8(page);
  await nextPage(page);

  await fillPart9(page);
  await nextPage(page);

  await fillPart10(page);
  await nextPage(page);

  await fillPart11(page);
  await nextPage(page);

  await fillPart12(page);
  await nextPage(page);

  await fillPart13(page);
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

  console.log("======================================");

  const browser = await chromium.launch({
    headless: HEADLESS,
  });

  const context = await browser.newContext();

  const page = await context.newPage();

  let successCount = 0;

  try {
    for (let submission = 1; submission <= TOTAL_SUBMISSIONS; submission++) {
      console.log("\n\n======================================");

      console.log(`FORM ${submission}/${TOTAL_SUBMISSIONS}`);

      console.log("======================================");

      // ====================================
      // LUÔN MỞ FORM MỚI Ở ĐẦU MỖI VÒNG
      // ====================================

      await openNewForm(page);

      // ====================================
      // RANDOM NGƯỜI MỚI
      // ====================================

      const person = generatePerson();

      console.log("\n👤 Person:");

      console.log(person);

      // ====================================
      // ĐIỀN
      // ====================================

      await fillOneForm(page, person);

      // ====================================
      // GỬI
      // ====================================

      await submit(page);

      successCount++;

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

        await page.waitForTimeout(DELAY_BETWEEN_SUBMISSIONS);
      }
    }

    console.log("\n\n======================================");

    console.log("🎉 HOÀN THÀNH TẤT CẢ");

    console.log(`Đã gửi ${successCount}/${TOTAL_SUBMISSIONS} form`);

    console.log("======================================\n");
  } catch (error) {
    console.error("\n❌ ERROR:");

    console.error(error);

    console.log(`\nĐã gửi được ${successCount}/${TOTAL_SUBMISSIONS}`);

    try {
      await page.screenshot({
        path: "form-error.png",
        fullPage: true,
      });

      console.log("📸 Đã lưu form-error.png");
    } catch {}
  } finally {
    await browser.close();
  }
}

// ============================================================
// START
// ============================================================

run();
