import assert from "node:assert/strict";
import { en, zhCN } from "../frontend/src/locales/system";

function sortedKeys(record: Record<string, string>) {
  return Object.keys(record).sort();
}

const chineseKeys = sortedKeys(zhCN);
const englishKeys = sortedKeys(en);
const missingEnglish = chineseKeys.filter(key => !englishKeys.includes(key));
const missingChinese = englishKeys.filter(key => !chineseKeys.includes(key));

assert.deepEqual(missingEnglish, [], `Missing English translations: ${missingEnglish.join(", ")}`);
assert.deepEqual(missingChinese, [], `Missing Simplified Chinese translations: ${missingChinese.join(", ")}`);

for (const [locale, messages] of Object.entries({ "zh-CN": zhCN, en })) {
  for (const [key, value] of Object.entries(messages)) {
    assert.match(key, /^[a-z][a-z0-9]*(\.[a-z][a-zA-Z0-9]*)+$/, `${locale} has an invalid translation key: ${key}`);
    assert.ok(value.trim(), `${locale} has an empty translation for: ${key}`);
  }
}

console.log(`i18n catalog check passed (${chineseKeys.length} zh-CN/en keys)`);
