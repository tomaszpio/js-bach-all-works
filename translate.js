import { autoTranslate } from "https://cdn.jsdelivr.net/gh/Mr-vero/AutoTranslate@v.1.0.3/dist/autoTranslate.js";
const sourceLang = "Polish";
const langMap = { Polish: "pl", English: "en", German: "de", French: "fr" };
const selector = document.getElementById('language-select');
async function applyTranslation() {
  const target = selector.value;
  document.documentElement.lang = langMap[target] || 'pl';
  if (target !== sourceLang) {
    await autoTranslate(sourceLang, target);
  }
}
selector.addEventListener('change', applyTranslation);
document.addEventListener('dataLoaded', applyTranslation);
