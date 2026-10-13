# Handoff: Eduvo Mock (mock.eduvo.uz) — full web product

## Overview
Eduvo Mock is a global, self-serve B2C platform. Anyone can sign up, pay, take realistic computer-based **IELTS Academic** and **Digital SAT** mock exams, and get instant, detailed results with AI-graded Writing. **CEFR** (Uzbekistan national multilevel), **TOEFL iBT** and **HSK** show as "Coming soon". It is the consumer face of the same exam engine that Eduvo learning centers use inside Eduvo ERP.

- Audience: students aged 15–30 worldwide. The first market is Uzbekistan and Central Asia. Many browse on a phone and take the test on a laptop.
- Tone: confident, calm, trustworthy, exam-serious but friendly.
- **Score copy rule:** state scores plainly. Never use "estimated", "approximately", "may be", "not exact" or "±" about scores. AI-graded parts carry only a small **AI** badge.
- **Legal line** (small; footer and results page only): `Practice test — not an official certificate. Not affiliated with IELTS, British Council, IDP, Cambridge or College Board.`

## About the design files
The files in `design/` are **design references built in HTML**. They are working prototypes that show the intended look, copy and behavior. They are not production code to copy. Rebuild them in the target stack. Recommended: Next.js (App Router) + TypeScript + Tailwind or CSS variables, with `next-intl` for i18n. Use that stack's normal patterns. Open any `.dc.html` file directly in a browser; `support.js` must sit next to them. `Screens.dc.html` is an overview canvas with every screen at desktop and phone sizes, plus RTL, dark and German variants.

## Fidelity
**High-fidelity.** Colors, type, spacing, radii, shadows, copy and interactions are final. Recreate them pixel-accurately. Placeholders (striped boxes) mark real assets still to come.

---

## Design tokens

### Colors — light (default)
| Token | Value | Use |
|---|---|---|
| `--bg` | `#E8ECF3` | Page and card surface (neomorphic, same as card) |
| `--paper` | `#F4F6FA` (player `#F7F8FB`) | Reading passages, essays, editor |
| `--ink` | `#1E2A3A` | Primary text |
| `--ink2` | `#5B6B82` | Secondary text |
| `--mut` | `#7A8699` | Muted text, labels |
| `--line` | `#D5DBE5` | Hairlines, dividers |
| `--hover` | `#DDE3EC` | Hover fill, skeleton base |
| `--blue` | `#2E6BE6` | Primary; hover `#1F55C4` |
| Primary gradient | `linear-gradient(135deg,#5B8DEF,#2E6BE6)` | Primary buttons, active bars |
| `--ok` / `--okBg` | `#1F7A55` / `#E5F5EE` | Correct, success, Free chip, CEFR chip |
| `--ai` / `--aiBg` | `#5B3FD1` / `#EEE9FF` | AI badge, AI grading |
| `--warn` / `--warnBg` | `#B7790F` / `#FFF1D6` | **Wrong answers**, low accuracy (<65%), timers, Coming soon, reconnecting |
| `--err` / `--errBg` | `#C2362B` / `#FDE8E6` | **System errors only**: payment failed, validation, 500 |
| Highlight | `#FFE9A8`, text `#1E2A3A` | Passage highlight, evidence |

**Red is never used** for scores, wrong answers or balances. Wrong answers use amber.

### Colors — dark
`--bg #1B2230`, `--paper #202838`, `--ink #E7ECF4`, `--ink2 #A9B5C7`, `--mut #8592A6`, `--line #2C3648`, `--hover #242D3E`, `--blue #6E9BF5`, `--ok #5FCB98 / okBg #173629`, `--ai #B3A2FF / aiBg #2A2450`, `--warn #F0B54A / warnBg #3A2D12`, `--err #FF8A80 / errBg #3D1E1C`. Keep the primary gradient the same.

### Exam accents
| Exam | Light | Dark |
|---|---|---|
| IELTS | `oklch(0.5 0.15 255)` | `oklch(0.72 0.13 255)` |
| SAT | `oklch(0.5 0.13 300)` | `oklch(0.72 0.12 300)` |
| CEFR | `oklch(0.5 0.11 160)` | `oklch(0.72 0.1 160)` |
| TOEFL | `oklch(0.5 0.11 60)` | `oklch(0.74 0.1 60)` |
| HSK | `oklch(0.52 0.14 20)` | `oklch(0.72 0.12 20)` |
Use them for the exam eyebrow (12–13 px, 800, letter-spacing .05em, uppercase) and exam chips only.

### Shadows (soft neomorphism)
- `--raise`: `8px 8px 20px #C8CFDB, -8px -8px 20px #FFFFFF` (dark: `#121722` / `#242D3F`). Cards.
- `--raise-sm`: `4px 4px 10px #C8CFDB, -4px -4px 10px #FFFFFF`. Buttons, small raised items.
- `--inset`: `inset 3px 3px 7px #C8CFDB, inset -3px -3px 7px #FFFFFF` (dark: `#121722` / `#252E40`). Inputs, inner panels, segmented tracks, selected states.
- Primary button glow: `0 10px 22px -10px rgba(46,107,230,.8)`.
- Selected card: `outline: 2px solid var(--blue); outline-offset: -2px`.
- Validation error field: `var(--inset), 0 0 0 2px var(--err)`.

### Radius
Card 24 · inner panel 16 · button 13–14 (mobile 16) · small button/chip square 9–12 · pill 999 · bottom sheet 28 (top corners).

### Typography
- **UI:** Manrope 400/500/600/700/800 with `font-variant-numeric: tabular-nums` everywhere.
- **Reading passages, essays, evidence quotes:** Source Serif 4, 17 px / 1.75 (player), 15–16 px / 1.65–1.7 elsewhere. Always LTR English.
- Scale: Display 56 (hero `clamp(34px,4.6vw,58px)`, -0.035em, 800) · H1 page 36–40 (-0.03em) · H2 section `clamp(28px,3vw,40px)` · Title 24 · Subtitle 18 · Body 16 / 1.6 · Small 14 · Label 13/700 · Eyebrow 12/800 uppercase .06em · Score numerals 48–104 / 800 / -0.04 to -0.05em.
- Mobile: H1 28–30, body 15, minimum 13 for UI text (11–12 for meta only).

### Spacing
4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 56 · 64. Desktop content max-width 1200–1280, side padding 20. Section padding `clamp(40px,5vw,72px)`. Card padding 24–28. Mobile screen padding 16 (forms 20).

### Motion
- Bottom sheet: `translateY(100%)→0`, 280 ms, `cubic-bezier(.2,.8,.2,1)`. Backdrop fades in over 200 ms, `rgba(10,15,25,.45)`.
- Skeleton shimmer: 1.4 s linear loop. **Show it only if loading takes more than 300 ms.**
- Timer in the last 5 minutes: dot pulses at 1 s.
- Spinner: 0.8 s rotation.

---

## Global components
- **Buttons:** Primary (gradient, white, 48–56 h, 700–800), Soft (`--bg` + `--raise-sm`; pressed = `--inset`), Ghost (blue text). Disabled = `--mut` background at 70% opacity. **One primary action per screen.**
- **Inputs:** 50–54 h, radius 14–16, `--inset`, no border. Label above (13/700 `--ink2`). Error text below (12/600 `--err`).
- **Segmented control:** inset track with 5 px padding; active item raised with `--raise-sm` and `--ink` text.
- **Chips:** AI (`--aiBg`/`--ai`, radius 7), Coming soon (warnBg/warn pill), Free (okBg/ok pill), CEFR B2 (okBg/ok), Most chosen (blue/white), Correct (ok) / Wrong (warn).
- **Progress bar:** 6–10 h, inset track, gradient fill. Fill is amber below 65%, purple for AI grading.
- **Banners:** info (`--hover`), warning (warnBg), reconnecting (warnBg + pulsing dot), error (errBg).
- **Toast:** `--ink` background, `--bg` text, radius 14, auto-hides after about 2.2 s.
- **Modal:** card 24 radius, backdrop `rgba(15,20,30,.45)`.
- **Header:** sticky, 64 h, bottom hairline. Logo is a 32 px rounded square with the gradient and a white "e", followed by **Eduvo**·**Mock** (Mock in blue).
  - Guest nav: IELTS, SAT, Pricing, How it works, For centers. Right side: language button, theme toggle, Log in, primary **Start free**.
  - Logged-in nav: Dashboard, Take a mock, Progress, Pricing, plus an avatar.
- **Language switcher:** 40 languages, each name in its own script, no flags. Search field, grid list, "RTL" tag on ar/fa/ur/he. Note under the list: "Exam content stays in English. Interface and AI feedback follow your language." On mobile it opens as a bottom sheet.
  - Languages: English, O‘zbekcha, Ўзбекча, Русский, Қазақша, Кыргызча, Тоҷикӣ, Türkmençe, Türkçe, Azərbaycanca, العربية, فارسی, اردو, עברית, हिन्दी, বাংলা, 简体中文, 繁體中文, 日本語, 한국어, Bahasa Indonesia, Bahasa Melayu, Tiếng Việt, ไทย, Filipino, Deutsch, Français, Español, Português, Italiano, Nederlands, Polski, Українська, Română, Čeština, Magyar, Ελληνικά, Svenska, Kiswahili, Монгол.
- **Footer:** 5 columns (brand + email hello@eduvo.uz + Telegram/Instagram/YouTube/LinkedIn · Exams · Company · Legal · Languages), then the legal line.

---

## Platform rules
- **i18n:** URLs are `/{lang}/…` (e.g. `/en/ielts`, `/uz/ielts`). The interface and AI feedback are translated; exam content always stays English and `dir="ltr"`.
- **RTL:** ar, fa, ur, he set `dir="rtl"` on `<html>`. Use logical CSS properties only (`margin-inline-start`, `inset-inline-end`, `text-align:start`), so layouts mirror automatically. Back chevrons rotate. Charts stay LTR.
- **Long strings:** German and Russian must not break layouts. Use flex-wrap, `minmax(0,1fr)` and no fixed widths on text.
- **Theme:** light and dark, stored in user preferences, with a toggle in the header and profile.
- **Responsive:** marketing, auth, dashboard, results and checkout are mobile-first (360 → 1440).
  - **On phones (<520 px) use the app-style layout in `Mobile App.dc.html`**: app bar, bottom tab bar, sticky bottom CTA, bottom sheets.
  - **The exam player is desktop-only (≥1280 px).** Below that, show "Open on a computer to take the test" with **Email me the link** and **Copy link**.
- A test the user has already taken is **never assigned again**.

---

## Screens (13)

### 1. Landing — `Landing.dc.html`
- **Header:** as above.
- **Hero:** 2-column grid (`minmax(min(100%,480px),1fr)`). Left side: IELTS Academic and Digital SAT chips; H1 "Take a real-format IELTS or SAT mock. Get your score in minutes."; sub "Same interface, timing and rules as the computer-delivered exam. Listening and Reading are scored on submit; Writing is graded by AI with feedback on every criterion."; CTAs **Try a free section** (primary) and **See a sample result** (soft); trust line "One free section per exam · No card to start · Interface in 40 languages". Right side: a mini exam-player visual (top bar with 42:18 timer, serif passage with a highlight, TRUE/FALSE/NOT GIVEN buttons, question palette with item 3 flagged amber), overlapped bottom-right by a result card (Overall band 6.5, CEFR B2, L 7.0 / R 6.5 / W 6.0 AI).
- **Exams:** IELTS and SAT cards with a "Free section" chip, a 3-fact inset panel (IELTS: 2h 40m · 80 questions + 2 tasks · 0–9 band; SAT: 2h 14m · 4 adaptive modules · 98 questions · 400–1600), the full-mock price (79 000 / 89 000 UZS) and View button. CEFR / TOEFL iBT / HSK sit in inset cards with a "Coming soon" chip and an email + **Notify me** form; after submitting, the form becomes the green line "We will email you when it opens."
- **How it works:** 4 steps — choose exam → sit it in the real interface → scores right away (Writing by AI in minutes) → know what to practise.
- **What you get:** 11 feature cells, each with a monospace tag (IELTS / SAT / BOTH / AI): computer-delivered IELTS interface; audio played once; highlight and notes; Bluebook-style modules with adaptive Module 2; Desmos; reference sheet, annotate and option eliminator; mark for review and timer; band or score on submit; per-question review with explanations; AI Writing criteria feedback; progress over time.
- **Sample result:** an overall card (6.5, B2, sections with "32 of 40 correct") and accuracy-by-type bars (amber below 65%), linking to "Open the full sample result".
- **Pricing teaser:** One section 29 000 · Full mock 79 000 (selected outline) · Bundle of 5 = 299 000 (59 800 per mock · valid 12 months).
- **Testimonials:** 3 placeholder cards (striped "learner quote", avatar, name, "IELTS · target 7.0").
- **FAQ:** accordion, one item open at a time.
- **For learning centers:** inset strip, "Run these mocks for your students inside Eduvo ERP", button to eduvo.uz.
- **Footer.**

### 2. Exam pages `/ielts`, `/sat` (SEO) — *specification only, not drawn*
Follow the landing visual language. Sections:
- Hero with exam accent eyebrow, H1, price, CTAs **Start full mock** / **Try free section**.
- Format table:
  - IELTS: Listening 30 min + 2 min check · 40 questions · 4 parts; Reading 60 min · 40 questions · 3 passages; Writing 60 min · 2 tasks; band 0–9 in 0.5 steps.
  - SAT: Reading and Writing 2×32 min · 54 questions; Math 2×35 min · 44 questions; 10-minute break; 400–1600.
- What's included.
- Sample question preview (reuse the player question styles).
- Exam FAQ.

### 3. Pricing — `Pricing.dc.html`
- H1 "Pay per mock, or go unlimited".
- Controls: exam segmented (IELTS/SAT), model segmented (Pay per mock / Monthly unlimited), currency segmented (UZS/USD/EUR).
- Green free strip: "One {exam} section on us. No card needed." with **Start free section**.
- **Pay per mock:** 3 cards — One section; Full mock (outline + "Most chosen", primary CTA); Bundle with a 3/5/10 selector, per-mock price and saving %.
- **Unlimited:** monthly card plus a "When unlimited pays off" explainer.
- Comparison table: rows Price, Sections, Instant scores, AI Writing feedback, Question review, Progress tracking, Validity; columns Free, Section, Full mock, Bundle, Unlimited.
- Note: taxes included; credits valid 12 months; link to the refund policy.

**Price table** (UZS / USD / EUR)
| | IELTS | SAT |
|---|---|---|
| One section | 29 000 / 2.49 / 2.29 | 35 000 / 2.99 / 2.79 |
| Full mock | 79 000 / 6.99 / 6.49 | 89 000 / 7.99 / 7.29 |
| 3 mocks | 199 000 / 17.49 / 15.99 | 229 000 / 19.99 / 18.49 |
| 5 mocks | 299 000 / 25.99 / 23.99 | 339 000 / 29.99 / 27.49 |
| 10 mocks | 549 000 / 47.99 / 43.99 | 619 000 / 54.99 / 49.99 |
| Unlimited / month | 149 000 / 12.99 / 11.99 | 169 000 / 14.99 / 13.79 |
UZS is formatted with a space as the thousands separator: `79 000 UZS`. USD is `$6.99`; EUR is `€6.49`.

### 4. Auth and onboarding — `Auth.dc.html`
- **Desktop layout:** a left column with an H1 and 3 numbered benefits; a right form card (max 480).
- **Modes:** signup, login, forgot, verify, sent, reset, onboarding.
- **Sign up:** **Continue with Google**, "or with email" divider, Email, Password (min 8), **Create account**, switch link, terms line. Telegram and phone sign-in come later.
- **Validation** (on submit):
  - Email: `/^\S+@\S+\.\S+$/` → "Enter a valid email, like name@example.com"
  - Password: fewer than 8 characters → "Use at least 8 characters."
- **Verify:** "@" icon tile, "We sent a link to {email}…", **I have verified my email**, **Resend email** (becomes "Sent again. Check spam too.").
- **Forgot → sent → reset:** two password fields, **Save and log in**.
- **Onboarding**, 4-step stepper (Exam · Target · Date · Country):
  1. Choose IELTS or SAT (selectable cards).
  2. Target: IELTS 5.5–9.0 or SAT 1200–1600, in a 4-column grid.
  3. Exam date picker plus "I have not booked a date yet".
  4. Country select and interface language, with the note "Exam content stays in English".
- Final button **Start my free section** goes to Exam start with the free flag. "Skip for now" goes to an empty Dashboard.

### 5. Learner dashboard — `Dashboard.dc.html`
- Greeting "Good afternoon, Dilnoza" and the subline "5 mocks taken · last one 12 October".
- **Row 1:**
  - Next step card: "Resume your Reading section — 41 minutes left", with a primary **Resume mock** button.
  - Current vs target: 6.5 → 7.0 with a bar and a target tick.
  - Countdown: 61 days to IELTS Academic, 12 December 2026, and "Change date".
- **Row 2:**
  - Progress chart (band by mock) with Overall / Listening / Reading / Writing tabs and a dashed green target line. The legend "Target 7.0" sits next to the title. **Draw labels as HTML, not SVG text.**
  - Weakest question types (amber bars).
- **Row 3:**
  - My mocks list: in progress → **Resume**; completed → score, date, **Open result**.
  - Credits: 2 IELTS full mocks, 1 free SAT section, recent purchases, **Buy more**.
- **Empty state:** "Start with a free section", buttons Free IELTS section / Free SAT section, and a gridded placeholder labelled "Your progress will appear here".
- **Skeleton** appears after 300 ms.

### 6. Exam start — `Exam Start.dc.html`
- Eyebrow, "Get ready to start", "Test IA-0142 · New to you — you have not taken this test before".
- **1 · What do you want to take?** Segmented Full mock / One section, then a section list:
  - IELTS: Listening 30 min + 2 min check; Reading 60 min; Writing 60 min.
  - SAT: Reading and Writing 64 min; Math 70 min.
  - Each row is tagged Included / Free / 1 credit.
- **Rules:** audio plays once; section order; leaving fullscreen more than 3 times ends the section; autosave, and the timer pauses while offline; no going back after submitting.
- **2 · System check:** Audio (Play tone), Headphones (I'm wearing them), Fullscreen (Allow), Internet (auto OK). Each row shows an amber dot while pending and a green dot when done. SAT needs only fullscreen.
- **Start** is disabled ("Finish the system check") until the checks are done. The note under it reads "Uses your free IELTS section" or "Uses 1 full-mock credit · you have 2".
- **Mobile:** the "Open on a computer" card with Email me the link, Copy link and the URL `mock.eduvo.uz/en/start/IA-0142`.

### 7. Exam player (desktop ≥1280) — `Player.dc.html`
Reuse the existing Eduvo ExamPlayer. Add only the B2C parts: the Eduvo Mock logo, Help, and an instruction-language select (English, O‘zbekcha, Русский; it changes instructions only).
- **Top bar** (60 h, 3 columns):
  - Left: logo, then section title and "Name · test ID".
  - Center: timer. Normal = inset with ink text. At 10 minutes = warnBg + "10 minutes left". At 5 minutes = solid warn background, white text, pulsing dot.
  - Right: tools (Notes on Reading; Calculator and Reference on Math), instruction language, Help, **Submit section** (IELTS).
- **IELTS Reading:** split layout 1.1fr / 1fr.
  - The serif passage has lettered paragraphs. Selecting text shows a dark toolbar: **Highlight** (`#FFE9A8`), **Note**, **Clear**. Notes underline the text with a dotted purple line and appear in a Notes panel.
  - Questions: 1–6 TRUE/FALSE/NOT GIVEN, 7–10 multiple choice, 11–13 sentence completion. Every question has a **Review** flag (amber).
- **IELTS Listening:** a strip with "Part 1 of 4", a progress bar with no controls, time played / total, a "Plays once" chip and a volume slider. Below it, a form-completion paper card.
- **IELTS Writing:** prompt panel on the left (Task 1 includes a chart placeholder). On the right, a serif editor with "Words: N · minimum 150/250", which turns green when the minimum is met. Task 1 / Task 2 tabs in the footer.
- **Footer:** Part tabs, a question number palette (answered = blue filled, unanswered = inset, flagged = amber outline), and Back / Next.
- **SAT:** "Section 1, Module 1: Reading and Writing".
  - Timer with **Hide**. Split passage / question.
  - Question number box, **Mark for Review**, and an **ABC** eliminator toggle; when it's on, a strike button appears beside each option.
  - Footer: "Question N of 27", which opens a palette popover and links to the review page.
  - **Check your work** page shows answered / unanswered / for-review counts and a number grid.
  - Module 1 → Module 2 → **10-minute break** (big countdown, **Resume testing**) → Math.
  - Math has a **Desmos** panel (embed placeholder) and a **Reference sheet** popover.
- **States:**
  - Section intro (facts, instructions, **Start {section}**).
  - Reconnecting banner: amber, "Reconnecting… Your answers are saved and the timer is paused.", with **Retry now**.
  - Submit confirm modal: "You have answered N of 40…".
  - **Time up** modal: "Your answers have been submitted".
  - Section submitted card: next section, or **See your result**; after Writing, the result opens in the pending state.

### 8. Results — `Results.dc.html`
- Header row: exam eyebrow, "Your result", "Full mock · Test IA-0142 · 12 October 2026", and actions **Share result card**, **Download PDF**, **Take another mock** (primary).
- **Overall card:** IELTS 6.5 (72–104 px) "of 9.0" with a CEFR B2 chip, and a target line in an inset panel. SAT shows the total 1340 "of 1600".
- **Section cards:** score, "32 of 40 correct", progress bar. The Writing card has an AI badge.
- **Accuracy by question type:** "15 of 17 · 88%" bars, amber below 65%.
- Strongest (okBg) and Needs practice (warnBg) tiles, plus 2–4 numbered **next steps**.
- **Writing (AI):** Task 1 / Task 2 tabs. The learner's essay (serif, paper background), task band, 4 criterion cards with score and feedback (Task Achievement/Response, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy), Strengths (okBg) and Next steps (aiBg).
- **Pending state:** the Writing score shows a shimmer and "Writing is being graded…" with "This page refreshes on its own. Usually 2–4 minutes." The overall shows "—". Poll until graded, then show the toast "Writing graded. Your overall band is ready."
- **Question review:** section tabs, filter **All / Wrong only · N**. Rows show number badge, question, type and a status pill (Correct green / **Wrong amber**). Expanding a row shows Your answer / Correct / explanation and **Show in text**, which shows the evidence sentence highlighted in serif.
- **Share modal:** square gradient result card (logo, band, CEFR, "mock.eduvo.uz · Practice test"), **Save image**, **Copy link**.
- Legal line at the bottom.

### 9. Progress — *phone version drawn in `Mobile App.dc.html`; desktop is specification only*
Trend chart per section (Overall / Listening / Reading / Writing) with target line, history table (date, mock, band), weak question types, and recommendations (aiBg card).

### 10. Checkout and billing — `Checkout.dc.html`
- **Left: payment methods**, a segmented Card / Wallet / Local methods.
  - Card form: number auto-formatted in groups of 4 and validated to 16 digits ("Enter all 16 digits of your card number."), expiry, CVC, name.
  - Wallet: Apple Pay and Google Pay.
  - Local: provider tiles with logo placeholders. Note: "Provider to be confirmed; you are redirected to the provider's page and back."
- **Right: order summary** with exam, plan, note and price.
  - Promo code: `EDUVO10` gives 10% off; any other code shows "This code is not valid or has expired."
  - Discount line, "Taxes: Included", Total, "Change plan".
- **States:**
  - Processing: spinner, "Confirming your payment…"
  - **Success:** "5 full-mock credits added to your account", **Start a mock now** / Go to dashboard, and receipt EM-2026-10-04187 with a Download link.
  - **Failed:** errBg chip, "Your bank declined the payment", "No money was taken", **Try again**, Contact support.
  - **Pending:** "Waiting for the provider to confirm" (up to 15 minutes), **Check status**.
- Receipts are also listed under Account → Purchases.

### 11. Account and settings — *phone version drawn in `Mobile App.dc.html` → Profile; desktop is specification only*
Groups:
- Account: Name, Email, Password.
- Preferences: Language (sheet), Dark theme (toggle), Target exam/band, Exam date.
- Email notifications (toggles): Result is ready, Writing graded, Weekly study tips.
- Billing: Purchases and receipts, Buy credits.
- Support: Help center, Contact.
- Data: Export my data, Delete account (confirm sheet: "removed for good after 14 days", Download my data / Delete account), Log out.

### 12. Help and legal — *specification only*
- Help center: searchable FAQ grouped by Exams / Payments / Account / Technical.
- Contact form: name, email, topic, message, test ID (optional).
- Terms, Privacy, Refund policy and Cookies as long-form pages with a sticky table of contents.
- **Cookie banner:** bottom card with Accept all / Only necessary / Settings.

### 13. System states — *partly drawn*
- 404, 500, maintenance and offline: centered card with code, plain message and one primary action. Offline uses warnBg; 500 uses errBg.
- Skeletons: drawn in Dashboard and the Design System page.
- Empty states: Dashboard, Mocks.
- Toasts and form validation: drawn in Auth, Checkout and Results.

---

## Mobile app-style layout (phones) — `Mobile App.dc.html`
Use this layout for every non-player screen at widths below 520 px.
- **App bar:** 52 h. Back chevron button (44×44) or logo, centered title, right actions (language pill, Log in, Skip, Share).
- **Bottom tab bar** (logged in): Home, Mocks, Progress, Profile. Height 54 plus the safe area, translucent `--bar` background with `backdrop-filter: blur(14px)`; the active tab is blue with an inset icon pill.
- **Sticky bottom CTA bar:** 54 h buttons, radius 16, `padding-bottom: env(safe-area-inset-bottom)`. One primary button, plus an optional soft secondary button (for example Sample / Start free, PDF / Take another mock, Pay {total}).
- **Bottom sheets:** language, share, question detail with Previous/Next, delete account. 28 px top radius, grab handle, **Done** button.
- **Patterns:**
  - Horizontal snap carousels: exam cards at 78% width, stat cards.
  - Grouped list rows inside one raised card, separated by hairlines.
  - Radio-card selection for plans, payment methods and sections.
  - Settings rows with toggles.
  - Large-title tab screens.
- **Screens:** landing, auth (signup/login), verify, onboarding (4 steps), home (with data / empty), free section start ("Open on a computer"), results (Overview / Writing / Review tabs, with a sticky tab bar), pricing, checkout, payment success / failed / pending, mocks (In progress / Completed), progress (bar chart, history), profile.
- Hide scrollbars: `scrollbar-width: none` and `::-webkit-scrollbar { width: 0 }`.

---

## State and data (suggested)
- `user`: id, name, email, lang, theme, targetExam, targetScore, examDate, country.
- `credits`: per exam — full mocks, sections, freeSectionUsed (boolean per exam), unlimitedUntil.
- `attempts`: id, exam, testId, kind (full/section), sections[], status (in_progress / submitted / grading / completed), startedAt, remainingSeconds, answers, flags, highlights, notes.
- `result`: overall, cefr, sections[{name, score, correct, total}], accuracyByType[], strongest, weakest, nextSteps[], writing[{task, band, criteria[{name, score, feedback}], strengths[], nextSteps[], essay, words}], review[{n, question, type, yours, correct, explanation, evidence, paragraph}].
- Test assignment: always pick a test whose `testId` is not in the user's attempts.
- Autosave answers every few seconds. On disconnect, show the reconnecting banner and pause the timer.
- Writing grading is async: poll or use websockets, and send an email when grading is done.
- Payments: create an order, use a provider-agnostic interface (card / wallet / local), and handle webhook results success / failed / pending.

## Assets
No images are final. Placeholders still to be supplied: learner testimonials (quote + avatar), payment and local provider logos, the IELTS Writing Task 1 chart, and the Desmos embed (use the official Desmos API). The logo is the gradient rounded square with "e" plus the "Eduvo Mock" wordmark. Icons are simple geometric CSS shapes; replace them with the codebase's icon set (for example Lucide) at the same sizes.

## Files (in `design/`)
| File | Content |
|---|---|
| `Screens.dc.html` | Overview canvas of every screen (desktop + phone, RTL, dark, German) |
| `Design System.dc.html` | Tokens and components, with light / dark / RTL toggles |
| `Landing.dc.html` | Screen 1 |
| `Pricing.dc.html` | Screen 3 |
| `Auth.dc.html` | Screen 4 (`?mode=signup/login/forgot/verify/reset/onboarding`) |
| `Dashboard.dc.html` | Screen 5 (`?empty=1`) |
| `Exam Start.dc.html` | Screen 6 (`?exam=ielts/sat&free=1`) |
| `Player.dc.html` | Screen 7 (`?section=listening/reading/writing/rw/math&phase=test`; the "Prototype states" button cycles through the states) |
| `Results.dc.html` | Screen 8 (`?exam=sat`, `?pending=1`) |
| `Checkout.dc.html` | Screen 10 (`?plan=section/full/b3/b5/b10/unl&state=success/failed/pending`) |
| `Mobile App.dc.html` | All phone screens (`?screen=…&bare=1`) |
| `SiteHeader.dc.html`, `SiteFooter.dc.html` | Shared header and footer |
| `support.js` | Runtime needed to open the HTML files locally |

Every page also accepts `?lang=ar|uz|ru|de` and `?theme=dark`.

## Clickable flow
Landing → Sign up → Verify → Onboarding → Free section start → Player → Results → Pricing → Checkout success → Dashboard.
