import { chromium } from "playwright";

import {
  random_name,
  random_phone,
  random_address,
  random_province,
  random_occupation,
  random_gender,
  random_age,
  random_birthdate,
  random_date,
  random_month,
  get_birth_year,
  random_time,
  random_date_time,
  random_number,
  random_boolean,
  random_option,
  random_email,
  random_id,
  random_unique,
} from "./random/random.js";

// ============================================================
// CONFIG
// ============================================================

const FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfRtqVd7iiDNt6AaJ05idlAR_PHbcTbPruxl_No1bYBHBi-pg/viewform";

// Số lần chạy form
const TOTAL_SUBMISSIONS = 1;

// Có chạy browser hiện giao diện không
const HEADLESS = false;

// ============================================================
// TỶ LỆ RANDOM
// ============================================================

// Ví dụ:
// 70% chọn đáp án tích cực
// 20% trung lập
// 10% tiêu cực
//
// Mày có thể thay đổi các số này.

const RATING_WEIGHTS = {
  1: 5,
  2: 10,
  3: 20,
  4: 30,
  5: 35,
};

// ============================================================
// DATA CÓ THỂ THAY ĐỔI
// ============================================================

const TEXT_DATA = {
  // Có thể đổi các câu trả lời text ở đây
  short: [
    "Nhớ những kỷ niệm cũ",
    "Cách bạn quan tâm",
    "Những lần nói chuyện",
    "Khoảng thời gian bên nhau",
    "Những điều nhỏ nhặt",
  ],

  paragraph: [
    "Mình vẫn nhớ những khoảng thời gian hai đứa từng ở bên nhau.",
    "Có nhiều kỷ niệm cũ thỉnh thoảng mình vẫn nhớ lại.",
    "Mình nghĩ khoảng thời gian đó vẫn có ý nghĩa với mình.",
    "Nếu có cơ hội thì mình vẫn muốn nói chuyện lại.",
  ],

  message: [
    "Mình vẫn nhớ bạn.",
    "Hy vọng chúng ta có thể nói chuyện lại.",
    "Chúc bạn luôn vui vẻ nhé.",
    "Có lẽ mình vẫn còn một chút tình cảm.",
  ],
};

// ============================================================
// HELPER
// ============================================================

function pick(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function weightedRandom(weights) {
  const entries = Object.entries(weights);

  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);

  let random = Math.random() * total;

  for (const [value, weight] of entries) {
    random -= weight;

    if (random <= 0) {
      return value;
    }
  }

  return entries[entries.length - 1][0];
}

function randomRating() {
  return weightedRandom(RATING_WEIGHTS);
}

function randomCheckboxes(count, max) {
  const indexes = [];

  while (indexes.length < count) {
    const index = Math.floor(Math.random() * max);

    if (!indexes.includes(index)) {
      indexes.push(index);
    }
  }

  return indexes;
}

// ============================================================
// GOOGLE FORM HELPERS
// ============================================================

async function getQuestionByTitle(page, title) {
  const question = page
    .locator('[role="listitem"]')
    .filter({ hasText: title })
    .first();

  await question.waitFor();

  return question;
}

async function clickOption(question, text) {
  const option = question
    .locator('[role="radio"], [role="checkbox"], [role="option"]')
    .filter({ hasText: text })
    .first();

  await option.click();
}

async function fillTextQuestion(page, title, value) {
  const question = await getQuestionByTitle(page, title);

  const input = question
    .locator('input[type="text"], input[type="email"], textarea')
    .first();

  await input.fill(String(value));
}

async function selectRadio(question, answer) {
  const option = question
    .locator('[role="radio"]')
    .filter({ hasText: answer })
    .first();

  await option.click();
}

async function selectCheckbox(question, answers) {
  for (const answer of answers) {
    const option = question
      .locator('[role="checkbox"]')
      .filter({ hasText: answer })
      .first();

    await option.click();
  }
}

async function selectDropdown(page, question, answer) {
  const dropdown = question.locator('[role="listbox"]').first();

  await dropdown.click();

  const option = page
    .locator('[role="option"]:visible')
    .filter({ hasText: answer })
    .first();

  await option.click();
}

// ============================================================
// FORM DATA
// ============================================================

function generatePerson() {
  const gender = random_gender();

  const name = random_name(gender);

  return {
    gender,
    name,

    phone: random_phone(),

    address: random_address(),

    province: random_province(),

    occupation: random_occupation(),

    age: random_age(),

    birthdate: random_birthdate(),

    email: random_email(name),

    id: random_id(),
  };
}

// ============================================================
// PHẦN 1
// ============================================================

async function fillBasicInfo(page, person) {
  console.log("→ Phần 1: Thông tin liên hệ");

  await fillTextQuestion(page, "Tên", person.name);

  await fillTextQuestion(page, "Năm sinh", get_birth_year());

  await fillTextQuestion(page, "Email", person.email);

  await fillTextQuestion(page, "Địa chỉ", person.address);

  await fillTextQuestion(page, "Số điện thoại", person.phone);
}

// ============================================================
// PHẦN 2
// ============================================================

async function fillPart2(page) {
  console.log("→ Phần 2: Trắc nghiệm");

  const questions = [
    "Bạn còn thích mình không?",
    "Khi vô tình gặp lại mình, cảm xúc đầu tiên của bạn là gì?",
    "Nếu mình chủ động nhắn tin hỏi thăm, bạn sẽ?",
    "Nếu có cơ hội quay lại khoảng thời gian hai đứa còn bên nhau, bạn có muốn không?",
    "Nếu hôm nay mình rủ bạn đi uống nước riêng, bạn sẽ?",
  ];

  for (const title of questions) {
    const question = await getQuestionByTitle(page, title);

    const options = await question.locator('[role="radio"]').allTextContents();

    if (options.length) {
      await selectRadio(question, pick(options));
    }
  }
}

// ============================================================
// PHẦN 3 CHECKBOX
// ============================================================

async function fillCheckboxSection(page) {
  console.log("→ Phần 3: Checkbox");

  const questions = [
    "Điều gì về mình khiến bạn vẫn còn nhớ?",
    "Những điều nào bạn từng muốn làm cùng mình?",
    "Nếu hiện tại mình vẫn còn quan tâm bạn, bạn sẽ cảm thấy?",
    "Bạn từng nhớ mình vì những điều nào?",
    "Nếu chúng ta nói chuyện lại, bạn muốn làm gì?",
  ];

  for (const title of questions) {
    const question = await getQuestionByTitle(page, title);

    const options = await question
      .locator('[role="checkbox"]')
      .allTextContents();

    if (!options.length) continue;

    // ========================================================
    // CÓ THỂ THAY ĐỔI SỐ LƯỢNG CHECKBOX ĐƯỢC CHỌN Ở ĐÂY
    // ========================================================

    const count = Math.min(Math.floor(Math.random() * 3) + 1, options.length);

    const indexes = randomCheckboxes(count, options.length);

    for (const index of indexes) {
      await question.locator('[role="checkbox"]').nth(index).click();
    }
  }
}

// ============================================================
// PHẦN 4 DROPDOWN
// ============================================================

async function fillDropdownSection(page) {
  console.log("→ Phần 4: Dropdown");

  const questions = [
    "Theo bạn, khả năng hai đứa nói chuyện lại thường xuyên là:",
    "Nếu mình rủ bạn đi uống nước riêng, bạn sẽ:",
    "Nếu phải chọn một mức độ tình cảm hiện tại dành cho mình:",
    "Mức độ bạn muốn gặp lại mình?",
    "Nếu được chọn một điều cho mối quan hệ này?",
  ];

  for (const title of questions) {
    const question = await getQuestionByTitle(page, title);

    const dropdown = question.locator('[role="listbox"]').first();

    await dropdown.click();

    const options = page.locator('[role="option"]:visible');

    const count = await options.count();

    if (count > 0) {
      await options.nth(Math.floor(Math.random() * count)).click();
    }
  }
}

// ============================================================
// PHẦN 5 LINK
// ============================================================

async function fillLinks(page) {
  console.log("→ Phần 5: Link");

  const questions = [
    "Link một bức ảnh khiến bạn nhớ đến mình?",
    "Link một bức ảnh kỷ niệm của hai đứa?",
    "Link một bức ảnh mà bạn nghĩ mình sẽ thích?",
    "Link một bức ảnh thể hiện tâm trạng hiện tại của bạn?",
    "Link bất kỳ hình ảnh / tệp nào bạn muốn gửi cho mình?",
  ];

  for (const title of questions) {
    await fillTextQuestion(page, title, "");
  }
}

// ============================================================
// PHẦN 6 LINEAR SCALE
// ============================================================

async function fillLinearScale(page) {
  console.log("→ Phần 6: Linear scale");

  const questions = [
    "Bạn còn thích mình đến mức nào?",
    "Bạn còn nhớ mình đến mức nào?",
    "Bạn muốn nói chuyện lại với mình đến mức nào?",
    "Bạn hài lòng với những gì hai đứa từng có?",
    "Bạn nghĩ chúng ta còn cơ hội đến mức nào?",
  ];

  for (const title of questions) {
    const question = await getQuestionByTitle(page, title);

    const rating = randomRating();

    console.log(`   ${title} => ${rating}`);

    const option = question
      .locator('[role="radio"]')
      .filter({ hasText: String(rating) })
      .first();

    await option.click();
  }
}

// ============================================================
// PHẦN 7 RATING
// ============================================================

async function fillRating(page) {
  console.log("→ Phần 7: Rating");

  const questions = [
    "Bạn đánh giá mình là người yêu như thế nào?",
    "Bạn đánh giá mức độ quan tâm của mình trước đây?",
    "Bạn đánh giá những kỷ niệm của chúng ta?",
    "Bạn đánh giá khả năng chúng ta nói chuyện lại?",
    "Bạn đánh giá cảm xúc hiện tại dành cho mình?",
  ];

  for (const title of questions) {
    const question = await getQuestionByTitle(page, title);

    const rating = randomRating();

    console.log(`   ${title} => ${rating}`);

    const option = question
      .locator('[role="radio"]')
      .filter({ hasText: String(rating) })
      .first();

    await option.click();
  }
}

// ============================================================
// GRID
// ============================================================

async function fillGrid(page, title) {
  const question = await getQuestionByTitle(page, title);

  const rows = question.locator('[role="radiogroup"]');

  const rowCount = await rows.count();

  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);

    const options = row.locator('[role="radio"]');

    const count = await options.count();

    if (count > 0) {
      const rating = randomRating();

      // Chọn theo tỷ lệ random
      await options.nth(Math.min(Number(rating) - 1, count - 1)).click();
    }
  }
}

async function fillAllGrids(page) {
  console.log("→ Phần 8: Grid");

  await fillGrid(page, "Mức độ cảm xúc của bạn dành cho mình");

  await fillGrid(page, "Bạn cảm thấy thế nào về những điều sau?");

  await fillGrid(page, "Mức độ bạn muốn làm những việc này cùng mình");

  await fillGrid(page, "Bạn đánh giá những khía cạnh này của chúng ta");

  await fillGrid(
    page,
    "Bạn nghĩ mình còn xuất hiện trong cuộc sống của bạn ở mức nào?",
  );
}

// ============================================================
// PHẦN 9 CHECKBOX GRID
// ============================================================

async function fillCheckboxGrid(page, title) {
  const question = await getQuestionByTitle(page, title);

  const rows = question.locator('[role="group"]');

  const rowCount = await rows.count();

  for (let i = 0; i < rowCount; i++) {
    const row = rows.nth(i);

    const options = row.locator('[role="checkbox"]');

    const count = await options.count();

    if (!count) continue;

    // ========================================================
    // CÓ THỂ ĐỔI TỶ LỆ / SỐ LƯỢNG CHECKBOX Ở ĐÂY
    // ========================================================

    const selectedCount = Math.random() < 0.7 ? 1 : Math.min(2, count);

    const indexes = randomCheckboxes(selectedCount, count);

    for (const index of indexes) {
      await options.nth(index).click();
    }
  }
}

async function fillPart9(page) {
  console.log("→ Phần 9: Checkbox Grid");

  await fillCheckboxGrid(page, "Những điều bạn từng làm vì mình");

  await fillCheckboxGrid(page, "Những điều bạn muốn làm nếu gặp lại mình");

  await fillCheckboxGrid(page, "Những điều khiến bạn nhớ về mình");

  await fillCheckboxGrid(page, "Những cảm xúc bạn từng có với mình");

  await fillCheckboxGrid(page, "Những điều bạn mong muốn trong tương lai");
}

// ============================================================
// PHẦN 10 TEXT
// ============================================================

async function fillPart10(page) {
  console.log("→ Phần 10: Trả lời ngắn");

  const answers = {
    "Một từ để mô tả mình?": pick(TEXT_DATA.short),

    "Bạn nhớ điều gì nhất về mình?": pick(TEXT_DATA.short),

    "Điều đầu tiên bạn nghĩ đến khi nghe tên mình?": pick(TEXT_DATA.short),

    "Nếu được nhắn cho mình một câu, bạn sẽ nói gì?": pick(TEXT_DATA.message),

    "Bạn nghĩ mình còn tình cảm với bạn không?": pick([
      "Có",
      "Có lẽ",
      "Không chắc",
      "Mình nghĩ là có",
      "Mình không biết",
    ]),
  };

  for (const [question, answer] of Object.entries(answers)) {
    await fillTextQuestion(page, question, answer);
  }
}

// ============================================================
// PHẦN 11 PARAGRAPH
// ============================================================

async function fillPart11(page) {
  console.log("→ Phần 11: Đoạn văn");

  const answers = {
    "Hãy kể một kỷ niệm về mình mà bạn vẫn còn nhớ.": pick(TEXT_DATA.paragraph),

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
// NEXT BUTTON
// ============================================================

async function nextPage(page) {
  const nextButton = page
    .getByRole("button", {
      name: /tiếp|next/i,
    })
    .first();

  if (await nextButton.isVisible()) {
    await nextButton.click();

    await page.waitForTimeout(500);
  }
}

// ============================================================
// SUBMIT
// ============================================================

async function submit(page) {
  const submitButton = page
    .getByRole("button", {
      name: /gửi|submit/i,
    })
    .first();

  await submitButton.click();

  await page.waitForTimeout(1000);

  console.log("✓ FORM SUBMITTED");
}

// ============================================================
// MAIN
// ============================================================

async function run() {
  const browser = await chromium.launch({
    headless: HEADLESS,
  });

  const context = await browser.newContext();

  const page = await context.newPage();

  try {
    for (let submission = 1; submission <= TOTAL_SUBMISSIONS; submission++) {
      console.log(
        `\n========== FORM ${submission}/${TOTAL_SUBMISSIONS} ==========`,
      );

      const person = generatePerson();

      console.log("Person:", person);

      await page.goto(FORM_URL, {
        waitUntil: "domcontentloaded",
      });

      await page.waitForTimeout(1000);

      // -------------------------
      // SECTION 1
      // -------------------------

      await fillBasicInfo(page, person);

      await nextPage(page);

      // -------------------------
      // SECTION 2
      // -------------------------

      await fillPart2(page);

      await nextPage(page);

      // -------------------------
      // SECTION 3
      // -------------------------

      await fillCheckboxSection(page);

      await nextPage(page);

      // -------------------------
      // SECTION 4
      // -------------------------

      await fillDropdownSection(page);

      await nextPage(page);

      // -------------------------
      // SECTION 5
      // -------------------------

      await fillLinks(page);

      await nextPage(page);

      // -------------------------
      // SECTION 6
      // -------------------------

      await fillLinearScale(page);

      await nextPage(page);

      // -------------------------
      // SECTION 7
      // -------------------------

      await fillRating(page);

      await nextPage(page);

      // -------------------------
      // SECTION 8
      // -------------------------

      await fillAllGrids(page);

      await nextPage(page);

      // -------------------------
      // SECTION 9
      // -------------------------

      await fillPart9(page);

      await nextPage(page);

      // -------------------------
      // SECTION 10
      // -------------------------

      await fillPart10(page);

      await nextPage(page);

      // -------------------------
      // SECTION 11
      // -------------------------

      await fillPart11(page);

      await nextPage(page);

      // -------------------------
      // SECTION 12 + 13
      // -------------------------

      // Nếu ngày/giờ là bắt buộc,
      // thêm logic fill ở đây tùy DOM thực tế của Form.

      // -------------------------
      // SUBMIT
      // -------------------------

      await submit(page);

      console.log(`✓ Hoàn thành submission ${submission}`);

      if (submission < TOTAL_SUBMISSIONS) {
        await page.waitForTimeout(1000);
      }
    }
  } catch (error) {
    console.error("❌ ERROR:", error);

    await page.screenshot({
      path: "form-error.png",
      fullPage: true,
    });
  } finally {
    await browser.close();
  }
}

run();
