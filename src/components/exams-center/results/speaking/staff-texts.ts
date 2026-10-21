/** Staff console Speaking strings — speaking-design.md §7.3 (+ §3.3 dialog copy), Uzbek only (console language). */
export const ST = {
  override_btn: "Ballni o'zgartirish",
  override_title: "Speaking ballini o'zgartirish",
  override_new_band: 'Yangi Speaking bandi: {band}',
  override_same: 'AI bahosi bilan bir xil',
  override_comment_label: "Izoh (o'quvchi ko'radi)",
  override_comment_ph: "Nega o'zgartirdingiz? Masalan: Part 3 javoblari aniq va izchil — FC 7 ga loyiq.",
  override_note: 'O\'quvchi natijasida "O\'qituvchi tekshirdi" belgisi va izohingiz chiqadi. AI bahosi tarixda qoladi.',
  override_need_change: "Kamida bitta mezonni o'zgartiring",
  override_need_comment: 'Izoh yozing — kamida 10 belgi',
  override_saved: "Ball saqlandi. O'quvchi yangilangan natijani ko'radi.",
  override_failed: "Saqlanmadi — qayta urinib ko'ring. O'zgarishlar shu oynada turibdi.",
  override_wait: "Baholash tugagach o'zgartirish mumkin",
  override_sub_ai: 'AI bahosi {band}',
  override_sub_none: "AI bahosi: yo'q",
  cancel: 'Bekor qilish',
  save: 'Saqlash',
  revert: 'AI bahosiga qaytarish',
  revert_title: 'AI bahosiga qaytarilsinmi?',
  revert_body: 'O\'quvchi natijasida yana AI bahosi ({band}) ko\'rinadi, "O\'qituvchi tekshirdi" belgisi olib tashlanadi. Tarix saqlanadi.',
  revert_btn: 'Qaytarish',
  needs_human: 'AI ikki marta har xil baho berdi. Yozuvni eshitib, ballni tasdiqlang yoki o\'zgartiring.',
  grade_btn: 'Baholash',
  grading_line: 'Baholash: AI (audio) · {n} javob',
  pass_n: '{n}-o\'tish',
  flags: 'Belgilar:',
  ai_detail: 'AI TAFSILOTI',
  answers: 'JAVOBLAR',
  history: "O'ZGARISHLAR TARIXI",
  flag_memorised_suspect: "Yodlangan javob bo'lishi mumkin",
  flag_off_topic: 'Mavzudan chetga chiqqan',
  flag_p2_short: 'Part 2 juda qisqa (<30 s)',
  flag_mostly_unanswered: "Ko'p savol javobsiz",
  flag_low_mic: 'Mikrofon ovozi past edi',
  flag_restarted: '{n} ta savol uzilish sababli qayta boshlangan',
  restarted_chip: 'Qayta boshlangan',
  before_cut: 'Uzilishgacha',
  no_answer: 'Javob berilmagan',
  text_toggle: 'Matn',
  no_response: 'Javob yozilmadi (texnik yoki jim)',
  too_short: 'Javoblar 4 mezon uchun juda qisqa',
  grading: 'Baholanmoqda…',
  not_taken_until: 'Hali topshirilmagan · {date} gacha',
  audio_until: 'Audio {date} gacha saqlanadi',
  audio_deleted_by_student: "O'quvchi audioni {date} da o'chirgan",
  audio_expired: 'Audio saqlash muddati tugagan ({date})',
} as const;

export const fill = (s: string, v: Record<string, string | number>) => Object.entries(v).reduce((a, [k, x]) => a.split(`{${k}}`).join(String(x)), s);

/** Flag code (contract §4 `review.flags`) → label; unknown codes are shown raw. */
export const FLAG: Record<string, string> = {
  memorised_suspect: ST.flag_memorised_suspect, off_topic: ST.flag_off_topic, p2_short: ST.flag_p2_short,
  mostly_unanswered: ST.flag_mostly_unanswered, low_mic: ST.flag_low_mic, low_signal: ST.flag_low_mic,
};

export const dmy = (iso: string) => new Date(iso).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
export const dmhm = (iso: string) => new Date(iso).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
