#!/usr/bin/env node
/**
 * Qo'llanma kontent generatori: docs/help/CONTENT.md -> src/lib/help/content.ts
 *
 * Ishlatish (frontend/ ichida):
 *   node scripts/gen-help-content.mjs                 # yozadi (variant: fixed)
 *   node scripts/gen-help-content.mjs --check         # faqat tekshiradi, yozmaydi
 *   node scripts/gen-help-content.mjs --variant now   # [BEKZOD-TUZATMOQDA] -> @now
 *   node scripts/gen-help-content.mjs --in <CONTENT.md> --out <content.ts>
 *
 * Parser qat'iy: CONTENT.md boshidagi "Format qoidalari"dan chetga chiqqan har
 * qanday qator (noma'lum blok, noma'lum maydon, takror maydon, noto'g'ri teg,
 * mavjud bo'lmagan slug havolasi) `CONTENT.md:<qator>: <sabab>` bilan to'xtaydi.
 *
 * Qayta ishlash qoidalari (SPEC §13.2):
 *  - `[BEKZOD-TUZATMOQDA #n]` savolida `field@<variant>` olinadi va `@`siz
 *    maydonga aylanadi; ikkinchi variant va belgi tashlanadi.
 *  - `[TEKSHIRILMAGAN …]` — belgi turgan jumla bilan birga olib tashlanadi
 *    (ogohlantirish chiqadi). Hal qilinganlarini CONTENT.md'da tuzating.
 *  - Raqam guruhlari orasidagi bo'sh joy (`300 000`) NBSP ga aylanadi.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ---------------------------------------------------------------- args
const argv = process.argv.slice(2);
function arg(name, def) {
  const i = argv.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = argv[i + 1];
  if (!v || v.startsWith('--')) die(`--${name} qiymatsiz`);
  return v;
}
const IN = path.resolve(arg('in', path.join(ROOT, '..', 'docs', 'help', 'CONTENT.md')));
const OUT = path.resolve(arg('out', path.join(ROOT, 'src', 'lib', 'help', 'content.ts')));
const VARIANT = arg('variant', 'fixed');
const CHECK = argv.includes('--check');
if (!['fixed', 'now'].includes(VARIANT)) die(`--variant faqat "fixed" yoki "now" (berilgan: ${VARIANT})`);

function die(msg) {
  console.error(`XATO: ${msg}`);
  process.exit(1);
}

const REL = path.relative(process.cwd(), IN) || IN;
class ContentError extends Error {}
function fail(line, msg) {
  throw new ContentError(`${REL}:${line}: ${msg}`);
}
const warnings = [];
function warn(line, msg) {
  warnings.push(`${REL}:${line}: ${msg}`);
}

// ---------------------------------------------------------------- reference data
/** Backend module catalogue keys (backend/src/platform/module/module-catalogue.constants.ts). */
const MODULE_KEYS = new Set([
  'students', 'groups', 'attendance', 'schedule', 'teachers', 'staff_roles', 'payments', 'finance',
  'payroll', 'reminders', 'telegram', 'portal', 'assignments', 'reports', 'leads', 'branches',
]);
/** Must match src/lib/help/icons.ts. */
const ICONS = new Set([
  'Rocket', 'MessagesSquare', 'CreditCard', 'ClipboardCheck', 'Users', 'FileText', 'CalendarDays', 'Coins',
  'Wallet', 'UserPlus', 'Building2', 'ShieldCheck', 'Smartphone', 'Package', 'BookOpen', 'LifeBuoy',
]);
const ROLES = new Set(['all', 'admin', 'teacher']);
const RISKS = new Set(['safe', 'careful', 'irreversible']);

function readOrDie(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    die(`fayl o'qilmadi: ${p}`);
  }
}
const navSrc = readOrDie(path.join(ROOT, 'src', 'lib', 'nav', 'items.ts'));
const NAV_HREFS = new Set([...navSrc.matchAll(/href:\s*'([^']+)'/g)].map((m) => m[1]));
NAV_HREFS.add('/profile');
NAV_HREFS.add('/help');
const permSrc = readOrDie(path.join(ROOT, 'src', 'lib', 'rbac', 'permissions.ts'));
const PERMISSIONS = new Set([...permSrc.matchAll(/'([a-z_]+\.[a-z_]+)'/g)].map((m) => m[1]));
PERMISSIONS.add('@manage');
// The frontend catalogue lacks some codes (user.*, room.*, transaction.correct);
// the backend's @RequirePermissions decorators are the source of truth when present.
const BACKEND_SRC = path.join(ROOT, '..', 'backend', 'src');
const STRICT_PERMS = fs.existsSync(BACKEND_SRC);
if (STRICT_PERMS) {
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.ts')) {
        const s = fs.readFileSync(p, 'utf8');
        for (const m of s.matchAll(/RequirePermissions?\(([^)]*)\)/g))
          for (const c of m[1].matchAll(/'([a-z_]+\.[a-z_]+)'/g)) PERMISSIONS.add(c[1]);
      }
    }
  };
  walk(BACKEND_SRC);
}

// ---------------------------------------------------------------- text helpers
const NBSP = ' ';
function nbsp(s) {
  return s.replace(/(\d) (?=\d{3}(?!\d))/g, `$1${NBSP}`);
}

/** Drop every `[TEKSHIRILMAGAN …]` together with the sentence it annotates. */
function stripUnverified(text, line, where) {
  let out = text;
  for (;;) {
    const m = /\s*\[TEKSHIRILMAGAN[^\]]*\]/.exec(out);
    if (!m) break;
    const before = out.slice(0, m.index);
    const after = out.slice(m.index + m[0].length);
    // start of the sentence the marker closes: after the previous ". " / "? " / "! "
    const trimmed = before.replace(/\s+$/, '');
    let start = 0;
    const re = /[.!?]["»”]?\s+(?=\S)/g;
    let b;
    while ((b = re.exec(trimmed)) && b.index + b[0].length < trimmed.length) start = b.index + b[0].length;
    const removed = trimmed.slice(start).trim();
    out = (trimmed.slice(0, start) + after).replace(/\s+$/, '').replace(/^\s+/, '');
    warn(line, `${where}: [TEKSHIRILMAGAN] jumla olib tashlandi: "${removed}"`);
  }
  return out;
}

/** Inline list-item form: `text [BEKZOD-TUZATMOQDA #n: tuzatilgach "X" — …]`. */
function resolveInlineBekzod(text, line) {
  const m = /^(.*?)\s*\[BEKZOD-TUZATMOQDA #(\d+)(?::\s*tuzatilgach\s+"([^"]+)")?[^\]]*\]\s*$/.exec(text);
  if (!m) {
    if (text.includes('[BEKZOD')) fail(line, 'tushunarsiz [BEKZOD-TUZATMOQDA] belgisi');
    return text;
  }
  if (VARIANT === 'fixed') {
    if (!m[3]) fail(line, `[BEKZOD-TUZATMOQDA #${m[2]}] ichida tuzatilgan matn ("tuzatilgach \\"…\\"") yo'q`);
    return m[3];
  }
  return m[1];
}

function clean(text, line, where) {
  const t = nbsp(stripUnverified(text, line, where).trim());
  if (/\[BEKZOD|\[TEKSHIRILMAGAN|@now|@fixed/.test(t)) fail(line, `${where}: ishlov berilmagan belgi qoldi`);
  return t;
}

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[‘’ʻʼ`´']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function checkSlug(slug, line) {
  if (!SLUG_RE.test(slug)) fail(line, `noto'g'ri slug: "${slug}" (faqat a-z, 0-9, "-")`);
}

/** Validate one tag value set; `-` or missing = none. */
function tagValue(key, raw, line) {
  const v = raw.trim();
  if (v === '-' || v === '') return undefined;
  if (key === 'roles' && !ROLES.has(v)) fail(line, `roles noto'g'ri: "${v}" (all|admin|teacher)`);
  if (key === 'module' && !MODULE_KEYS.has(v)) fail(line, `noma'lum modul: "${v}"`);
  if (key === 'permission' && !PERMISSIONS.has(v)) {
    if (STRICT_PERMS) fail(line, `noma'lum ruxsat kodi: "${v}"`);
    warn(line, `ruxsat kodi tekshirilmadi (backend/src topilmadi): "${v}"`);
  }
  return v;
}

/** Trailing `| module: x | roles: y | permission: z` segments of a list item. */
function splitTags(segments, line) {
  const tag = {};
  const rest = [];
  for (const seg of segments) {
    const m = /^(module|roles|permission):\s*(.*)$/.exec(seg.trim());
    if (m) {
      if (m[1] in tag) fail(line, `takror teg: ${m[1]}`);
      const v = tagValue(m[1], m[2], line);
      if (v !== undefined) tag[m[1]] = v;
    } else {
      if (Object.keys(tag).length) fail(line, `tegdan keyin kutilmagan qism: "${seg.trim()}"`);
      rest.push(seg.trim());
    }
  }
  return { tag, rest };
}

// ---------------------------------------------------------------- split into blocks
const src = readOrDie(IN).replace(/\r\n/g, '\n');
const lines = src.split('\n');

/** @type {{kind:string, arg:string, line:number, body:{text:string,line:number}[]}[]} */
const blocks = [];
let cur = null;
lines.forEach((text, i) => {
  const n = i + 1;
  if (text.startsWith('## ')) {
    cur = { header: text.slice(3).trim(), line: n, body: [] };
    blocks.push(cur);
    return;
  }
  if (!cur) {
    // preamble: title + author line only
    if (text.trim() === '' || text.startsWith('# ') || /^Muallif:/.test(text)) return;
    fail(n, `birinchi "## " blokidan oldin kutilmagan qator: "${text}"`);
  }
  cur.body.push({ text, line: n });
});

// ---------------------------------------------------------------- result containers
const data = {
  synonyms: [],
  chips: {},
  checklists: {},
  teacherBrief: null,
  safeList: null,
  timelines: [],
  sections: [],
  order: [],
  glossary: null,
  errors: null,
};
const tips = [];

/** Body lines without blanks and `---` separators. */
function meaningful(body) {
  return body.filter((l) => l.text.trim() !== '' && l.text.trim() !== '---');
}

function takeKV(body, key, blockLine, required = true) {
  const idx = body.findIndex((l) => l.text.startsWith(`${key}:`));
  if (idx === -1) {
    if (required) fail(blockLine, `"${key}:" qatori yo'q`);
    return undefined;
  }
  const [l] = body.splice(idx, 1);
  return { value: l.text.slice(key.length + 1).trim(), line: l.line };
}

// ---------------------------------------------------------------- block parsers
function parseSynonyms(block) {
  for (const l of meaningful(block.body)) {
    if (!l.text.startsWith('- ')) fail(l.line, 'synonyms: har qator "- a, b, c" ko\'rinishida bo\'lishi kerak');
    const group = l.text.slice(2).split(',').map((s) => s.trim()).filter(Boolean);
    if (group.length < 2) fail(l.line, 'sinonim guruhida kamida 2 so\'z bo\'lishi kerak');
    data.synonyms.push(group);
  }
}

function parseChips(block, aud) {
  if (data.chips[aud]) fail(block.line, `chips: ${aud} takror`);
  data.chips[aud] = meaningful(block.body).map((l) => {
    const m = /^- (.+?) -> ([a-z0-9-]+)$/.exec(l.text);
    if (!m) fail(l.line, 'chip formati: "- Matn -> slug"');
    return { label: m[1].trim(), slug: m[2], _line: l.line };
  });
}

function parseChecklist(block, aud) {
  if (data.checklists[aud]) fail(block.line, `checklist: ${aud} takror`);
  const body = meaningful(block.body);
  const title = takeKV(body, 'Sarlavha', block.line).value;
  const hint = takeKV(body, 'Izoh', block.line).value;
  const items = body.map((l) => {
    const m = /^\d+\. (.+)$/.exec(l.text);
    if (!m) fail(l.line, 'checklist bandi formati: "N. id | sarlavha | izoh | link: … | how: …"');
    const segs = m[1].split('|');
    const pos = [];
    const kv = {};
    for (const s of segs) {
      const km = /^(link|how|module|roles|permission):\s*(.*)$/.exec(s.trim());
      if (km) {
        if (km[1] in kv) fail(l.line, `takror maydon: ${km[1]}`);
        kv[km[1]] = km[2].trim();
      } else {
        if (Object.keys(kv).length) fail(l.line, `kalit-qiymatdan keyin kutilmagan qism: "${s.trim()}"`);
        pos.push(s.trim());
      }
    }
    if (pos.length !== 3) fail(l.line, `checklist bandida 3 ta pozitsion qism kerak (id | sarlavha | izoh), topildi ${pos.length}`);
    checkSlug(pos[0], l.line);
    const item = { id: pos[0], title: clean(pos[1], l.line, pos[0]), desc: clean(pos[2], l.line, pos[0]) };
    if (kv.link !== undefined) {
      if (!NAV_HREFS.has(kv.link)) fail(l.line, `link menyuda yo'q: ${kv.link}`);
      item.link = kv.link;
    }
    if (kv.how !== undefined) item.how = kv.how;
    for (const k of ['roles', 'module', 'permission']) {
      if (kv[k] !== undefined) {
        const v = tagValue(k, kv[k], l.line);
        if (v !== undefined) item[k] = v;
      }
    }
    item._line = l.line;
    return item;
  });
  if (!items.length) fail(block.line, 'checklist bo\'sh');
  data.checklists[aud] = { title, hint, items };
}

function parseTeacherBrief(block) {
  if (data.teacherBrief) fail(block.line, 'teacher-brief takror');
  const body = block.body.filter((l) => l.text.trim() !== '---');
  const title = takeKV(body, 'Sarlavha', block.line).value;
  const hint = takeKV(body, 'Izoh', block.line).value;
  const mi = body.findIndex((l) => l.text.trim() === 'Matn:');
  if (mi === -1) fail(block.line, '"Matn:" qatori yo\'q');
  const textLines = [];
  for (const l of body.slice(mi + 1)) {
    if (l.text.trim() === '') continue;
    if (!l.text.startsWith('  ')) fail(l.line, 'teacher-brief matni 2 bo\'sh joy bilan boshlanishi kerak');
    textLines.push(l.text.slice(2));
  }
  for (const l of body.slice(0, mi)) if (l.text.trim() !== '') fail(l.line, `kutilmagan qator: "${l.text}"`);
  if (!textLines.length) fail(block.line, 'teacher-brief matni bo\'sh');
  data.teacherBrief = { title, hint, text: clean(textLines.join('\n'), block.line, 'teacher-brief') };
}

function parseListItems(body, where) {
  return body.map((l) => {
    if (!l.text.startsWith('- ')) fail(l.line, `${where}: band "- " bilan boshlanishi kerak`);
    const { tag, rest } = splitTags(l.text.slice(2).split('|'), l.line);
    return { rest, tag, line: l.line };
  });
}

function parseSafeList(block) {
  if (data.safeList) fail(block.line, 'safe-list takror');
  const body = meaningful(block.body);
  const split = body.findIndex((l) => l.text.startsWith('### '));
  const head = split === -1 ? body : body.slice(0, split);
  const tail = split === -1 ? [] : body.slice(split + 1);
  if (split !== -1 && body[split].text.trim() !== '### qaytmaydi:') fail(body[split].line, `noma'lum kichik blok: "${body[split].text}"`);
  if (split === -1) fail(block.line, '"### qaytmaydi:" qismi yo\'q');
  const title = takeKV(head, 'Sarlavha', block.line).value;
  const hint = takeKV(head, 'Izoh', block.line).value;
  const irreversibleTitle = takeKV(tail, 'Sarlavha', body[split].line).value;
  const mk = (items) =>
    parseListItems(items, 'safe-list').map(({ rest, tag, line }) => {
      if (rest.length !== 1) fail(line, 'safe-list bandi: "- matn | teglar"');
      return { text: clean(rest[0], line, 'safe-list'), ...tag };
    });
  data.safeList = { title, hint, items: mk(head), irreversibleTitle, irreversible: mk(tail) };
}

function parseTimeline(block, section) {
  checkSlug(section, block.line);
  const body = meaningful(block.body);
  const title = takeKV(body, 'Sarlavha', block.line).value;
  const hint = takeKV(body, 'Izoh', block.line).value;
  const items = parseListItems(body, 'timeline').map(({ rest, tag, line }) => {
    if (rest.length !== 2) fail(line, 'timeline bandi: "- sana | matn | teglar"');
    return { label: nbsp(rest[0]), text: clean(rest[1], line, 'timeline'), ...tag };
  });
  data.timelines.push({ section, title, hint, items, _line: block.line });
}

function parseTip(block, section) {
  const body = meaningful(block.body);
  if (!body.length) fail(block.line, 'tip bo\'sh');
  tips.push({ section, text: clean(body.map((l) => l.text.trim()).join(' '), block.line, `tip ${section}`), line: block.line });
}

function parseGlossary(block) {
  if (data.glossary) fail(block.line, 'glossary takror');
  const body = meaningful(block.body);
  const title = takeKV(body, 'Sarlavha', block.line).value;
  const seen = new Set();
  const items = parseListItems(body, 'glossary').map(({ rest, tag, line }) => {
    if (rest.length !== 1) fail(line, 'glossary bandi: "- Atama: izoh | teglar"');
    const m = /^([^:]+):\s+(.+)$/.exec(rest[0]);
    if (!m) fail(line, 'glossary bandi: "Atama: izoh"');
    const slug = `g-${slugify(m[1])}`;
    if (seen.has(slug)) fail(line, `takror atama: ${m[1]}`);
    seen.add(slug);
    return { slug, term: m[1].trim(), text: clean(resolveInlineBekzod(m[2], line), line, m[1]), ...tag };
  });
  data.glossary = { slug: 'lugat', title, items };
  data.order.push('lugat');
}

function parseErrors(block) {
  if (data.errors) fail(block.line, 'errors takror');
  data.errors = parseListItems(meaningful(block.body), 'errors').map(({ rest, tag, line }) => {
    if (rest.length !== 2) fail(line, 'errors bandi: "- \\"xabar\\" | izoh | teglar"');
    const m = /^"(.+)"$/.exec(rest[0]);
    if (!m) fail(line, 'xabar qo\'shtirnoq ichida bo\'lishi kerak');
    return { message: m[1], text: clean(rest[1], line, 'errors'), ...tag };
  });
}

// ---- sections + questions
const Q_FIELDS = new Set(['keywords', 'answer', 'steps', 'example', 'undo', 'parent_reply', 'link', 'note', 'see']);
const VARIANT_FIELDS = new Set(['answer', 'steps', 'example', 'note']);
const MULTILINE = new Set(['parent_reply', 'note', 'example']);
const BEKZOD_RE = /^\[BEKZOD-TUZATMOQDA #(\d+)\]$/;

function parseSection(block) {
  const parts = block.header.slice('section:'.length).split('|').map((s) => s.trim());
  if (parts.length !== 6) fail(block.line, 'section formati: "slug | Sarlavha | icon: X | roles: r | module: m | permission: p"');
  const [slug, title, ...kv] = parts;
  checkSlug(slug, block.line);
  const keys = ['icon', 'roles', 'module', 'permission'];
  const vals = {};
  kv.forEach((s, i) => {
    const m = new RegExp(`^${keys[i]}:\\s*(.*)$`).exec(s);
    if (!m) fail(block.line, `section: ${i + 3}-qism "${keys[i]}: …" bo'lishi kerak`);
    vals[keys[i]] = m[1].trim();
  });
  if (!ICONS.has(vals.icon)) warn(block.line, `noma'lum ikonka "${vals.icon}" — CircleHelp ishlatiladi`);
  const roles = tagValue('roles', vals.roles, block.line);
  if (!roles) fail(block.line, 'section roles majburiy');
  const section = { slug, title, icon: vals.icon, roles, intro: '', questions: [], _line: block.line };
  const module = tagValue('module', vals.module, block.line);
  const permission = tagValue('permission', vals.permission, block.line);
  if (module) section.module = module;
  if (permission) section.permission = permission;

  // split body into intro + questions
  let q = null;
  let field = null; // { name, line, lines[] , list? }
  const qs = [];
  const finishField = () => {
    field = null;
  };
  for (const l of block.body) {
    const t = l.text;
    if (t.startsWith('### ')) {
      const m = /^### q: ([^|]+)\|(.+)$/.exec(t);
      if (!m) fail(l.line, 'savol sarlavhasi: "### q: slug | Savol matni"');
      q = { slug: m[1].trim(), title: m[2].trim(), line: l.line, meta: null, fields: {} };
      checkSlug(q.slug, l.line);
      qs.push(q);
      finishField();
      continue;
    }
    if (!q) {
      if (t.trim() === '' || t.trim() === '---') continue;
      if (t.startsWith('Intro:')) {
        if (section.intro) fail(l.line, 'Intro takror');
        section.intro = clean(t.slice(6), l.line, `${slug} intro`);
        continue;
      }
      fail(l.line, `bo'lim boshida kutilmagan qator: "${t}"`);
    }
    if (t.trim() === '' || t.trim() === '---') {
      finishField();
      continue;
    }
    if (/^roles:.*\|/.test(t)) {
      if (q.meta) fail(l.line, 'meta qatori takror');
      if (Object.keys(q.fields).length) fail(l.line, 'meta qatori savol sarlavhasidan keyin birinchi bo\'lishi kerak');
      const segs = t.split('|').map((s) => s.trim());
      const mk = ['roles', 'module', 'permission', 'risk', 'who'];
      if (segs.length !== 5) fail(l.line, 'meta: "roles | module | permission | risk | who" — 5 qism');
      const meta = {};
      segs.forEach((s, i) => {
        const m = new RegExp(`^${mk[i]}:\\s*(.*)$`).exec(s);
        if (!m) fail(l.line, `meta: ${i + 1}-qism "${mk[i]}: …" bo'lishi kerak`);
        meta[mk[i]] = m[1].trim();
      });
      if (!RISKS.has(meta.risk)) fail(l.line, `risk noto'g'ri: "${meta.risk}"`);
      if (!meta.who || meta.who === '-') fail(l.line, 'who majburiy');
      q.meta = {
        roles: tagValue('roles', meta.roles, l.line),
        module: tagValue('module', meta.module, l.line),
        permission: tagValue('permission', meta.permission, l.line),
        risk: meta.risk,
        who: meta.who,
      };
      finishField();
      continue;
    }
    const fm = /^([a-z_]+)(@(now|fixed))?:(?: (.*))?$/.exec(t);
    if (fm && !t.startsWith('  ')) {
      const [, base, , variant, rest] = fm;
      if (!Q_FIELDS.has(base)) fail(l.line, `noma'lum maydon: "${base}"`);
      if (variant && !VARIANT_FIELDS.has(base)) fail(l.line, `"${base}" maydonida @variant bo'lmaydi`);
      const name = variant ? `${base}@${variant}` : base;
      if (name in q.fields) fail(l.line, `takror maydon: ${name}`);
      if (!q.meta) fail(l.line, 'meta qatori (roles | … | who) maydonlardan oldin bo\'lishi kerak');
      field = { name, base, line: l.line, lines: rest !== undefined && rest.trim() !== '' ? [rest.trim()] : [] };
      q.fields[name] = field;
      if (base !== 'steps' && !field.lines.length) fail(l.line, `"${name}" bo'sh`);
      if (base === 'steps' && field.lines.length) fail(l.line, 'steps: qadamlar keyingi qatorlarda "1. …" ko\'rinishida');
      continue;
    }
    if (/^\d+\. /.test(t)) {
      if (!field || field.base !== 'steps') fail(l.line, 'raqamli qator faqat "steps:" ostida bo\'ladi');
      const n = Number(t.split('.')[0]);
      if (n !== field.lines.length + 1) fail(l.line, `qadam raqami ketma-ket emas (kutilgan ${field.lines.length + 1})`);
      field.lines.push(t.replace(/^\d+\. /, '').trim());
      continue;
    }
    if (t.startsWith('  ')) {
      if (!field || !MULTILINE.has(field.base)) fail(l.line, 'davom qatori (2 bo\'sh joy) faqat parent_reply/note/example ostida');
      field.lines.push(t.trim());
      continue;
    }
    fail(l.line, `tushunarsiz qator: "${t}"`);
  }
  if (!section.intro) fail(block.line, `"${slug}" bo'limida Intro yo'q`);
  if (!qs.length) fail(block.line, `"${slug}" bo'limida savol yo'q`);

  for (const raw of qs) section.questions.push(buildQuestion(raw, slug));
  data.sections.push(section);
  data.order.push(slug);
}

function buildQuestion(raw, sectionSlug) {
  const { fields, line } = raw;
  if (!raw.meta) fail(line, `"${raw.slug}": meta qatori yo'q`);
  const variants = Object.keys(fields).filter((k) => k.includes('@'));
  const noteBase = fields.note?.lines.join('\n').trim();
  const marker = noteBase !== undefined ? BEKZOD_RE.exec(noteBase) : null;
  if (noteBase && noteBase.includes('[BEKZOD') && !marker) fail(fields.note.line, 'note: [BEKZOD-TUZATMOQDA #n] belgisi yolg\'iz turishi kerak');
  if (variants.length && !marker) fail(line, `"${raw.slug}": @variant maydonlar bor, lekin note: [BEKZOD-TUZATMOQDA #n] belgisi yo'q`);
  if (marker && !variants.length) fail(line, `"${raw.slug}": [BEKZOD-TUZATMOQDA] belgisi bor, lekin @now/@fixed maydonlar yo'q`);
  if (marker) delete fields.note;

  const pick = (base) => {
    const plain = fields[base];
    const chosen = fields[`${base}@${VARIANT}`];
    const other = fields[`${base}@${VARIANT === 'fixed' ? 'now' : 'fixed'}`];
    if (plain && (chosen || other)) fail(plain.line, `"${raw.slug}": "${base}" va "${base}@…" birga bo'lmaydi`);
    return plain ?? chosen;
  };

  const where = (f) => `${raw.slug}.${f}`;
  const txt = (base) => {
    const f = pick(base);
    if (!f) return undefined;
    if (!f.lines.length) fail(f.line, `"${f.name}" bo'sh`);
    const out = f.lines.map((s) => clean(s, f.line, where(base))).filter(Boolean);
    return out.length ? out : undefined;
  };

  const q = { slug: raw.slug, title: nbsp(raw.title), roles: raw.meta.roles ?? 'all' };
  if (raw.meta.module) q.module = raw.meta.module;
  if (raw.meta.permission) q.permission = raw.meta.permission;
  q.risk = raw.meta.risk;
  q.who = raw.meta.who;

  const kw = fields.keywords;
  if (!kw) fail(line, `"${raw.slug}": keywords yo'q`);
  q.keywords = kw.lines.join(' ').split(',').map((s) => s.trim()).filter(Boolean);

  const answer = txt('answer');
  if (!answer) fail(line, `"${raw.slug}": answer yo'q (variant: ${VARIANT})`);
  if (answer.length !== 1) fail(line, `"${raw.slug}": answer bitta qator bo'lishi kerak`);
  q.answer = answer[0];

  const stepsField = pick('steps');
  if (stepsField) {
    if (!stepsField.lines.length) fail(stepsField.line, `"${stepsField.name}" bo'sh`);
    // A step may carry its own tag: "4. text | roles: admin" (hidden -> dropped, renumbered).
    q.steps = stepsField.lines.map((s) => {
      const { tag, rest } = splitTags(s.split(' | '), stepsField.line);
      if (rest.length !== 1) fail(stepsField.line, `qadamda "|" faqat teg oldidan bo'ladi: "${s}"`);
      const text = clean(rest[0], stepsField.line, where('steps'));
      return Object.keys(tag).length ? { text, ...tag } : text;
    });
    if (q.steps.length > 5) warn(line, `"${raw.slug}": ${q.steps.length} ta qadam (Sevara: ≤5)`);
  }
  const example = txt('example');
  if (example) q.example = example.join('\n');
  const undo = txt('undo');
  if (undo) q.undo = undo.join(' ');
  const pr = txt('parent_reply');
  if (pr) q.parentReply = pr.join('\n');
  if (fields.link) {
    const m = /^(\/[^\s|]*)\s*\|\s*(.+)$/.exec(fields.link.lines.join(' '));
    if (!m) fail(fields.link.line, 'link formati: "/url | Tugma matni"');
    if (!NAV_HREFS.has(m[1].split(/[?#]/)[0])) fail(fields.link.line, `link menyuda yo'q: ${m[1]}`);
    q.link = { href: m[1], label: m[2].trim() };
  }
  const note = txt('note');
  if (note) q.note = note;
  if (fields.see) {
    q.see = fields.see.lines.join(' ').split(',').map((s) => s.trim()).filter(Boolean);
    q._seeLine = fields.see.line;
  }

  const words = [q.answer, ...(q.steps ?? []).map((x) => (typeof x === 'string' ? x : x.text)), q.example ?? ''].join(' ').split(/\s+/).filter(Boolean).length;
  if (words > 120) warn(line, `"${raw.slug}": answer+steps+example = ${words} so'z (>120)`);
  q._line = line;
  q._section = sectionSlug;
  return q;
}

// ---------------------------------------------------------------- run
try {
  for (const b of blocks) {
    const h = b.header;
    let m;
    if (h.startsWith('Format qoidalari')) continue;
    if (h === 'synonyms:') parseSynonyms(b);
    else if ((m = /^chips: (admin|teacher)$/.exec(h))) parseChips(b, m[1]);
    else if ((m = /^checklist: (admin|teacher)$/.exec(h))) parseChecklist(b, m[1]);
    else if (h === 'teacher-brief:') parseTeacherBrief(b);
    else if (h === 'safe-list:') parseSafeList(b);
    else if ((m = /^timeline: (\S+)$/.exec(h))) parseTimeline(b, m[1]);
    else if ((m = /^tip: (\S+)$/.exec(h))) parseTip(b, m[1]);
    else if (h.startsWith('section:')) parseSection(b);
    else if (h === 'glossary:') parseGlossary(b);
    else if (h === 'errors:') parseErrors(b);
    else fail(b.line, `noma'lum blok: "## ${h}"`);
  }

  // ---- cross checks
  for (const k of ['admin', 'teacher']) {
    if (!data.chips[k]) fail(1, `"## chips: ${k}" bloki yo'q`);
    if (!data.checklists[k]) fail(1, `"## checklist: ${k}" bloki yo'q`);
  }
  if (!data.safeList) fail(1, '"## safe-list:" bloki yo\'q');
  if (!data.glossary) fail(1, '"## glossary:" bloki yo\'q');
  if (!data.errors) fail(1, '"## errors:" bloki yo\'q');
  if (!data.teacherBrief) fail(1, '"## teacher-brief:" bloki yo\'q');

  const slugs = new Map();
  const claim = (slug, line) => {
    if (slugs.has(slug)) fail(line, `slug takror: "${slug}" (avval ${slugs.get(slug)}-qatorda)`);
    slugs.set(slug, line);
  };
  const qSlugs = new Set();
  for (const s of data.sections) {
    claim(s.slug, s._line);
    for (const q of s.questions) {
      claim(q.slug, q._line);
      qSlugs.add(q.slug);
    }
  }
  claim('lugat', 1);
  for (const g of data.glossary.items) claim(g.slug, 1);

  for (const s of data.sections)
    for (const q of s.questions)
      for (const ref of q.see ?? []) if (!qSlugs.has(ref)) fail(q._seeLine, `see: "${ref}" degan savol yo'q`);
  for (const k of ['admin', 'teacher']) {
    for (const c of data.chips[k]) if (!qSlugs.has(c.slug)) fail(c._line, `chip: "${c.slug}" degan savol yo'q`);
    for (const it of data.checklists[k].items)
      if (it.how !== undefined && !qSlugs.has(it.how)) fail(it._line, `how: "${it.how}" degan savol yo'q`);
  }
  const secSlugs = new Set(data.sections.map((s) => s.slug));
  for (const t of tips) {
    const s = data.sections.find((x) => x.slug === t.section);
    if (!s) fail(t.line, `tip: "${t.section}" degan bo'lim yo'q`);
    if (s.tip) fail(t.line, `tip: "${t.section}" bo'limida tip takror`);
    s.tip = t.text;
  }
  for (const tl of data.timelines) if (!secSlugs.has(tl.section)) fail(tl._line, `timeline: "${tl.section}" degan bo'lim yo'q`);
  if (!secSlugs.has('yordam')) fail(1, '"yordam" bo\'limi yo\'q (errors bloki shu yerga joylanadi)');
  if (!secSlugs.has('birinchi-qadamlar')) fail(1, '"birinchi-qadamlar" bo\'limi yo\'q');
} catch (e) {
  if (e instanceof ContentError) {
    console.error(`XATO: ${e.message}`);
    process.exit(1);
  }
  throw e;
}

// ---------------------------------------------------------------- emit
const strip = (o) => JSON.parse(JSON.stringify(o, (k, v) => (k.startsWith('_') ? undefined : v)));
const json = (v) => JSON.stringify(strip(v), null, 2).replace(/ /g, '\\u00a0');
const total = data.sections.reduce((n, s) => n + s.questions.length, 0);

const out = `/* eslint-disable */
// AVTOMATIK YARATILGAN — qo'lda o'zgartirmang.
// Manba: docs/help/CONTENT.md · Generator: scripts/gen-help-content.mjs · Variant: ${VARIANT}
// Qayta yaratish: (frontend/ ichida) node scripts/gen-help-content.mjs
import type {
  HelpChecklist, HelpChip, HelpErrorItem, HelpGlossary, HelpSafeList, HelpSectionData,
  HelpTeacherBrief, HelpTimeline,
} from './types';

export const HELP_QUESTION_COUNT = ${total};

export const HELP_SYNONYMS: string[][] = ${json(data.synonyms)};

export const HELP_CHIPS: Record<'admin' | 'teacher', HelpChip[]> = ${json(data.chips)};

export const HELP_CHECKLISTS: Record<'admin' | 'teacher', HelpChecklist> = ${json(data.checklists)};

export const HELP_TEACHER_BRIEF: HelpTeacherBrief = ${json(data.teacherBrief)};

export const HELP_SAFE_LIST: HelpSafeList = ${json(data.safeList)};

export const HELP_TIMELINES: HelpTimeline[] = ${json(data.timelines)};

export const HELP_GLOSSARY: HelpGlossary = ${json(data.glossary)};

export const HELP_ERRORS: HelpErrorItem[] = ${json(data.errors)};

/** Accordion order: section slugs plus \`lugat\` where the glossary block sits. */
export const HELP_ORDER: string[] = ${json(data.order)};

export const HELP_SECTIONS: HelpSectionData[] = ${json(data.sections)};
`;

for (const w of warnings) console.warn(`OGOHLANTIRISH: ${w}`);
console.log(
  `OK: ${data.sections.length} bo'lim, ${total} savol, ${data.glossary.items.length} atama, ` +
    `${data.errors.length} xabar, ${data.synonyms.length} sinonim guruhi · variant=${VARIANT} · ${warnings.length} ogohlantirish`,
);
if (CHECK) {
  console.log('--check: fayl yozilmadi');
} else {
  fs.writeFileSync(OUT, out);
  console.log(`Yozildi: ${path.relative(process.cwd(), OUT)}`);
}
