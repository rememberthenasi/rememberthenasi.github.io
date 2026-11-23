#!/usr/bin/env node
// Builds the search-friendly guide pages and sitemap.xml from nasi.json and yehiRatzon.json.
//
//   node tools/build-pages.mjs
//
// Writes: nasi/index.html, nasi/<1-13>-nissan/index.html, nissan/index.html,
//         pesach/index.html, 404.html, sitemap.xml
//
// Dates are worked out with the Hebrew calendar built into Node (Intl), starting from the
// next Nissan that has not finished yet. Run it again once a year (after Nissan) so the
// "upcoming dates" tables roll forward, then commit the output. index.html is never touched.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://rememberthenasi.com';
const SITE_NAME = 'Remember The Nasi';
const OG_IMAGE = SITE + '/og-image.png';
const GA_ID = 'G-BFNQ3TZSCK';
const AUTHOR = 'Menachem Spielman';
const CSS_VERSION = '20261123a';

const nasiData = JSON.parse(readFileSync(join(ROOT, 'nasi.json'), 'utf8'));
const yehiData = JSON.parse(readFileSync(join(ROOT, 'yehiRatzon.json'), 'utf8'));

// ---------------------------------------------------------------- the 13 days
const DAYS = [
  { en: 'Nachshon son of Aminadav', short: 'Nachshon ben Aminadav', he: 'נַחְשׁוֹן בֶּן־עַמִּינָדָב', alt: 'Nahshon ben Amminadab', tribe: 'Yehuda', tribeAlt: 'Judah', tribeHe: 'יְהוּדָה', verses: '7:1–17' },
  { en: 'Netanel son of Tzuar', short: 'Netanel ben Tzuar', he: 'נְתַנְאֵל בֶּן־צוּעָר', alt: 'Nethanel ben Zuar', tribe: 'Yissachar', tribeAlt: 'Issachar', tribeHe: 'יִשָּׂשכָר', verses: '7:18–23' },
  { en: 'Eliav son of Chelon', short: 'Eliav ben Chelon', he: 'אֱלִיאָב בֶּן־חֵלֹן', alt: 'Eliab ben Helon', tribe: 'Zevulun', tribeAlt: 'Zebulun', tribeHe: 'זְבוּלֻן', verses: '7:24–29' },
  { en: 'Elitzur son of Shedeur', short: 'Elitzur ben Shedeur', he: 'אֱלִיצוּר בֶּן־שְׁדֵיאוּר', alt: 'Elizur ben Shedeur', tribe: 'Reuven', tribeAlt: 'Reuben', tribeHe: 'רְאוּבֵן', verses: '7:30–35' },
  { en: 'Shelumiel son of Tzurishaddai', short: 'Shelumiel ben Tzurishaddai', he: 'שְׁלֻמִיאֵל בֶּן־צוּרִישַׁדָּי', alt: 'Shelumiel ben Zurishaddai', tribe: 'Shimon', tribeAlt: 'Simeon', tribeHe: 'שִׁמְעוֹן', verses: '7:36–41' },
  { en: 'Elyasaf son of Deuel', short: 'Elyasaf ben Deuel', he: 'אֶלְיָסָף בֶּן־דְּעוּאֵל', alt: 'Eliasaph ben Deuel', tribe: 'Gad', tribeAlt: 'Gad', tribeHe: 'גָּד', verses: '7:42–47' },
  { en: 'Elishama son of Amihud', short: 'Elishama ben Amihud', he: 'אֱלִישָׁמָע בֶּן־עַמִּיהוּד', alt: 'Elishama ben Ammihud', tribe: 'Ephraim', tribeAlt: 'Ephraim', tribeHe: 'אֶפְרַיִם', verses: '7:48–53' },
  { en: 'Gamliel son of Pedahtzur', short: 'Gamliel ben Pedahtzur', he: 'גַּמְלִיאֵל בֶּן־פְּדָהצוּר', alt: 'Gamaliel ben Pedahzur', tribe: 'Menashe', tribeAlt: 'Manasseh', tribeHe: 'מְנַשֶּׁה', verses: '7:54–59' },
  { en: 'Avidan son of Gidoni', short: 'Avidan ben Gidoni', he: 'אֲבִידָן בֶּן־גִּדְעֹנִי', alt: 'Abidan ben Gideoni', tribe: 'Binyamin', tribeAlt: 'Benjamin', tribeHe: 'בִּנְיָמִן', verses: '7:60–65' },
  { en: 'Achiezer son of Amishaddai', short: 'Achiezer ben Amishaddai', he: 'אֲחִיעֶזֶר בֶּן־עַמִּישַׁדָּי', alt: 'Ahiezer ben Ammishaddai', tribe: 'Dan', tribeAlt: 'Dan', tribeHe: 'דָּן', verses: '7:66–71' },
  { en: 'Pagiel son of Ochran', short: 'Pagiel ben Ochran', he: 'פַּגְעִיאֵל בֶּן־עָכְרָן', alt: 'Pagiel ben Ocran', tribe: 'Asher', tribeAlt: 'Asher', tribeHe: 'אָשֵׁר', verses: '7:72–77' },
  { en: 'Achira son of Einan', short: 'Achira ben Einan', he: 'אֲחִירַע בֶּן־עֵינָן', alt: 'Ahira ben Enan', tribe: 'Naftali', tribeAlt: 'Naphtali', tribeHe: 'נַפְתָּלִי', verses: '7:78–83' },
  { en: 'The dedication of the altar', short: 'Zot Chanukat HaMizbeach', he: 'זֹאת חֲנֻכַּת הַמִּזְבֵּחַ', alt: 'the dedication of the altar', tribe: 'Levi', tribeAlt: 'Levi', tribeHe: 'לֵוִי', verses: '7:84–8:4' },
];
const HE_DAY = ['א׳', 'ב׳', 'ג׳', 'ד׳', 'ה׳', 'ו׳', 'ז׳', 'ח׳', 'ט׳', 'י׳', 'י״א', 'י״ב', 'י״ג'];
const ORDINAL = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth'];

// Short notes that belong to particular days. Plain facts from the Chumash, Rashi and the Chabad calendar.
const DAY_NOTES = {
  1: [
    'This is the day the Mishkan (Tabernacle) was set up and dedicated, and the first of the twelve days of offerings. Nachshon of the tribe of Yehuda brought the first offering. The reading starts from the beginning of Numbers chapter 7, which tells how the Nesiim brought wagons and oxen to carry the Mishkan.',
  ],
  2: [
    'Rashi (Numbers 7:18) explains that the tribe of Yissachar is mentioned twice in its verse because Netanel gave the other princes the idea of bringing these offerings.',
    'In the Chabad calendar, 2 Nissan is the yahrzeit of the Rebbe Rashab, Rabbi Sholom DovBer Schneersohn (5680 / 1920), and the day his son, the Frierdiker Rebbe, Rabbi Yosef Yitzchak, became Rebbe.',
  ],
  7: [
    'According to the Midrash, the first of Nissan that year was a Sunday, so the seventh day was Shabbat. Elishama of the tribe of Ephraim brought his offering even on Shabbat.',
  ],
  11: [
    'In the Chabad calendar, 11 Nissan is the birthday of the Lubavitcher Rebbe, Rabbi Menachem Mendel Schneerson (5662 / 1902). From this day many begin saying the Rebbe’s new chapter of Tehillim.',
  ],
  13: [
    'The tribe of Levi did not bring a Nasi offering. On the thirteenth day we read the summary of all twelve offerings, “Zot Chanukat HaMizbeach”, and the first verses of Parshat Behaalotecha about lighting the Menorah. Rashi explains that Aharon was saddened that he and his tribe had no share in the dedication, and was told: “Yours is greater than theirs, for you will light the lamps.”',
    'On 13 Nissan the Nasi is said without a Yehi Ratzon.',
    'In the Chabad calendar, 13 Nissan is the yahrzeit of the Tzemach Tzedek, Rabbi Menachem Mendel of Lubavitch, the third Chabad Rebbe (5626 / 1866).',
  ],
};

// ---------------------------------------------------------------- dates
const hebFmt = new Intl.DateTimeFormat('en-u-ca-hebrew', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' });
const gregFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const shortFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' });
const DAY_MS = 86400000;

function hebParts(date) {
  const p = Object.fromEntries(hebFmt.formatToParts(date).map(x => [x.type, x.value]));
  return { day: Number(p.day), month: p.month, year: Number(p.year || p.relatedYear) };
}

// Gregorian date (UTC midnight) of the daytime of `day` Nisan `hy`.
function nisan(hy, day) {
  const gy = hy - 3760;
  for (let t = Date.UTC(gy, 2, 1); t < Date.UTC(gy, 4, 15); t += DAY_MS) {
    const d = new Date(t);
    const p = hebParts(d);
    if (p.year === hy && p.month === 'Nisan' && p.day === day) return d;
  }
  throw new Error('No Nisan ' + day + ' ' + hy);
}

const addDays = (d, n) => new Date(d.getTime() + n * DAY_MS);
const isShabbat = d => d.getUTCDay() === 6;
const g = d => gregFmt.format(d).replace(/^(\w+) /, '$1, ');
const gs = d => shortFmt.format(d);
const gregYear = d => d.getUTCFullYear();

const NOW = new Date();
const TODAY = new Date(Date.UTC(NOW.getUTCFullYear(), NOW.getUTCMonth(), NOW.getUTCDate()));
const BUILD_DATE = TODAY.toISOString().slice(0, 10);
let firstYear = hebParts(TODAY).year;
if (nisan(firstYear, 22) < TODAY) firstYear += 1;
const YEARS = [firstYear, firstYear + 1, firstYear + 2];
const Y0 = YEARS[0];
const GY0 = gregYear(nisan(Y0, 1));

function pesachCalendar(hy) {
  const d = n => nisan(hy, n);
  let shabbatHagadol = addDays(d(15), -1);
  while (!isShabbat(shabbatHagadol)) shabbatHagadol = addDays(shabbatHagadol, -1);
  // Search for chametz the night before 14 Nissan, or Thursday night when 14 Nissan is Shabbat.
  const erevShabbat = isShabbat(d(14));
  const bedikahDay = erevShabbat ? d(12) : d(13);
  return {
    hy, roshChodesh: d(1), shabbatHagadol, bedikahDay, erevShabbat,
    rebbeBirthday: d(11), erevPesach: d(14), first: d(15), second: d(16),
    shvii: d(21), acharon: d(22), rebbeChapter: hy - 5662 + 1,
  };
}

// ---------------------------------------------------------------- html helpers
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const normalizeHebrew = t => (t || '').replace(/ֵֽ|ֵֽ/g, 'ֵ');
const dayPath = n => '/nasi/' + n + '-nissan/';
const dayTitle = n => n === 13 ? 'Zot Chanukat HaMizbeach (Levi)' : DAYS[n - 1].short + ' (' + DAYS[n - 1].tribe + ')';

function jsonLd(obj) {
  return '<script type="application/ld+json">' + JSON.stringify(obj).replace(/</g, '\\u003c') + '</script>';
}

const ORG = { '@type': 'Organization', '@id': SITE + '/#org', name: SITE_NAME, url: SITE + '/', logo: { '@type': 'ImageObject', url: SITE + '/icons/icon-512x512.png', width: 512, height: 512 } };
const WEBSITE_REF = { '@id': SITE + '/#website' };

function breadcrumbLd(trail) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({ '@type': 'ListItem', position: i + 1, name: t.name, item: SITE + t.path })),
  };
}

function articleLd({ path, title, description, about, citation }) {
  const a = {
    '@type': 'Article',
    '@id': SITE + path + '#article',
    headline: title.length > 110 ? title.slice(0, 107) + '…' : title,
    description,
    inLanguage: 'en',
    url: SITE + path,
    mainEntityOfPage: SITE + path,
    image: OG_IMAGE,
    datePublished: '2026-11-23',
    dateModified: BUILD_DATE,
    author: { '@type': 'Person', name: AUTHOR },
    publisher: { '@id': ORG['@id'] },
    isPartOf: WEBSITE_REF,
  };
  if (about) a.about = about.map(name => ({ '@type': 'Thing', name }));
  if (citation) a.citation = citation;
  return a;
}

function faqLd(faqs) {
  return {
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') } })),
  };
}

function faqHtml(faqs, heading) {
  return `<section class="card" aria-labelledby="faq">
  <h2 id="faq">${esc(heading || 'Frequently asked questions')}</h2>
${faqs.map(f => `  <details>
    <summary>${esc(f.q)}</summary>
    <p>${f.a}</p>
  </details>`).join('\n')}
</section>`;
}

function crumbsHtml(trail) {
  return `<ol class="crumbs">${trail.map((t, i) => i === trail.length - 1
    ? `<li aria-current="page">${esc(t.name)}</li>`
    : `<li><a href="${t.path}">${esc(t.name)}</a></li>`).join('')}</ol>`;
}

function dayChips(current) {
  return `<ul class="chips">${DAYS.map((_, i) => {
    const n = i + 1;
    return `<li><a href="${dayPath(n)}"${n === current ? ' aria-current="page"' : ''}>${n} Nissan</a></li>`;
  }).join('')}</ul>`;
}

function layout({ path, title, description, ogType = 'article', trail, ld = [], body, robots = 'index, follow, max-image-preview:large, max-snippet:-1', canonical = true }) {
  const url = SITE + path;
  const graph = { '@context': 'https://schema.org', '@graph': [ORG, ...(trail ? [breadcrumbLd(trail)] : []), ...ld] };
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="robots" content="${robots}">
<meta name="author" content="${AUTHOR}">
${canonical ? `<link rel="canonical" href="${url}">\n` : ''}<meta name="theme-color" content="#f2ece7">
<meta property="og:site_name" content="${SITE_NAME}">
<meta property="og:type" content="${ogType}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Remember The Nasi: the daily Nasi and Yehi Ratzon for 1–13 Nissan">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${OG_IMAGE}">
<link rel="icon" href="/favicon.ico" type="image/x-icon">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Hebrew:wght@500;700&amp;family=Heebo:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="/pages.css?v=${CSS_VERSION}">
<script>try{var m=localStorage.getItem("theme-mode");if(!m){var l=localStorage.getItem("dark-mode");m=l==="enabled"?"dark":l==="disabled"?"light":"auto";}if(m==="dark"||(m==="auto"&&window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark");}}catch(e){}</script>
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","${GA_ID}");</script>
${jsonLd(graph)}
</head>
<body>
<header class="site-head">
  <div class="wrap">
    <a class="brand" href="/"><img src="/icons/icon-192x192.png" alt="" width="44" height="44"><span>Remember The Nasi</span></a>
    <div class="head-right">
      <a class="app-link" href="/">Today’s Nasi</a>
      <span class="bsd" lang="he" dir="rtl">בס"ד</span>
    </div>
  </div>
</header>
<main class="wrap">
${trail ? crumbsHtml(trail) + '\n' : ''}${body}
</main>
${footer()}
</body>
</html>
`;
}

function footer() {
  return `<footer class="site-foot">
  <div class="wrap">
    <nav aria-label="Site">
      <div>
        <h2>The Daily Nasi</h2>
        <ul>
          <li><a href="/">Today’s Nasi (app)</a></li>
          <li><a href="/nasi/">What is the Nasi?</a></li>
          <li><a href="/nasi/#yehi-ratzon">The Yehi Ratzon</a></li>
          <li><a href="/nasi/#days">All 13 days</a></li>
        </ul>
      </div>
      <div>
        <h2>Nasi by day</h2>
        <ul>
${DAYS.map((d, i) => `          <li><a href="${dayPath(i + 1)}">${i + 1} Nissan: ${esc(i === 12 ? 'Levi' : d.tribe)}</a></li>`).join('\n')}
        </ul>
      </div>
      <div>
        <h2>Nissan &amp; Pesach</h2>
        <ul>
          <li><a href="/nissan/">The month of Nissan</a></li>
          <li><a href="/nissan/#chabad">Chabad dates in Nissan</a></li>
          <li><a href="/pesach/">Chabad Pesach customs</a></li>
          <li><a href="/pesach/#seder">The Seder plate</a></li>
          <li><a href="/pesach/#moshiachs-seudah">Moshiach’s Seudah</a></li>
        </ul>
      </div>
    </nav>
    <div class="credits">
      <p>Nasi and Yehi Ratzon text reproduced with permission from <a href="http://kehot.com/">Kehot Publication Society</a>.</p>
      <p>Powered by <a href="https://totalis.one/?src=nasi">TOTALIS</a> · nasi@totalis.one</p>
    </div>
  </div>
</footer>`;
}

const out = [];
function write(rel, html) {
  const file = join(ROOT, rel);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
  out.push(rel);
}

// ---------------------------------------------------------------- day pages
const yearsLabel = YEARS.map(y => y).join(', ');

for (let n = 1; n <= 13; n++) {
  const d = DAYS[n - 1];
  const key = n + ' Nisan';
  const nasi = nasiData[key];
  const yehi = yehiData[key];
  const hasYehi = n !== 13;
  const path = dayPath(n);
  const ref = 'Numbers ' + d.verses;
  const firstDate = nisan(Y0, n);

  const baseTitle = n === 13 ? 'Nasi for 13 Nissan: Zot Chanukat HaMizbeach (Levi)' : `Nasi for ${n} Nissan: ${d.short} (${d.tribe})`;
  const title = baseTitle.length <= 46 ? baseTitle + ' – Hebrew & English' : baseTitle.length <= 53 ? baseTitle + ' – Full Text' : baseTitle;
  const description = n === 13
    ? `The Nasi for 13 Nissan (${HE_DAY[12]} ניסן), the day of the tribe of Levi: Numbers 7:84–8:4 in Hebrew and English. In ${Y0} it falls on ${g(firstDate)}.`
    : `The Nasi for ${n} Nissan (${HE_DAY[n - 1]} ניסן): the offering of ${d.short}, prince of the tribe of ${d.tribe} (${d.tribeAlt}), ${ref}, with the Yehi Ratzon in Hebrew and English. ${Y0}: ${g(firstDate)}.`;

  const intro = n === 13
    ? `<p class="lede">On the thirteenth day of Nissan we read the summary of all the princes’ offerings and the lighting of the Menorah (${ref}). It corresponds to the tribe of Levi (<span lang="he" dir="rtl">${d.tribeHe}</span>), and is said without a Yehi Ratzon.</p>`
    : `<p class="lede">On the ${ORDINAL[n - 1]} day of Nissan we read the offering of ${esc(d.en)} (<span lang="he" dir="rtl">${d.he}</span>), the Nasi (prince) of the tribe of ${d.tribe} (<span lang="he" dir="rtl">${d.tribeHe}</span>), from ${ref}, followed by the Yehi Ratzon prayer.</p>`;

  const notes = (DAY_NOTES[n] || []).map(p => `<p>${esc(p)}</p>`).join('\n  ');

  const prev = n > 1 ? `<a class="prev" href="${dayPath(n - 1)}"><small>← ${n - 1} Nissan</small><span>${esc(dayTitle(n - 1))}</span></a>` : `<a class="prev" href="/nasi/"><small>← Guide</small><span>What is the Nasi?</span></a>`;
  const next = n < 13 ? `<a class="next" href="${dayPath(n + 1)}"><small>${n + 1} Nissan →</small><span>${esc(dayTitle(n + 1))}</span></a>` : `<a class="next" href="/nissan/"><small>Next →</small><span>The month of Nissan</span></a>`;

  const body = `<article>
<h1>Nasi for ${n} Nissan · <span class="he" lang="he" dir="rtl">נשיא ${HE_DAY[n - 1]} ניסן</span></h1>
${intro}

<section class="card" aria-labelledby="at-a-glance">
  <h2 id="at-a-glance">Day ${n} of 13 at a glance</h2>
  <dl class="facts">
    <dt>Hebrew date</dt><dd>${n} Nissan (<span lang="he" dir="rtl">${HE_DAY[n - 1]} ניסן</span>)</dd>
    ${n === 13 ? `<dt>Reading</dt><dd>${esc(d.short)} (<span lang="he" dir="rtl">${d.he}</span>)</dd>` : `<dt>Nasi</dt><dd>${esc(d.en)} (<span lang="he" dir="rtl">${d.he}</span>)</dd>`}
    <dt>Tribe</dt><dd>${d.tribe}${d.tribeAlt !== d.tribe ? ' / ' + d.tribeAlt : ''} (<span lang="he" dir="rtl">${d.tribeHe}</span>)</dd>
    <dt>Verses</dt><dd>${ref} (Bamidbar, Parshat Naso${n === 13 ? ' – Behaalotecha' : ''})</dd>
    <dt>Yehi Ratzon</dt><dd>${hasYehi ? 'Yes, said after the reading' : 'Not said on 13 Nissan'}</dd>
${YEARS.map(y => `    <dt>${y}</dt><dd>${g(nisan(y, n))}</dd>`).join('\n')}
  </dl>
  <p class="note">A Jewish day begins at nightfall; the Nasi is said by day, usually after Shacharit. <a href="/">Open today’s Nasi in the app</a>.</p>
</section>

<section class="card" aria-labelledby="text-he">
  <h2 id="text-he">The Nasi reading in Hebrew · <span class="h-he" lang="he" dir="rtl">נשיא</span></h2>
  <p class="reading-he" lang="he" dir="rtl">${esc(normalizeHebrew(nasi.hebrew))}</p>
</section>

<section class="card" aria-labelledby="text-en">
  <h2 id="text-en">English translation</h2>
  <p class="reading-en">${esc(nasi.english)}</p>
</section>

${hasYehi ? `<section class="card" aria-labelledby="yehi">
  <h2 id="yehi">Yehi Ratzon for ${n} Nissan · <span class="h-he" lang="he" dir="rtl">יהי רצון</span></h2>
  <p class="label">Hebrew</p>
  <p class="reading-he" lang="he" dir="rtl">${esc(normalizeHebrew(yehi.hebrew))}</p>
  <p class="label">English</p>
  <p class="reading-en">${esc(yehi.english)}</p>
</section>
` : ''}
${notes ? `<section class="card" aria-labelledby="about-day">
  <h2 id="about-day">About ${n} Nissan</h2>
  ${notes}
</section>
` : ''}
<nav class="pager" aria-label="Previous and next day">
${prev}
${next}
</nav>

<section class="card" aria-labelledby="all-days">
  <h2 id="all-days">All 13 days of the Nasi</h2>
  ${dayChips(n)}
  <p>New to the custom? Read <a href="/nasi/">what the Nasi is and why it is said in Nissan</a>.</p>
</section>
</article>`;

  write(path.slice(1) + 'index.html', layout({
    path, title, description,
    trail: [{ name: 'Home', path: '/' }, { name: 'The Daily Nasi', path: '/nasi/' }, { name: n + ' Nissan', path }],
    ld: [articleLd({ path, title, description, about: ['Nasi', 'Nissan', n === 13 ? 'Tribe of Levi' : 'Tribe of ' + d.tribe, 'Yehi Ratzon'], citation: ref })],
    body,
  }));
}

// ---------------------------------------------------------------- /nasi/ guide
{
  const path = '/nasi/';
  const title = 'The Daily Nasi & Yehi Ratzon (1–13 Nissan): Complete Guide';
  const description = `A complete guide to the daily Nasi said on the first 13 days of Nissan: the reading of the princes’ offerings (Numbers 7), the Yehi Ratzon prayer, all 13 days with their tribes, and the dates for ${Y0}–${YEARS[2]}.`;
  const start = nisan(Y0, 1), end = nisan(Y0, 13);

  const faqs = [
    { q: 'What is the Nasi?', a: 'The Nasi (Hebrew נשיא, “prince”) is the daily reading, during the first days of Nissan, of the Torah passage in Numbers chapter 7 describing the offering one of the twelve tribal princes brought for the dedication of the Mishkan (Tabernacle). Each day of Nissan has its own Nasi.' },
    { q: 'When is the Nasi said?', a: 'Every day from 1 Nissan to 13 Nissan, including Shabbat. Most people say it after the morning prayers (Shacharit). Days 1–12 each have a tribe’s prince; on day 13 the closing passage for the tribe of Levi is read.' },
    { q: `When is the Nasi in ${GY0}?`, a: `In ${Y0} the Nasi is said from ${g(start)} (1 Nissan) to ${g(end)} (13 Nissan).` },
    { q: 'Why is the Nasi said in Nissan?', a: 'The Mishkan was set up on 1 Nissan, and for the next twelve days the princes of the twelve tribes each brought a dedication offering, one prince per day. Reading each day’s offering on its anniversary connects us with the dedication. Because each of those days was a festival for that tribe, Tachanun is not said all month.' },
    { q: 'What is the Yehi Ratzon said after the Nasi?', a: 'A short prayer asking that the holy sparks and lights of that day’s tribe shine on the person saying it, “if I, Your servant, am of the tribe” of that day, helping him understand Torah and serve G-d. It is said after the Nasi on days 1–12; on 13 Nissan the Nasi is said without a Yehi Ratzon.' },
    { q: 'What is read on 13 Nissan?', a: 'Numbers 7:84 to 8:4: the summary of all twelve offerings (“Zot Chanukat HaMizbeach”) and the first verses of Behaalotecha about lighting the Menorah. It corresponds to the tribe of Levi, whose share was Aharon’s lighting of the Menorah.' },
    { q: 'Where does the Nasi text come from?', a: 'The Hebrew is the text of the Torah, Numbers chapter 7. The Yehi Ratzon is printed in the siddur. The English translations on this site are reproduced with permission from Kehot Publication Society.' },
  ];

  const rows = DAYS.map((d, i) => {
    const n = i + 1;
    return `      <tr>
        <td><a href="${dayPath(n)}">${n} Nissan</a><span class="he" lang="he" dir="rtl">${HE_DAY[i]} ניסן</span></td>
        <td>${n === 13 ? 'Zot Chanukat HaMizbeach' : esc(d.short)}<span class="he" lang="he" dir="rtl">${d.he}</span></td>
        <td>${d.tribe}<span class="he" lang="he" dir="rtl">${d.tribeHe}</span></td>
        <td>${d.verses}</td>
        <td>${gs(nisan(Y0, n))}</td>
      </tr>`;
  }).join('\n');

  const body = `<article>
<h1>The Daily Nasi · <span class="he" lang="he" dir="rtl">הנשיא</span></h1>
<p class="lede">For the first thirteen days of the Hebrew month of Nissan, it is customary to read each day the Torah passage of that day’s Nasi, the prince of one of the tribes of Israel, followed by a short prayer, the Yehi Ratzon. Here is everything you need: what it is, when and how to say it, and the full text for every day.</p>

<section class="card" aria-labelledby="what">
  <h2 id="what">What is the Nasi?</h2>
  <p>The Mishkan, the portable Sanctuary the Jewish people built in the desert, was set up on the first day of Nissan, one year after the Exodus from Egypt. For the next twelve days, the leader (<em>Nasi</em>, plural <em>Nesiim</em>) of each of the twelve tribes brought a dedication offering for the altar, one tribe each day. The Torah records every one of them in full, in <strong>Numbers (Bamidbar) chapter 7</strong>, in Parshat Naso.</p>
  <p>Each prince brought exactly the same gift: a silver dish and a silver bowl filled with fine flour mixed with oil, a gold spoon filled with incense, animals for a burnt-offering, a goat for a sin-offering, and oxen, rams, goats and lambs for a peace-offering. Even so, the Torah repeats the whole list for every prince, teaching that each brought it with his own intention and his own meaning.</p>
  <p>The custom is to read each Nasi on the day of Nissan on which he brought his offering. The custom is mentioned by the Shelah HaKadosh and is followed in many communities; in Chabad it is printed in the siddur together with the Yehi Ratzon, and it is widely kept.</p>
</section>

<section class="card" aria-labelledby="when">
  <h2 id="when">When and how is it said?</h2>
  <ul>
    <li><strong>Days:</strong> 1 Nissan through 13 Nissan, every day including Shabbat. In ${Y0} that is <strong>${g(start)}</strong> to <strong>${g(end)}</strong>.</li>
    <li><strong>Time:</strong> by day, usually right after Shacharit (the morning prayers).</li>
    <li><strong>What:</strong> the verses of that day’s prince, read from a Chumash or siddur, then the Yehi Ratzon (days 1–12).</li>
    <li><strong>Day 13:</strong> the summary of all the offerings and the passage of the Menorah, for the tribe of Levi, without a Yehi Ratzon.</li>
  </ul>
  <p><a href="/">Remember The Nasi</a> shows today’s Nasi automatically according to the Hebrew date, in Hebrew, English or both, with reminders and an offline mode.</p>
</section>

<section class="card" aria-labelledby="yehi-ratzon">
  <h2 id="yehi-ratzon">The Yehi Ratzon prayer · <span class="h-he" lang="he" dir="rtl">יהי רצון</span></h2>
  <p>After the Nasi on each of the first twelve days, a short prayer is said. It asks that, if the person praying is from the tribe whose prince was read that day, all the holy sparks and lights of that tribe shine on him, helping him understand the Torah, fear G-d and do His will, together with his children and grandchildren.</p>
  <p>Since most people today do not know their tribe, the prayer is said every day. The Chabad custom is that everyone says it, Kohanim and Levi’im included. On 13 Nissan there is no Yehi Ratzon.</p>
  <p>The full Hebrew and English of each day’s Yehi Ratzon is on that day’s page below.</p>
</section>

<section class="card" aria-labelledby="days">
  <h2 id="days">All 13 days of the Nasi</h2>
  <p>Dates are for ${Y0} (${GY0}). Each day’s page has the full Hebrew and English text and the dates for ${yearsLabel}.</p>
  <div class="table-wrap">
    <table>
      <thead><tr><th scope="col">Day</th><th scope="col">Nasi</th><th scope="col">Tribe</th><th scope="col">Numbers</th><th scope="col">${GY0}</th></tr></thead>
      <tbody>
${rows}
      </tbody>
    </table>
  </div>
  <p>The order follows the tribes’ camps around the Mishkan: Yehuda, Yissachar and Zevulun to the east; Reuven, Shimon and Gad to the south; Ephraim, Menashe and Binyamin to the west; and Dan, Asher and Naftali to the north.</p>
</section>

<section class="card" aria-labelledby="dates">
  <h2 id="dates">Nasi dates for the coming years</h2>
  <div class="table-wrap">
    <table>
      <thead><tr><th scope="col">Hebrew year</th><th scope="col">1 Nissan</th><th scope="col">13 Nissan</th></tr></thead>
      <tbody>
${YEARS.map(y => `        <tr><td>${y}</td><td>${g(nisan(y, 1))}</td><td>${g(nisan(y, 13))}</td></tr>`).join('\n')}
      </tbody>
    </table>
  </div>
</section>

${faqHtml(faqs)}

<section class="card" aria-labelledby="more">
  <h2 id="more">More for Nissan</h2>
  <ul>
    <li><a href="/nissan/">The month of Nissan: customs, dates and Chabad days</a></li>
    <li><a href="/pesach/">Chabad Pesach customs: the Seder, shmurah matzah, gebrochts and Moshiach’s Seudah</a></li>
  </ul>
</section>
</article>`;

  write('nasi/index.html', layout({
    path, title, description,
    trail: [{ name: 'Home', path: '/' }, { name: 'The Daily Nasi', path }],
    ld: [
      articleLd({ path, title, description, about: ['Nasi', 'Nesiim', 'Nissan', 'Yehi Ratzon', 'Chabad'], citation: 'Numbers 7:1–8:4' }),
      faqLd(faqs),
      { '@type': 'ItemList', name: 'The 13 days of the Nasi', itemListElement: DAYS.map((d, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE + dayPath(i + 1), name: (i + 1) + ' Nissan: ' + (i === 12 ? 'Zot Chanukat HaMizbeach' : d.short) })) },
    ],
    body,
  }));
}

// ---------------------------------------------------------------- /nissan/
{
  const c = pesachCalendar(Y0);
  const path = '/nissan/';
  const title = `Nissan (Nisan) ${Y0} / ${GY0}: Customs, Dates & Chabad Days`;
  const description = `Everything about the Hebrew month of Nissan (Nisan): Rosh Chodesh Nissan, the daily Nasi, no Tachanun, Birkat HaIlanot, Shabbat HaGadol, 11 Nissan and other Chabad dates, and Pesach. Dates for ${Y0} (${GY0}).`;

  const faqs = [
    { q: `When is Rosh Chodesh Nissan ${GY0}?`, a: `Rosh Chodesh Nissan ${Y0} is on ${g(c.roshChodesh)}, beginning at nightfall the evening before. It is always a single day, because the month of Adar before it always has 29 days.` },
    { q: 'Why is Tachanun not said in Nissan?', a: 'The first twelve days of Nissan were each a festival for the prince who brought his offering that day, followed by Erev Pesach, the eight days of Pesach and Isru Chag. Since most of the month is festive, Tachanun is left out for the whole month.' },
    { q: 'Is it Nissan or Nisan?', a: 'Both. The Hebrew is ניסן. “Nisan” follows the Hebrew spelling more closely, and “Nissan” follows the common pronunciation. They are the same month.' },
    { q: 'What are the Chabad dates in Nissan?', a: '2 Nissan is the yahrzeit of the Rebbe Rashab and the start of the leadership of the Frierdiker Rebbe; 11 Nissan is the Lubavitcher Rebbe’s birthday; 13 Nissan is the yahrzeit of the Tzemach Tzedek.' },
    { q: 'What is Birkat HaIlanot?', a: 'A blessing said once a year on seeing fruit trees in blossom, thanking G-d for creating good trees for people to enjoy. In the Northern Hemisphere it is said in Nissan; in the Southern Hemisphere, ask a rabbi when to say it.' },
    { q: `When is Pesach ${GY0}?`, a: `Pesach ${Y0} begins at sundown on ${g(c.erevPesach)} with the first Seder, and lasts until nightfall on ${g(c.acharon)} outside Israel (${g(c.shvii)} in Israel).` },
  ];

  const timeline = [
    [c.roshChodesh, '1 Nissan', 'Rosh Chodesh Nissan', 'The first of the months. The Mishkan was set up on this day. The daily <a href="/nasi/">Nasi</a> begins, and Tachanun is not said for the whole month.'],
    [nisan(Y0, 2), '2 Nissan', 'Yahrzeit of the Rebbe Rashab', 'Rabbi Sholom DovBer Schneersohn, the fifth Chabad Rebbe, passed away on 2 Nissan 5680 (1920). It is also the day his son, the Frierdiker Rebbe, Rabbi Yosef Yitzchak Schneersohn, became Rebbe.'],
    [c.shabbatHagadol, nisanLabel(c.shabbatHagadol), 'Shabbat HaGadol', 'The Shabbat before Pesach. In the afternoon it is customary to read the Haggadah from “Avadim Hayinu” to “lechaper al kol avonoteinu”.'],
    [c.rebbeBirthday, '11 Nissan', 'The Rebbe’s birthday', `Birthday of the Lubavitcher Rebbe, Rabbi Menachem Mendel Schneerson, born 11 Nissan 5662 (1902). From this day the Rebbe’s new chapter of Tehillim is said: in ${Y0}, chapter ${c.rebbeChapter}.`],
    [nisan(Y0, 13), '13 Nissan', 'Yahrzeit of the Tzemach Tzedek; last day of the Nasi', 'Rabbi Menachem Mendel of Lubavitch, the third Chabad Rebbe, passed away on 13 Nissan 5626 (1866). The Nasi for the tribe of Levi is read, without a Yehi Ratzon.'],
    [c.bedikahDay, 'Night of ' + nisanLabel(addDays(c.bedikahDay, 1)), 'Bedikat Chametz', c.erevShabbat ? 'Because Erev Pesach falls on Shabbat this year, the search for chametz is on Thursday night.' : 'The search for chametz by candlelight, at nightfall.'],
    [c.erevPesach, '14 Nissan', 'Erev Pesach', 'Fast of the Firstborn (usually exempted by a siyum), burning the chametz in the morning, Seder Korban Pesach after Mincha, and the first Seder at night.'],
    [c.first, '15–22 Nissan', 'Pesach', 'Eight days outside Israel (seven in Israel). The Omer is counted from the second night. See <a href="/pesach/">Chabad Pesach customs</a>.'],
  ];

  const body = `<article>
<h1>The Month of Nissan · <span class="he" lang="he" dir="rtl">חודש ניסן</span></h1>
<p class="lede">Nissan (also spelled Nisan) is the month of redemption: the month of the Exodus, of the Mishkan’s dedication, and of Pesach. The Torah calls it “the first of the months”. Here are its customs, its Chabad dates, and when everything falls in ${Y0} (${GY0}).</p>

<section class="card" aria-labelledby="about">
  <h2 id="about">About the month of Nissan</h2>
  <p>“This month shall be for you the head of the months” (Exodus 12:2): counting from the Exodus, Nissan is the first month of the Jewish year, even though the year number changes on Rosh Hashanah in Tishrei. It is also called <em>Chodesh HaAviv</em>, the month of spring, because Pesach must always fall in the spring.</p>
  <p>Our Sages say, “In Nissan they were redeemed, and in Nissan they will be redeemed in the future.” The month is full of holy days: the dedication of the Mishkan on Rosh Chodesh, the twelve days of the princes’ offerings, and the festival of Pesach.</p>
  <p>In the weeks before, Parshat HaChodesh (Exodus 12:1–20) is read on the Shabbat before, or on, Rosh Chodesh Nissan.</p>
</section>

<section class="card" aria-labelledby="customs">
  <h2 id="customs">Customs of Nissan</h2>
  <h3>The daily Nasi</h3>
  <p>From 1 to 13 Nissan, the passage of that day’s tribal prince is read from Numbers chapter 7, followed by the Yehi Ratzon. <a href="/nasi/">Read the guide</a> or <a href="/">open today’s Nasi</a>.</p>
  <h3>No Tachanun all month</h3>
  <p>Tachanun is not said for the whole of Nissan, and eulogies and public fasts are avoided, because most of the month is festive.</p>
  <h3>Birkat HaIlanot, the blessing on the trees</h3>
  <p>On first seeing fruit trees in blossom, we bless G-d “who left nothing lacking in His world, and created in it good creatures and good trees for people to enjoy”. In the Northern Hemisphere this is in Nissan; in the Southern Hemisphere, ask a rabbi when to say it.</p>
  <h3>Maot Chittim</h3>
  <p>Before Pesach, it is customary to give charity so that every family has matzah, wine and everything it needs for the festival (also called Kimcha DePischa).</p>
  <h3>Preparing for Pesach</h3>
  <p>The month is spent cleaning for Pesach, selling chametz through a rabbi, and getting ready for the Seder. See <a href="/pesach/">Chabad Pesach customs</a>.</p>
</section>

<section class="card" aria-labelledby="calendar">
  <h2 id="calendar">Nissan ${Y0} calendar (${GY0})</h2>
  <div class="table-wrap">
    <table>
      <thead><tr><th scope="col">Date</th><th scope="col">Hebrew date</th><th scope="col">What</th></tr></thead>
      <tbody>
${timeline.slice().sort((x, y) => x[0] - y[0]).map(([d, heb, what, more]) => `        <tr><td>${gs(d)}</td><td>${heb}</td><td><strong>${what}.</strong> ${more}</td></tr>`).join('\n')}
      </tbody>
    </table>
  </div>
</section>

<section class="card" aria-labelledby="chabad">
  <h2 id="chabad">Chabad dates in Nissan</h2>
  <ul>
    <li><strong>2 Nissan</strong>: yahrzeit of the Rebbe Rashab, Rabbi Sholom DovBer Schneersohn (5680 / 1920), and the start of the leadership of the Frierdiker Rebbe, Rabbi Yosef Yitzchak Schneersohn.</li>
    <li><strong>11 Nissan</strong>: birthday of the Lubavitcher Rebbe, Rabbi Menachem Mendel Schneerson (5662 / 1902). The Rebbe’s chapter of Tehillim from 11 Nissan ${Y0} is chapter ${c.rebbeChapter}.</li>
    <li><strong>13 Nissan</strong>: yahrzeit of the Tzemach Tzedek, Rabbi Menachem Mendel of Lubavitch (5626 / 1866).</li>
  </ul>
  <p>Each of these falls during the days of the Nasi: <a href="${dayPath(2)}">2 Nissan</a>, <a href="${dayPath(11)}">11 Nissan</a> and <a href="${dayPath(13)}">13 Nissan</a>.</p>
</section>

${faqHtml(faqs)}
</article>`;

  write('nissan/index.html', layout({
    path, title, description,
    trail: [{ name: 'Home', path: '/' }, { name: 'The month of Nissan', path }],
    ld: [articleLd({ path, title, description, about: ['Nissan', 'Nisan', 'Hebrew calendar', 'Pesach', 'Chabad', 'Birkat HaIlanot'] }), faqLd(faqs)],
    body,
  }));
}

function nisanLabel(date) {
  return hebParts(date).day + ' Nissan';
}

// ---------------------------------------------------------------- /pesach/
{
  const c = pesachCalendar(Y0);
  const path = '/pesach/';
  const title = `Chabad Pesach Customs ${GY0}: Matzah, Gebrochts & the Seder`;
  const description = `Chabad-Lubavitch customs for Pesach (Passover): bedikat chametz, hand-baked shmurah matzah, no gebrochts, the Arizal’s Seder plate, Moshiach’s Seudah on Acharon shel Pesach, and the dates for Pesach ${Y0} (${GY0}).`;

  const faqs = [
    { q: `When is Pesach ${GY0}?`, a: `Pesach ${Y0} begins at sundown on ${g(c.erevPesach)} with the first Seder. Outside Israel it lasts eight days, until nightfall on ${g(c.acharon)}; in Israel seven days, until nightfall on ${g(c.shvii)}.` },
    { q: 'What is gebrochts?', a: 'Gebrochts (Yiddish for “broken”), or matzah shruya in Hebrew, is matzah that has come into contact with water or another liquid, such as matzah balls or matzah dipped in soup. Chabad, like many chassidic communities, does not eat gebrochts on Pesach, out of concern that a trace of unbaked flour in the matzah could become chametz on contact with water. The custom is lifted on the last day of Pesach.' },
    { q: 'What is Moshiach’s Seudah?', a: 'A festive meal on the afternoon of the last day of Pesach, instituted by the Baal Shem Tov, celebrating the future redemption whose light shines on that day. Matzah is eaten and four cups of wine are drunk. The Rebbe encouraged that it be held in every community.' },
    { q: 'What is on the Chabad Seder plate?', a: 'Three matzot under a cloth, and on top of them, following the Arizal: the zeroa (shank bone) top right, the beitzah (egg) top left, the maror in the centre, the charoset below right, the karpas below left, and the chazeret at the bottom.' },
    { q: 'What do Chabad use for karpas and maror?', a: 'For karpas, a raw onion or a boiled potato, dipped in salt water. For maror and chazeret, romaine lettuce and freshly grated horseradish.' },
    { q: 'Do Chabad use hand-made or machine matzah?', a: 'Hand-baked shmurah matzah, watched from the time the wheat is harvested. The Rebbe’s matzah campaign encourages every Jew to have hand-baked shmurah matzah for the Seder.' },
  ];

  const body = `<article>
<h1>Chabad Pesach Customs · <span class="he" lang="he" dir="rtl">מנהגי פסח</span></h1>
<p class="lede">Pesach (Passover) celebrates the Exodus from Egypt, “the season of our freedom”. Here are the customs kept in Chabad-Lubavitch, from the search for chametz to Moshiach’s Seudah on the last day, with the dates for Pesach ${Y0} (${GY0}).</p>
<p class="note">These are customs, not a full guide to the laws of Pesach. For practical questions, ask your rabbi.</p>

<section class="card" aria-labelledby="dates">
  <h2 id="dates">Pesach ${Y0} (${GY0}) dates</h2>
  <div class="table-wrap">
    <table>
      <thead><tr><th scope="col">Date</th><th scope="col">Hebrew date</th><th scope="col">What</th></tr></thead>
      <tbody>
        <tr><td>${gs(c.roshChodesh)} – ${gs(nisan(Y0, 13))}</td><td>1–13 Nissan</td><td>The daily <a href="/nasi/">Nasi</a></td></tr>
        <tr><td>${gs(c.shabbatHagadol)}</td><td>${nisanLabel(c.shabbatHagadol)}</td><td>Shabbat HaGadol</td></tr>
        <tr><td>${gs(c.bedikahDay)}, night</td><td>Night of ${nisanLabel(addDays(c.bedikahDay, 1))}</td><td>Bedikat chametz (search for chametz)</td></tr>
        <tr><td>${gs(c.erevPesach)}</td><td>14 Nissan</td><td>Erev Pesach: Fast of the Firstborn, burning the chametz; first Seder at night</td></tr>
        <tr><td>${gs(c.first)}</td><td>15 Nissan</td><td>First day of Pesach; second Seder at night (outside Israel)</td></tr>
        <tr><td>${gs(c.second)}</td><td>16 Nissan</td><td>Second day of Pesach; first day of the Omer</td></tr>
        <tr><td>${gs(addDays(c.second, 1))} – ${gs(addDays(c.shvii, -1))}</td><td>17–20 Nissan</td><td>Chol HaMoed</td></tr>
        <tr><td>${gs(c.shvii)}</td><td>21 Nissan</td><td>Shvi’i shel Pesach, the splitting of the Sea</td></tr>
        <tr><td>${gs(c.acharon)}</td><td>22 Nissan</td><td>Acharon shel Pesach: gebrochts, Moshiach’s Seudah (outside Israel)</td></tr>
      </tbody>
    </table>
  </div>
  <p>Coming years: Pesach ${YEARS[1]} begins the evening of ${g(pesachCalendar(YEARS[1]).erevPesach)}, and Pesach ${YEARS[2]} the evening of ${g(pesachCalendar(YEARS[2]).erevPesach)}.</p>
</section>

<section class="card" aria-labelledby="before">
  <h2 id="before">Before Pesach</h2>
  <h3>Maot Chittim</h3>
  <p>Charity before Pesach so that every family has what it needs for the festival.</p>
  <h3>Selling the chametz</h3>
  <p>Chametz that will not be destroyed is sold to a non-Jew through a rabbi before Pesach, and bought back afterwards.</p>
  <h3>Bedikat chametz, the search for chametz</h3>
  <p>On the night before Erev Pesach, the home is searched by the light of a candle, with a feather and a wooden spoon to gather any chametz into a paper bag. Following the Arizal, ten pieces of bread, each wrapped in paper, are put out around the house beforehand and found during the search. Afterwards Kol Chamira is said, cancelling any chametz that was not found.</p>
  <h3>Erev Pesach</h3>
  <p>Firstborn males fast, and usually take part in a siyum (the completion of a tractate) instead. The chametz is burned in the morning, and Kol Chamira is said again. After Mincha, Chabad custom is to recite the Seder Korban Pesach, the order of the Passover offering, printed in the siddur. Matzah is not eaten on Erev Pesach, so that it is eaten with appetite at the Seder.</p>
</section>

<section class="card" aria-labelledby="matzah">
  <h2 id="matzah">Matzah and the Pesach kitchen</h2>
  <h3>Hand-baked shmurah matzah</h3>
  <p>Chabad custom is to use hand-baked shmurah matzah, “guarded” from the time the wheat is harvested. The Zohar calls matzah “the food of faith” and “the food of healing”. The Rebbe’s matzah campaign encourages every Jew to have hand-baked shmurah matzah for the Seder.</p>
  <h3>No gebrochts</h3>
  <p>During Pesach, matzah is kept away from water and other liquids (<em>gebrochts</em>, or <em>matzah shruya</em>). Matzah stays covered on the table, liquids are poured carefully, and no matzah meal is cooked. On the last day of Pesach this is deliberately reversed, and gebrochts is eaten.</p>
  <h3>A careful kitchen</h3>
  <p>Many Chabad homes are especially stringent on Pesach, cooking from scratch, using few or no processed foods, and peeling fruit and vegetables.</p>
</section>

<section class="card" aria-labelledby="seder">
  <h2 id="seder">The Seder</h2>
  <p>The Seder is held on the first night of Pesach, and outside Israel on the second night too. Before the Seder, Chabad say the full Hallel with a blessing at the evening service in the synagogue.</p>
  <h3>The Seder plate, according to the Arizal</h3>
  <p>Three shmurah matzot are placed under a cloth: called Kohen, Levi and Yisrael from top to bottom. On top of them:</p>
  <ul>
    <li><strong>Zeroa</strong> (roasted shank bone), top right</li>
    <li><strong>Beitzah</strong> (hard-boiled egg), top left</li>
    <li><strong>Maror</strong> (bitter herbs), centre</li>
    <li><strong>Charoset</strong>, below right</li>
    <li><strong>Karpas</strong>, below left</li>
    <li><strong>Chazeret</strong> (more bitter herbs, for the sandwich), bottom centre</li>
  </ul>
  <p><strong>Karpas</strong> is a raw onion or a boiled potato, dipped in salt water. <strong>Maror</strong> and <strong>chazeret</strong> are romaine lettuce and freshly grated horseradish.</p>
  <h3>The Haggadah</h3>
  <p>Many follow the Haggadah with the Rebbe’s commentary and customs, “Haggadah shel Pesach im Likutei Ta’amim, Minhagim uBiurim”, published by Kehot.</p>
</section>

<section class="card" aria-labelledby="during">
  <h2 id="during">During Pesach</h2>
  <h3>Counting the Omer</h3>
  <p>The Omer is counted each night from the second night of Pesach for forty-nine days until Shavuot. In the Chabad count, the day is said “laOmer”.</p>
  <h3>Shvi’i shel Pesach</h3>
  <p>The seventh day, 21 Nissan, is the anniversary of the splitting of the Sea. Many stay awake on the night before, learning Torah.</p>
</section>

<section class="card" aria-labelledby="moshiachs-seudah">
  <h2 id="moshiachs-seudah">Acharon shel Pesach and Moshiach’s Seudah</h2>
  <p>The last day of Pesach (outside Israel, 22 Nissan; in ${Y0}, ${g(c.acharon)}) is connected with the future redemption: its Haftarah is Isaiah’s prophecy “A shoot will come forth from the stem of Jesse”, about Moshiach.</p>
  <p>On this day gebrochts is eaten deliberately. In the afternoon comes <strong>Moshiach’s Seudah</strong>, the Feast of Moshiach, instituted by the Baal Shem Tov: a festive meal with matzah and four cups of wine, with stories and songs about the coming redemption. The Rebbe encouraged that it be held in every community.</p>
</section>

${faqHtml(faqs)}

<section class="card" aria-labelledby="more">
  <h2 id="more">More for Nissan</h2>
  <ul>
    <li><a href="/nasi/">The daily Nasi, 1–13 Nissan</a></li>
    <li><a href="/nissan/">The month of Nissan: customs and Chabad dates</a></li>
  </ul>
</section>
</article>`;

  write('pesach/index.html', layout({
    path, title, description,
    trail: [{ name: 'Home', path: '/' }, { name: 'Chabad Pesach customs', path }],
    ld: [articleLd({ path, title, description, about: ['Pesach', 'Passover', 'Chabad', 'Seder', 'Shmurah matzah', 'Gebrochts', 'Moshiach’s Seudah'] }), faqLd(faqs)],
    body,
  }));
}

// ---------------------------------------------------------------- 404
write('404.html', layout({
  path: '/404.html',
  title: 'Page not found – Remember The Nasi',
  description: 'This page could not be found. Read today’s Nasi, or find any day of the Nasi from 1 to 13 Nissan.',
  robots: 'noindex, follow',
  canonical: false,
  ogType: 'website',
  body: `<article>
<h1>Page not found</h1>
<p class="lede">This page doesn’t exist. Here is where you might have been going.</p>
<section class="card" aria-labelledby="go">
  <h2 id="go">Read the Nasi</h2>
  <p><a href="/">Open today’s Nasi</a>, or choose a day:</p>
  ${dayChips(0)}
  <p><a href="/nasi/">What is the Nasi?</a> · <a href="/nissan/">The month of Nissan</a> · <a href="/pesach/">Chabad Pesach customs</a></p>
</section>
</article>`,
}));

// ---------------------------------------------------------------- sitemap
const urls = [
  ['/', '1.0', 'weekly'],
  ['/nasi/', '0.9', 'monthly'],
  ...DAYS.map((_, i) => [dayPath(i + 1), '0.8', 'yearly']),
  ['/nissan/', '0.8', 'monthly'],
  ['/pesach/', '0.8', 'monthly'],
];
writeFileSync(join(ROOT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([p, pr, cf]) => `  <url><loc>${SITE}${p}</loc><lastmod>${BUILD_DATE}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`).join('\n')}
</urlset>
`);
out.push('sitemap.xml');

console.log('Years: ' + YEARS.join(', ') + ' (1 Nisan ' + Y0 + ' = ' + g(nisan(Y0, 1)) + ')');
console.log('Wrote ' + out.length + ' files:\n  ' + out.join('\n  '));
