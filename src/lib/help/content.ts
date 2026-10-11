/* eslint-disable */
// AVTOMATIK YARATILGAN — qo'lda o'zgartirmang.
// Manba: docs/help/CONTENT.md · Generator: scripts/gen-help-content.mjs · Variant: fixed
// Qayta yaratish: (frontend/ ichida) node scripts/gen-help-content.mjs
import type {
  HelpChecklist, HelpChip, HelpErrorItem, HelpGlossary, HelpSafeList, HelpSectionData,
  HelpTeacherBrief, HelpTimeline,
} from './types';

export const HELP_QUESTION_COUNT = 147;

export const HELP_SYNONYMS: string[][] = [
  [
    "qarz",
    "qarzdor",
    "qarzdorlik",
    "qarzdorlar",
    "to'lamagan",
    "to'lanmagan",
    "muddati o'tgan"
  ],
  [
    "chek",
    "kvitansiya",
    "chop etish",
    "pechat"
  ],
  [
    "o'chib ketdi",
    "yo'qoldi",
    "ko'rinmayapti",
    "ko'rinmaydi",
    "topilmayapti",
    "chiqmayapti"
  ],
  [
    "maosh",
    "ish haqi",
    "oylik",
    "zarplata",
    "maoshim"
  ],
  [
    "ota-ona",
    "onasi",
    "otasi",
    "ota",
    "ona",
    "oila",
    "vasiy"
  ],
  [
    "o'quvchi",
    "talaba",
    "bola",
    "farzand",
    "shogird"
  ],
  [
    "o'qituvchi",
    "ustoz",
    "ustozlar",
    "domla",
    "mentor"
  ],
  [
    "to'lov",
    "pul",
    "oplata",
    "to'lash",
    "to'ladi"
  ],
  [
    "chegirma",
    "skidka",
    "arzonlashtirish",
    "kamaytirish"
  ],
  [
    "qaytarish",
    "qaytarib berish",
    "vozvrat",
    "refund",
    "storno"
  ],
  [
    "xato",
    "noto'g'ri",
    "adashib",
    "yanglish",
    "xatolik"
  ],
  [
    "davomat",
    "yo'qlama",
    "kelmadi",
    "keldi",
    "kechikdi"
  ],
  [
    "guruh",
    "sinf",
    "kurs"
  ],
  [
    "login",
    "parol",
    "kirish",
    "akkaunt"
  ],
  [
    "kassa",
    "naqd",
    "kassadagi pul"
  ],
  [
    "xarajat",
    "chiqim",
    "rasxod"
  ],
  [
    "kirim",
    "tushum",
    "daromad"
  ],
  [
    "lid",
    "mijoz",
    "qiziqqan",
    "ariza"
  ],
  [
    "filial",
    "markaz"
  ],
  [
    "vazifa",
    "uy vazifasi",
    "uyga vazifa",
    "topshiriq"
  ],
  [
    "jadval",
    "raspisaniye",
    "dars vaqti"
  ],
  [
    "telefon ilovasi",
    "ilova",
    "prilojeniye",
    "eduvo ustoz"
  ],
  [
    "portal",
    "kabinet",
    "shaxsiy kabinet"
  ],
  [
    "telegram",
    "bot",
    "tg"
  ],
  [
    "o'chirish",
    "olib tashlash",
    "udalit"
  ],
  [
    "muzlatish",
    "to'xtatib turish",
    "ta'til",
    "pauza"
  ],
  [
    "avans",
    "oldindan",
    "predoplata"
  ]
];

export const HELP_CHIPS: Record<'admin' | 'teacher', HelpChip[]> = {
  "admin": [
    {
      "label": "Qarzdorlar qayerda",
      "slug": "qarzdorlar-qayerda"
    },
    {
      "label": "Xato to'lov",
      "slug": "boshqa-oquvchiga-yozdim"
    },
    {
      "label": "Oy o'rtasida keldi",
      "slug": "nega-130000"
    },
    {
      "label": "Chegirma",
      "slug": "chegirma-qanday"
    },
    {
      "label": "Kassada pul kam",
      "slug": "kassada-kam"
    },
    {
      "label": "Pulni qaytarish",
      "slug": "pulni-qaytaring"
    }
  ],
  "teacher": [
    {
      "label": "Davomatni tuzatish",
      "slug": "otgan-darsni-tuzatish"
    },
    {
      "label": "Kech yoki Sababli",
      "slug": "holatlar-farqi"
    },
    {
      "label": "Internet yo'q",
      "slug": "internet-yoq-davomat"
    },
    {
      "label": "Ish haqim qanday hisoblanadi",
      "slug": "ish-haqi-qanday"
    },
    {
      "label": "Vazifa berish",
      "slug": "vazifa-berish"
    },
    {
      "label": "Guruhim ko'rinmayapti",
      "slug": "guruh-biriktirilmagan"
    }
  ]
};

export const HELP_CHECKLISTS: Record<'admin' | 'teacher', HelpChecklist> = {
  "admin": {
    "title": "Birinchi kun",
    "hint": "Markazni ishga tushirish uchun 6 qadam. Tartib muhim emas — qulayini tanlang.",
    "items": [
      {
        "id": "cl-kassa",
        "title": "Kassadagi boshlang'ich pulni kiriting",
        "desc": "Tizimga o'tgan kundagi naqd va karta qoldig'i.",
        "link": "/transactions",
        "how": "kassa-boshlangich-qoldiq",
        "module": "finance"
      },
      {
        "id": "cl-asos",
        "title": "Yo'nalish, xona va o'qituvchilarni qo'shing",
        "desc": "Guruh ochish uchun avval shular kerak.",
        "link": "/teachers",
        "how": "yangi-markaz-tartibi"
      },
      {
        "id": "cl-guruh",
        "title": "Guruhlarni oching",
        "desc": "Kunlar, vaqt va oylik narx bilan.",
        "link": "/manage-groups",
        "how": "guruh-ochish"
      },
      {
        "id": "cl-oquvchi",
        "title": "O'quvchilarni kiriting va guruhga biriktiring",
        "desc": "Excel'dan import yoki bittalab.",
        "link": "/students",
        "how": "import-excel"
      },
      {
        "id": "cl-login",
        "title": "O'qituvchi va ota-onalarga login bering",
        "desc": "O'qituvchi davomatni telefondan qiladi.",
        "link": "/teachers",
        "how": "oqituvchiga-login"
      },
      {
        "id": "cl-tolov",
        "title": "Birinchi to'lovni qabul qiling",
        "desc": "Keyin kun oxirida kassani yoping.",
        "link": "/payments",
        "how": "qabul-hisob-boyicha"
      }
    ]
  },
  "teacher": {
    "title": "Ilovaga birinchi kirish",
    "hint": "Birinchi darsdan oldin 4 qadam.",
    "items": [
      {
        "id": "clt-login",
        "title": "Administratordan telefon va parol oling",
        "desc": "Tizimga shu ikkisi bilan kirasiz.",
        "how": "ilovaga-birinchi-kirish"
      },
      {
        "id": "clt-ornatish",
        "title": "Ilovani telefoningizga o'rnating",
        "desc": "Brauzer menyusidan «Bosh ekranga qo'shish».",
        "how": "ilovani-ornatish"
      },
      {
        "id": "clt-davomat",
        "title": "Birinchi darsda davomatni belgilang",
        "desc": "«Hammasi keldi», keyin kelmaganlarni o'zgartiring.",
        "how": "davomat-qanday"
      },
      {
        "id": "clt-parol",
        "title": "Parolni o'zingiznikiga almashtiring",
        "desc": "«Mening profilim» sahifasida.",
        "link": "/profile",
        "how": "parolni-ozgartirish"
      }
    ]
  }
};

export const HELP_TEACHER_BRIEF: HelpTeacherBrief = {
  "title": "O'qituvchilarga yuborish uchun",
  "hint": "Telegram guruhingizga nusxalab yuboring.",
  "text": "Hurmatli ustozlar! Endi davomatni telefondan belgilaymiz.\n1. Brauzerda https://admin.eduvo.uz/t ni oching.\n2. Telefon raqamingiz va parolingiz bilan kiring. Parol: [parol] — keyin o'zingiz almashtirasiz.\n3. Guruhni tanlang, «Hammasi keldi» ni bosing, kelmaganlarni «Yo'q», kechikkanlarni «Kech» qiling.\n4. «Saqlash» ni bosing. \"Saqlandi\" yozuvi chiqsa — tayyor.\nInternet bo'lmasa, belgilar telefonda saqlanib turadi. Aloqa tiklanganda «Qayta saqlash» ni bosing.\n\"Kelmadi\" va \"kechikdi\" belgisi ota-onaga darhol xabar bo'lib boradi — diqqat bilan belgilang.\nSavol bo'lsa: [administrator ismi va raqami]."
};

export const HELP_SAFE_LIST: HelpSafeList = {
  "title": "Buzib qo'ymaysiz",
  "hint": "Bular xavfsiz — bemalol sinab ko'ring:",
  "items": [
    {
      "text": "Istalgan sahifani ochish, qidirish va filtrlash — hech narsani o'zgartirmaydi."
    },
    {
      "text": "Oynani ochib, «Bekor qilish» ni bosish."
    },
    {
      "text": "O'tgan darsning davomatini tuzatish — vaqt cheklovi yo'q."
    },
    {
      "text": "O'quvchini o'chirish — «Korzina» dan «Tiklash» bilan qaytadi.",
      "roles": "admin"
    },
    {
      "text": "Alohida narx — «Guruh narxiga qaytarish» bilan qaytadi.",
      "module": "payments"
    },
    {
      "text": "Kassa yozuvi — 60 soniya ichida «Bekor qilish», keyin «Xatoni to'g'rilash».",
      "module": "finance"
    },
    {
      "text": "Kun yakuni — rahbar «Kunni qayta ochish» bilan ochadi.",
      "module": "finance"
    },
    {
      "text": "Bo'limni (modulni) o'chirish — ma'lumotlar saqlanadi, qayta yoqsangiz joyida.",
      "roles": "admin"
    },
    {
      "text": "Tungi rejim va parolni almashtirish."
    }
  ],
  "irreversibleTitle": "Faqat shular qaytmaydi",
  "irreversible": [
    {
      "text": "Telegram orqali yuborilgan xabar (eslatma, \"kelmadi\" xabari)."
    },
    {
      "text": "«Pulni qaytarish» — qaytarilgan to'lov qayta tiklanmaydi.",
      "module": "finance"
    },
    {
      "text": "Lid, guruh, xona, yo'nalish, o'qituvchi, xodimni o'chirish — ekranda qaytarish tugmasi yo'q.",
      "roles": "admin"
    },
    {
      "text": "Yangi rol va yangi filial — o'chirish tugmasi yo'q.",
      "roles": "admin"
    }
  ]
};

export const HELP_TIMELINES: HelpTimeline[] = [
  {
    "section": "tolovlar",
    "title": "Oy davomida tizim o'zi nima qiladi",
    "hint": "To'lov muddati standart — oyning 5-kuni.",
    "items": [
      {
        "label": "1-sana, tunda",
        "text": "Har bir o'quvchiga yangi oy hisobi yoziladi. Hamyonda pul bo'lsa, o'zi ishlatiladi."
      },
      {
        "label": "1–5-sana",
        "text": "Hisob «To'lanmagan». Pul kelsa — «To'langan» yoki «Qisman»."
      },
      {
        "label": "6-sana, tunda",
        "text": "To'lanmagan hisoblar «Muddati o'tgan» bo'ladi, o'quvchida «Qarzdor» belgisi chiqadi."
      },
      {
        "label": "8-sana, 08:00",
        "text": "3 kunlik eslatma tayyor bo'ladi. Yuborishni siz bosasiz.",
        "module": "reminders"
      },
      {
        "label": "12-sana, 08:00",
        "text": "7 kunlik eslatma tayyor bo'ladi.",
        "module": "reminders"
      },
      {
        "label": "19-sana, 08:00",
        "text": "14 kunlik eslatma tayyor bo'ladi.",
        "module": "reminders"
      },
      {
        "label": "Har kuni 08:00",
        "text": "Direktorga Telegramda qarzdorlik xulosasi (Telegram ulangan bo'lsa).",
        "module": "reminders"
      },
      {
        "label": "Har dushanba 08:00",
        "text": "Direktorga haftalik xulosa: tushum, qarzdorlar, davomat (Telegram ulangan bo'lsa)."
      }
    ]
  }
];

export const HELP_GLOSSARY: HelpGlossary = {
  "slug": "lugat",
  "title": "Lug'at",
  "items": [
    {
      "slug": "g-guruh",
      "term": "Guruh",
      "text": "Bir o'qituvchi, bir jadval va bir narxdagi o'quv guruhi."
    },
    {
      "slug": "g-yonalish",
      "term": "Yo'nalish",
      "text": "Fan — masalan, Ingliz tili yoki Matematika."
    },
    {
      "slug": "g-hisob",
      "term": "Hisob",
      "text": "O'quvchining bir oylik to'lov varag'i; har guruhi alohida qator."
    },
    {
      "slug": "g-muddat",
      "term": "Muddat",
      "text": "Hisobni to'lash kuni — standart oyning 5-kuni."
    },
    {
      "slug": "g-qoldiq",
      "term": "Qoldiq",
      "text": "Hisobning hali to'lanmagan qismi."
    },
    {
      "slug": "g-balans-hamyon",
      "term": "Balans (hamyon)",
      "text": "Oldindan to'langan pul; keyingi oy hisobi yozilganda o'zi ishlatiladi."
    },
    {
      "slug": "g-qarzdor",
      "term": "Qarzdor",
      "text": "To'lov muddati o'tgan, lekin to'liq to'lanmagan hisobi bor o'quvchi.",
      "roles": "admin"
    },
    {
      "slug": "g-alohida-narx",
      "term": "Alohida narx",
      "text": "Bitta o'quvchi uchun guruh narxidan farqli oylik narx."
    },
    {
      "slug": "g-chegirma",
      "term": "Chegirma",
      "text": "Hisobni pulsiz yopadigan to'lov usuli; kassaga tushmaydi."
    },
    {
      "slug": "g-qisman-oy",
      "term": "Qisman oy",
      "text": "Oy o'rtasida qo'shilganda faqat qolgan kunlar hisoblanishi."
    },
    {
      "slug": "g-sababli",
      "term": "Sababli",
      "text": "Uzrli sabab bilan kelmagan; xabar yubormaydi, seriyani uzmaydi."
    },
    {
      "slug": "g-qoshimcha-dars",
      "term": "Qo'shimcha dars",
      "text": "Jadvaldan tashqari qo'lda qo'shilgan bir martalik dars."
    },
    {
      "slug": "g-kun-yakuni",
      "term": "Kun yakuni",
      "text": "Kun oxirida naqd pulni sanab, kassani yopish.",
      "module": "finance"
    },
    {
      "slug": "g-kassa-farqi",
      "term": "Kassa farqi",
      "text": "Sanalgan va kutilgan naqd orasidagi farq yozuvi.",
      "module": "finance"
    },
    {
      "slug": "g-pul-topshirish",
      "term": "Pul topshirish",
      "text": "Naqdni bank yoki direktorga berish; xarajat emas.",
      "module": "finance"
    },
    {
      "slug": "g-xatoni-togrilash",
      "term": "Xatoni to'g'rilash",
      "text": "Kassa yozuvini teskari yozuv bilan tuzatish; asl yozuv chizilgan holda qoladi.",
      "module": "finance"
    },
    {
      "slug": "g-tan-oylik",
      "term": "Tan oylik",
      "text": "Ustozning belgilangan oylik summasi.",
      "module": "payroll"
    },
    {
      "slug": "g-ulush",
      "term": "Ulush",
      "text": "Ustoz guruhlaridan tushgan pulning uning foizi.",
      "module": "payroll"
    },
    {
      "slug": "g-lid",
      "term": "Lid",
      "text": "Qiziqish bildirgan, hali o'quvchi bo'lmagan odam.",
      "module": "leads"
    },
    {
      "slug": "g-korzina",
      "term": "Korzina",
      "text": "O'chirilgan o'quvchilar; «Tiklash» bilan qaytadi."
    },
    {
      "slug": "g-kabinet",
      "term": "Kabinet",
      "text": "O'quvchi yoki ota-onaning telefondagi sahifasi."
    },
    {
      "slug": "g-seriya",
      "term": "Seriya",
      "text": "O'quvchining ketma-ket kelgan darslari soni."
    },
    {
      "slug": "g-filial",
      "term": "Filial",
      "text": "Bir direktor boshqaradigan alohida mustaqil markaz.",
      "module": "branches"
    },
    {
      "slug": "g-oqituvchi-rejimi",
      "term": "O'qituvchi rejimi",
      "text": "Direktordan boshqa hamma menyusini kundalik ishga qisqartiradi."
    }
  ]
};

export const HELP_ERRORS: HelpErrorItem[] = [
  {
    "message": "Telefon yoki parol noto'g'ri",
    "text": "Raqam yoki parol mos kelmadi. Parolni administrator yangilab beradi."
  },
  {
    "message": "Obuna to'xtatilgan — administrator bilan bog'laning",
    "text": "Markaz obunasi to'lanmagan. Direktor ERS bilan bog'lanadi."
  },
  {
    "message": "Bu guruh sizga biriktirilmagan. Faqat o'z guruhlaringiz bilan ishlay olasiz.",
    "text": "Administrator guruhni sizga biriktirishi kerak."
  },
  {
    "message": "Kelasi kun uchun davomat varaqasi ochilmaydi",
    "text": "Davomat faqat bugun va o'tgan kunlar uchun."
  },
  {
    "message": "Hisobingiz o'qituvchilar ro'yxatiga bog'lanmagan. Ma'muriyatga murojaat qiling.",
    "text": "Login telefoningiz o'qituvchi kartasidagi telefon bilan mos emas."
  },
  {
    "message": "Saqlanmadi — internet yo'q.",
    "text": "Belgilar telefonda turibdi. Aloqa tiklanganda «Qayta saqlash»."
  },
  {
    "message": "Xona band: bu vaqtda boshqa dars bor",
    "text": "Boshqa xona yoki vaqt tanlang.",
    "module": "schedule"
  },
  {
    "message": "Bu o'quvchi allaqachon mavjud (telefon va ism bir xil)",
    "text": "Bu odam ro'yxatda bor. «ochish» ni bosib, profilini ko'ring.",
    "module": "leads"
  },
  {
    "message": "Bu lid allaqachon o'quvchiga aylantirilgan",
    "text": "O'quvchi allaqachon ro'yxatda — «O'quvchilar» dan qidiring.",
    "module": "leads"
  },
  {
    "message": "Vaqt tugadi. Bu yozuvni «Xatoni to'g'rilash» orqali o'zgartirish mumkin.",
    "text": "60 soniya o'tdi. Yozuvni ochib «Xatoni to'g'rilash».",
    "module": "finance"
  },
  {
    "message": "Bu kun allaqachon yakunlangan.",
    "text": "Kun yopilgan. Rahbar «Kunni qayta ochish» qiladi.",
    "module": "finance"
  },
  {
    "message": "Avval kassa qoldig'ini kiriting.",
    "text": "«Kassa» da «Qoldiqni kiritish».",
    "module": "finance"
  },
  {
    "message": "Farq bor — sababni tanlang.",
    "text": "Kun yakunida farq sababini tanlash majburiy.",
    "module": "finance"
  },
  {
    "message": "Bu yozuv sizniki emas",
    "text": "Faqat o'zingiz yozgan yozuvni tahrirlaysiz.",
    "module": "finance"
  },
  {
    "message": "Kassada naqd yetarli emas.",
    "text": "Maosh uchun naqd yetmaydi — karta usulini tanlang yoki summani tekshiring.",
    "module": "payroll"
  },
  {
    "message": "Tasdiqlangan davrga tuzatish kiritilmaydi. Keyingi oyda qo'shishingiz mumkin.",
    "text": "Oy tasdiqlangan. Tuzatishni keyingi oyga qo'shing.",
    "module": "payroll"
  },
  {
    "message": "Bu amal faqat markaz egasi (Egasi) uchun ruxsat etilgan",
    "text": "Import va ommaviy login faqat markaz egasida.",
    "roles": "admin"
  },
  {
    "message": "Bu bo'lim hali yoqilmagan",
    "text": "Bo'lim markazda yoqilmagan. Rahbarga ayting."
  },
  {
    "message": "Faqat direktor uchun",
    "text": "Bu sahifa faqat direktorga ochiq.",
    "roles": "admin"
  },
  {
    "message": "Login yoki parol xato.",
    "text": "Kabinet: parolni administrator yangilaydi. Kabinet bo'limi yoqilmagan bo'lsa ham shu chiqadi."
  },
  {
    "message": "Narx saqlanmadi. Internetni tekshirib, qayta urinib ko'ring. Hozirgi narx o'zgarmadi.",
    "text": "Hech narsa o'zgarmadi — qayta urinib ko'ring.",
    "module": "payments"
  }
];

/** Accordion order: section slugs plus `lugat` where the glossary block sits. */
export const HELP_ORDER: string[] = [
  "birinchi-qadamlar",
  "vaziyatlar",
  "tolovlar",
  "davomat",
  "guruhlar-oquvchilar",
  "vazifalar",
  "jadval-xonalar",
  "ish-haqi",
  "kassa-hisobotlar",
  "lidlar",
  "filiallar",
  "xodimlar-ruxsatlar",
  "ilova-portal",
  "tarif-modullar",
  "lugat",
  "yordam"
];

export const HELP_SECTIONS: HelpSectionData[] = [
  {
    "slug": "birinchi-qadamlar",
    "title": "Birinchi qadamlar",
    "icon": "Rocket",
    "roles": "all",
    "intro": "Tizimga kirish, menyu va markazni ishga tushirish tartibi.",
    "questions": [
      {
        "slug": "tizimga-kirish",
        "title": "Tizimga qanday kiraman?",
        "roles": "all",
        "risk": "safe",
        "who": "Siz",
        "keywords": [
          "kirish",
          "login",
          "telefon",
          "parol",
          "kira olmayapman",
          "vxod",
          "noto'g'ri"
        ],
        "answer": "Telefon raqamingiz va parolingiz bilan kirasiz. Alohida login nomi yo'q — login telefon raqamingizning o'zi.",
        "steps": [
          "Kirish sahifasini oching.",
          "«TELEFON RAQAM» maydoniga raqamingizni yozing.",
          "«PAROL» ni kiriting.",
          "«Kirish» ni bosing."
        ],
        "example": "+998 90\u00a0123 45 67 va 901234567 — tizim uchun bir xil raqam. Oxirgi 9 raqam yetarli.",
        "note": [
          "\"Telefon yoki parol noto'g'ri\" chiqsa, raqamni yana tekshiring. Parolni administrator yangilab beradi."
        ],
        "see": [
          "parol-unutdim"
        ]
      },
      {
        "slug": "parol-unutdim",
        "title": "Parolimni unutdim — nima qilaman?",
        "roles": "all",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "parol esimdan chiqdi",
          "parolni tiklash",
          "unutdim",
          "kira olmayapman",
          "sbros",
          "parol"
        ],
        "answer": "Parolni administrator yangi qilib qo'yadi. Eski parolni hech kim ko'rmaydi — faqat yangisi yoziladi.",
        "steps": [
          "Administratorga ayting.",
          "Xodim bo'lsangiz: u «Xodimlar» da qalamni bosadi, «YANGI PAROL (ixtiyoriy)» ga yozadi, «Saqlash».",
          "O'qituvchi bo'lsangiz: «O'qituvchilar» da kalit belgisi → yangi parol → «Saqlash».",
          "Yangi parol bilan kiring va uni o'zingiznikiga almashtiring."
        ],
        "note": [
          "Hozircha yo'q — SMS orqali o'zi tiklash. Kirish sahifasidagi «Parolni unutdingizmi?» yozuvi bosilmaydi."
        ],
        "see": [
          "parolni-ozgartirish"
        ]
      },
      {
        "slug": "parolni-ozgartirish",
        "title": "Parolimni o'zim qanday almashtiraman?",
        "roles": "all",
        "risk": "safe",
        "who": "Siz",
        "keywords": [
          "parolni o'zgartirish",
          "yangi parol",
          "parol almashtirish",
          "profil"
        ],
        "answer": "«Mening profilim» sahifasida almashtirasiz. Buning uchun joriy parolni bilishingiz kerak.",
        "steps": [
          "Menyu pastidagi ismingizni bosing.",
          "«Parolni o'zgartirish» blokida «JORIY PAROL» ni yozing.",
          "«YANGI PAROL» ga kamida 6 belgi yozing.",
          "«O'zgartirish» ni bosing — \"Parol yangilandi ✓\" chiqadi."
        ],
        "link": {
          "href": "/profile",
          "label": "Profilga o'tish"
        },
        "note": [
          "\"Joriy parol noto'g'ri\" chiqsa — administratordan yangi parol so'rang."
        ]
      },
      {
        "slug": "asosiy-boshqaruv",
        "title": "\"Asosiy\" va \"Boshqaruv\" nima?",
        "roles": "all",
        "risk": "safe",
        "who": "Siz",
        "keywords": [
          "menyu",
          "bo'limlar",
          "sozlamalar",
          "asosiy",
          "boshqaruv",
          "almashtirish"
        ],
        "answer": "Menyu ikki qismga bo'lingan: kundalik ish va sozlamalar. Almashtirgich tepada, telefonda esa menyu ichida.",
        "steps": [
          "«Asosiy» — guruhlar, davomat, to'lovlar, vazifalar, dars jadvali.",
          "«Boshqaruv» — kassa, o'quvchilar, o'qituvchilar, xodimlar va sozlamalar.",
          "Sizga faqat bitta qism ochiq bo'lsa, almashtirgich chiqmaydi."
        ],
        "note": [
          "Bu «Qo'llanma» «Asosiy» ro'yxatining eng pastida turadi. «Boshqaruv» da bo'lsangiz, avval «Asosiy» ga o'ting."
        ]
      },
      {
        "slug": "menyuda-bolim-yoq",
        "title": "Menyuda kerakli bo'lim yo'q — nega?",
        "roles": "all",
        "risk": "safe",
        "who": "Direktor",
        "keywords": [
          "ko'rinmayapti",
          "menyu",
          "bo'lim yo'q",
          "ruxsat",
          "yo'qoldi",
          "chiqmayapti",
          "kassa yo'q",
          "lidlar yo'q"
        ],
        "answer": "Ikki sabab bo'ladi: rolingizda ruxsat yo'q yoki bo'lim markazda yoqilmagan. Ikkalasini ham direktor hal qiladi.",
        "steps": [
          "Direktorga qaysi bo'lim kerakligini ayting.",
          "Direktor «Rollar» da ruxsat qo'shadi yoki «Tarif va modullar» da bo'limni yoqadi.",
          "Ruxsat qo'shilgach, tizimdan chiqib, qayta kiring."
        ],
        "note": [
          "Yangi ruxsat faqat qayta kirgandan keyin kuchga kiradi."
        ],
        "see": [
          "ruxsat-kuchga-kirmadi"
        ]
      },
      {
        "slug": "yangi-markaz-tartibi",
        "title": "Yangi markazni qaysi tartibda to'ldiraman?",
        "roles": "admin",
        "risk": "safe",
        "who": "Direktor",
        "keywords": [
          "boshlash",
          "birinchi kun",
          "sozlash",
          "qayerdan boshlayman",
          "tartib",
          "yangi markaz",
          "ishga tushirish"
        ],
        "answer": "Avval asoslar, keyin guruhlar, keyin o'quvchilar. Guruh ochish uchun yo'nalish, xona va o'qituvchi kerak.",
        "steps": [
          "«Yo'nalishlar» da fanlarni qo'shing (masalan, Ingliz tili).",
          "«Xonalar» va «O'qituvchilar» ni qo'shing.",
          "«Guruhlar» (Boshqaruv) da guruhlarni oching: kunlar, vaqt, narx.",
          "O'quvchilarni kiriting va guruhga biriktiring.",
          "O'qituvchilarga login bering, birinchi to'lovni qabul qiling."
        ],
        "example": "\"Nur\" markazi 1-sentyabr kuni boshladi. Ertalab 3 yo'nalish va 4 ustozni qo'shdi. Tushlikkacha 9 guruh ochildi, kechqurun 120 o'quvchi import qilindi.",
        "see": [
          "import-excel",
          "qaysi-kuni-boshlash"
        ]
      },
      {
        "slug": "import-excel",
        "title": "Excel'dagi o'quvchilarni qanday kiritaman?",
        "roles": "admin",
        "permission": "student.create",
        "risk": "careful",
        "who": "Markaz egasi",
        "keywords": [
          "import",
          "excel",
          "ro'yxat",
          "ko'p o'quvchi",
          "200 o'quvchi",
          "yuklash",
          "nusxalash",
          "fayl"
        ],
        "answer": "«Import» orqali — Excel'dan qatorlarni nusxalab joylaysiz. Fayl yuklanmaydi.",
        "steps": [
          "«O'quvchilar» → «Import» ni bosing.",
          "Excel'dan to'rt ustunni nusxalang: FISH, telefon, jins, yosh.",
          "Maydonga joylang — pastda \"QATORLAR (N ta o'quvchi)\" chiqadi.",
          "Sonni tekshirib, «N tasini qo'shish» ni bosing."
        ],
        "example": "Bitta qator: Ali Valiyev, +998901112233, erkak, 14. Vergul, tab yoki nuqtali vergul bilan ajratilgan bo'lsa bo'ldi.",
        "undo": "Ha, bittalab — o'chirilgan o'quvchi «Korzina» ga tushadi va «Tiklash» bilan qaytadi.",
        "link": {
          "href": "/students",
          "label": "O'quvchilarga o'tish"
        },
        "note": [
          "Import faqat markaz egasiga ochiq, filial direktoriga ham yo'q. Bitta qatorda yosh 3–100 dan tashqarida bo'lsa, butun ro'yxat qabul qilinmaydi. Telefon takrori tekshirilmaydi — bir ro'yxatni ikki marta joylamang.",
          "Hozircha yo'q — import guruh, qarz, avans va ota-onani kiritmaydi. Guruhga keyin biriktirasiz."
        ],
        "see": [
          "eski-qarzlar",
          "guruhga-biriktirish"
        ]
      },
      {
        "slug": "eski-qarzlar",
        "title": "Excel'dagi eski qarzlarni qanday o'tkazaman?",
        "roles": "admin",
        "module": "payments",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "eski qarz",
          "oldingi qarz",
          "qarzlarni ko'chirish",
          "excel qarz",
          "eski to'lovlar",
          "avans ko'chirish"
        ],
        "answer": "Hozircha eski qarzni tizimga kiritishning maxsus yo'li yo'q. Eski qarzlarni Excel'da alohida yuriting, tizimda yangi oydan boshlang.",
        "steps": [
          "Eski qarzlar ro'yxatini Excel'da saqlab qo'ying.",
          "Tizimdagi hisoblar tizimga o'tgan oydan boshlanadi.",
          "Eski qarz to'lansa: «Kassa» → «+ Kirim» → kategoriya «Boshqa kirim», izohga o'quvchi ismi va \"eski qarz\".",
          "Excel'dagi qatorni yoping."
        ],
        "example": "Ota-ona 2 oylik eski qarz — 500\u00a0000 so'm olib keldi. Uni «+ Kirim» qilib yozasiz. O'quvchining yangi oy hisobi o'zgarmaydi.",
        "note": [
          "Hozircha yo'q — eski qarz va avansni import qilish. Eski qarzni «To'lovlar» orqali qabul qilmang: pul joriy oy hisobiga yoki hamyonga tushib qoladi."
        ],
        "see": [
          "kirim-yozish"
        ]
      },
      {
        "slug": "qaysi-kuni-boshlash",
        "title": "Qaysi kuni boshlagan ma'qul?",
        "roles": "admin",
        "module": "payments",
        "risk": "safe",
        "who": "Direktor",
        "keywords": [
          "qachon boshlash",
          "oyning boshi",
          "1-sana",
          "oy o'rtasida boshlash",
          "qisman oy"
        ],
        "answer": "Oyning 1-sanasida boshlash eng qulay. Unda hamma hisoblar to'liq oy bo'lib chiqadi.",
        "example": "O'quvchi 15-sentyabrda kiritilsa, sentyabr hisobi 285\u00a0000 emas, 152\u00a0000 bo'ladi. Tizim uni kiritilgan kundan hisoblaydi.",
        "note": [
          "Oy o'rtasida boshlasangiz ham bo'ladi — faqat birinchi oy hisoblari qisman chiqadi."
        ],
        "see": [
          "qisman-oy-formula"
        ]
      },
      {
        "slug": "ilovaga-birinchi-kirish",
        "title": "O'qituvchi: ilovaga birinchi marta qanday kiraman?",
        "roles": "teacher",
        "risk": "safe",
        "who": "O'qituvchi",
        "keywords": [
          "ilova",
          "eduvo ustoz",
          "telefondan kirish",
          "birinchi kirish",
          "ustoz ilovasi",
          "o'qituvchi login"
        ],
        "answer": "Administrator bergan telefon raqam va parol bilan kirasiz. Uch yo'l bor: telefon ilovasi, Telegram bot yoki kompyuter.",
        "steps": [
          "Administratordan login (telefoningiz) va parol oling.",
          "Telefon brauzerida https://admin.eduvo.uz/t ni oching.",
          "Telefon va parolni yozib, «Kirish» ni bosing.",
          "Ilovada «Darslarim», «Guruhlarim», «Profil» bo'limlari bor."
        ],
        "note": [
          "Ilova nomi — \"Eduvo Ustoz\". Kirmasa, parolni administrator qayta qo'yadi."
        ],
        "see": [
          "ilovani-ornatish",
          "telegram-davomat"
        ]
      },
      {
        "slug": "ilovani-ornatish",
        "title": "Ilovani telefonga qanday o'rnataman?",
        "roles": "all",
        "risk": "safe",
        "who": "Siz",
        "keywords": [
          "o'rnatish",
          "bosh ekran",
          "yarlik",
          "ilova",
          "skachat",
          "play market",
          "app"
        ],
        "answer": "Ilova brauzer orqali o'rnatiladi, Play Market kerak emas. Tizim o'zi taklif qilmaydi — brauzer menyusidan qo'shasiz.",
        "steps": [
          "Ilova havolasini telefon brauzerida oching va kiring.",
          "Android (Chrome): yuqoridagi uch nuqta → «Bosh ekranga qo'shish» yoki «O'rnatish».",
          "iPhone (Safari): «Ulashish» belgisi → «Bosh ekranga».",
          "Bosh ekranda ilova belgisi paydo bo'ladi."
        ],
        "example": "O'qituvchi ilovasi \"Eduvo Ustoz\", ota-ona va o'quvchinikisi \"Eduvo\", kompyuter tizimi \"Eduvo ERP\" nomi bilan chiqadi."
      },
      {
        "slug": "hisobiga-kirish",
        "title": "\"Hisobiga kirish\" (ko'z belgisi) nima?",
        "roles": "admin",
        "permission": "user.update",
        "risk": "careful",
        "who": "Administrator",
        "keywords": [
          "ko'z",
          "hisobiga kirish",
          "uning ko'zi bilan",
          "kabinetini ko'rish",
          "tekshirish",
          "ota-ona nimani ko'radi"
        ],
        "answer": "Xodim, o'qituvchi yoki o'quvchi ekranini uning o'zi ko'rganday ko'rasiz. Tepada \"Siz {ism} sifatida kirgansiz\" yozuvi turadi.",
        "steps": [
          "Ro'yxatda odam qatoridagi ko'z belgisini bosing.",
          "Kerakli joyni tekshiring.",
          "Qaytish uchun tepadagi «ERS hisobimga qaytish» ni bosing."
        ],
        "example": "Ota-ona \"Kabinetda to'lovim ko'rinmayapti\" dedi. O'quvchi qatoridagi ko'zni bosib, kabinetini o'zingiz ko'rasiz.",
        "undo": "Kirib-chiqish hech narsani o'zgartirmaydi. Lekin ichkarida bosgan tugmalar o'sha odam nomidan bajariladi.",
        "note": [
          "O'quvchi kabineti 1 soat ochiq turadi."
        ]
      },
      {
        "slug": "qizil-nuqta",
        "title": "Qo'ng'iroqchadagi qizil nuqta nimani bildiradi?",
        "roles": "all",
        "permission": "student.read",
        "risk": "safe",
        "who": "Siz",
        "keywords": [
          "bildirishnoma",
          "qo'ng'iroqcha",
          "qizil nuqta",
          "xabarlar",
          "uvedomleniye"
        ],
        "answer": "Oxirgi 24 soatda yangi hodisa bo'lganini bildiradi. Bu \"o'qilmagan\" degani emas.",
        "steps": [
          "Qo'ng'iroqchani bosing — oxirgi 15 ta hodisa chiqadi.",
          "Bular: to'lov qabul qilindi, kelmadi/kechikdi, yangi vazifa, vazifa qabul qilindi, to'lov eslatmasi."
        ],
        "note": [
          "Hozircha yo'q — \"o'qildi\" deb belgilash. Telefonda qo'ng'iroqcha ko'rinmaydi, faqat kompyuterda."
        ]
      }
    ],
    "tip": "Tepadagi oy belgisi tungi rejimni yoqadi. Kechki guruhlar bilan ishlaganda ko'zni kamroq charchatadi."
  },
  {
    "slug": "vaziyatlar",
    "title": "Tez-tez vaziyatlar",
    "icon": "MessagesSquare",
    "roles": "all",
    "intro": "Qabulxonada tez-tez bo'ladigan holatlar — nima deyish va nima qilish.",
    "questions": [
      {
        "slug": "nega-130000",
        "title": "Ota-ona: \"Nega 130\u00a0000? Guruh narxi 300\u00a0000-ku\"",
        "roles": "admin",
        "module": "payments",
        "permission": "payment.read",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "nega kam",
          "nega bunday summa",
          "oy o'rtasida keldi",
          "15-sanada keldi",
          "to'liq to'laydimi",
          "qisman oy",
          "hisob boshqacha"
        ],
        "answer": "O'quvchi guruhga qo'shilgan kundan oy oxirigacha hisoblanadi. Kelgan kuni tizimga kiritilgan bo'lsa, summa kunlarga to'g'ri keladi.",
        "example": "Nilufar 18-sentyabrda qo'shildi. Narx 300\u00a0000, sentyabr 30 kun.\n30 − 18 + 1 = 13 kun.\n300\u00a0000 ÷ 30 × 13 = 130\u00a0000 so'm.\nOktyabrdan u to'liq 300\u00a0000 to'laydi.",
        "parentReply": "Assalomu alaykum! [Nilufar] [18-sentyabr]dan o'qishni boshladi. [Sentyabr] uchun faqat qatnashgan kunlari hisoblandi: [13] kun, [130\u00a0000] so'm. [Oktyabr]dan oylik to'lov to'liq — [300\u00a0000] so'm bo'ladi. Rahmat!",
        "link": {
          "href": "/payments",
          "label": "To'lovlarga o'tish"
        },
        "note": [
          "Hisob tizimga kiritilgan kundan boshlanadi, darsga kelgan kundan emas. O'quvchini kelgan kuni kiriting."
        ],
        "see": [
          "qisman-oy-formula"
        ]
      },
      {
        "slug": "yarmini-berdi",
        "title": "Ota-ona: \"Hozir yarmini beraman\"",
        "roles": "admin",
        "module": "payments",
        "permission": "payment.create",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "yarmi",
          "qisman to'lov",
          "bir qismi",
          "bo'lib to'lash",
          "qolganini keyin",
          "avans qismi"
        ],
        "answer": "Berilgan summani qabul qilasiz, hisob «Qisman» bo'ladi. Qolgan summa hisobda turadi.",
        "steps": [
          "«To'lovlar» da o'quvchi hisobini toping.",
          "«+ Qabul qilish» ni bosing.",
          "«TO'LOV SUMMASI» ni berilgan pulga o'zgartiring.",
          "«TO'LOV USULI» ni tanlab, «To'lovni tasdiqlash» ni bosing."
        ],
        "example": "Sardorning hisobi 400\u00a0000. Onasi 150\u00a0000 berdi. Hisob «Qisman», qoldiq 250\u00a0000. Muddat o'tsa, qoldiq bo'yicha eslatma tayyorlanadi.",
        "undo": "Ha, lekin faqat to'liq: «Kassa» → yozuv → «Pulni qaytarish».",
        "parentReply": "To'lovingiz qabul qilindi: [150\u00a0000] so'm. [Sentyabr] uchun qolgan summa — [250\u00a0000] so'm. Qulay vaqtda to'lashingiz mumkin. Rahmat!",
        "link": {
          "href": "/payments",
          "label": "To'lovlarga o'tish"
        }
      },
      {
        "slug": "uch-oylik-oldindan",
        "title": "Ota-ona: \"3 oyga oldindan to'layman\"",
        "roles": "admin",
        "module": "payments",
        "permission": "payment.create",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "oldindan",
          "3 oylik",
          "avans",
          "bir necha oy",
          "keyingi oylar",
          "ortiqcha",
          "predoplata"
        ],
        "answer": "Hammasini bitta to'lov qilib qabul qiling. Ortgan pul hamyonga tushadi va keyingi oylarni o'zi yopadi.",
        "steps": [
          "«To'lovlar» sahifasi tepasidagi «To'lov qabul qilish» ni bosing.",
          "O'quvchini ism bo'yicha toping.",
          "«SUMMA» ga butun pulni yozing, usulni tanlang.",
          "«Tasdiqlash» ni bosing."
        ],
        "example": "Madina oyiga 300\u00a0000 to'laydi. Otasi 900\u00a0000 berdi. Sentyabr yopiladi, 600\u00a0000 hamyonda qoladi. 1-oktyabr tunda oktyabr hisobi hamyondan yopiladi, 1-noyabrda noyabr ham.",
        "undo": "Ha, lekin faqat butun to'lov: «Kassa» → yozuv → «Pulni qaytarish».",
        "parentReply": "To'lovingiz qabul qilindi: [900\u00a0000] so'm. [Sentyabr] to'landi, qolgan [600\u00a0000] so'm hisobingizda turibdi — [oktyabr] va [noyabr] shundan o'zi yopiladi. Rahmat!",
        "link": {
          "href": "/payments",
          "label": "To'lovlarga o'tish"
        },
        "see": [
          "hamyon-balans"
        ]
      },
      {
        "slug": "aka-uka-chegirma",
        "title": "Ota-ona: \"Ikki farzandim o'qiydi, chegirma bormi?\"",
        "roles": "admin",
        "module": "payments",
        "permission": "payment.read",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "aka-uka",
          "opa-singil",
          "ikki farzand",
          "oilaviy chegirma",
          "doimiy chegirma",
          "arzonroq",
          "alohida narx"
        ],
        "answer": "Doimiy chegirma uchun ikkinchi farzandga alohida oylik narx qo'yasiz. Bir martalik bo'lsa — «Chegirma» to'lov usuli.",
        "steps": [
          "«O'quvchilar» → farzand profilini oching.",
          "«Guruhlari» kartasida «Narxni o'zgartirish» ni bosing.",
          "«Boshqa narx» ni tanlab, summani yozing.",
          "«Davom etish» → «Saqlash»."
        ],
        "example": "Jasur va Javohir bir guruhda, narx 300\u00a0000. Javohirga 250\u00a0000 qo'yildi. Sentyabr hisobiga pul tushmagan bo'lsa — sentyabrdan. Tushgan bo'lsa — oktyabrdan.",
        "undo": "Ha. Shu oynada «Guruh narxiga qaytarish».",
        "parentReply": "Assalomu alaykum! [Javohir] uchun oylik to'lov [oktyabr]dan [250\u00a0000] so'm bo'ladi. [Jasur]niki o'zgarmaydi — [300\u00a0000] so'm. Rahmat!",
        "link": {
          "href": "/students",
          "label": "O'quvchilarga o'tish"
        },
        "see": [
          "alohida-narx",
          "chegirma-qanday"
        ]
      },
      {
        "slug": "boshqa-oquvchiga-yozdim",
        "title": "Pulni boshqa o'quvchiga yozib yubordim",
        "roles": "admin",
        "module": "finance",
        "risk": "careful",
        "who": "Kassani to'g'rilash ruxsati bor xodim",
        "keywords": [
          "xato to'lov",
          "noto'g'ri o'quvchi",
          "adashib yozdim",
          "boshqa bolaga",
          "to'lovni o'chirish",
          "storno"
        ],
        "answer": "Xato to'lovni to'liq qaytarasiz, keyin to'g'ri o'quvchiga qayta qabul qilasiz. To'lovni o'chirish tugmasi yo'q — shu yo'l bilan tuzatiladi.",
        "steps": [
          "«Kassa» da shu to'lov yozuvini oching.",
          "«Pulni qaytarish» → sabab «Boshqa sabab», izohga \"xato o'quvchi\".",
          "«To'lovlar» → to'g'ri o'quvchiga shu summani qabul qiling."
        ],
        "example": "285\u00a0000 so'm Aziz o'rniga Azizaga yozildi. Azizaning to'lovi qaytarildi — hisobi yana «To'lanmagan». Keyin Azizga 285\u00a0000 qabul qilindi.",
        "undo": "Qaytarilgan to'lov qayta tiklanmaydi. Kerak bo'lsa, yangi to'lov qabul qilinadi.",
        "link": {
          "href": "/transactions",
          "label": "Kassaga o'tish"
        },
        "note": [
          "Ota-onaga \"To'lov qabul qilindi\" xabari ketgan bo'lishi mumkin — uni qaytarib bo'lmaydi."
        ],
        "see": [
          "pulni-qaytaring"
        ]
      },
      {
        "slug": "xato-tolov-kassasiz",
        "title": "Xato to'lov yozdim, lekin menyuda \"Kassa\" yo'q",
        "roles": "admin",
        "module": "payments",
        "permission": "payment.create",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "xato to'lov",
          "kassa yo'q",
          "qaytarish yo'q",
          "o'chirish",
          "to'lovni bekor qilish"
        ],
        "answer": "To'lovni qaytarish faqat «Kassa» bo'limida bor. U bo'lmasa, xato to'lovni ekrandan tuzatib bo'lmaydi.",
        "steps": [
          "O'quvchi ismi, summa va sanani yozib oling.",
          "Direktorga ayting.",
          "Direktor «Kassa» bo'limini yoqadi yoki ERS jamoasiga murojaat qiladi."
        ],
        "note": [
          "Hozircha yo'q — «To'lovlar» sahifasida to'lovni bekor qilish."
        ],
        "see": [
          "boshqa-oquvchiga-yozdim"
        ]
      },
      {
        "slug": "pulni-qaytaring",
        "title": "Ota-ona: \"Bolam ketdi, pulni qaytaring\"",
        "roles": "admin",
        "module": "finance",
        "risk": "irreversible",
        "who": "Kassani to'g'rilash ruxsati bor xodim",
        "keywords": [
          "pulni qaytarish",
          "qaytarib bering",
          "refund",
          "vozvrat",
          "ketdi",
          "qisman qaytarish",
          "yarmini qaytarish"
        ],
        "answer": "Tizimda to'lov faqat to'liq qaytariladi. Qismini qaytarish uchun: butunini qaytaring, qoladigan qismini qayta qabul qiling.",
        "steps": [
          "«Kassa» → to'lov yozuvi → «Pulni qaytarish», sababni tanlang.",
          "Qoladigan qismni «To'lovlar» → «To'lov qabul qilish» bilan qabul qiling.",
          "Hisobda qolgan summani «+ Qabul qilish» → «Chegirma» bilan yoping — aks holda o'quvchi «Qarzdor» bo'lib qoladi.",
          "O'quvchini o'chiring — keyingi oy hisob yozilmaydi."
        ],
        "example": "Doniyor 300\u00a0000 to'lagan, 15 kun o'qib ketdi. 300\u00a0000 qaytarildi, 150\u00a0000 qayta qabul qilindi, qolgan 150\u00a0000 «Chegirma» bilan yopildi. Onasiga 150\u00a0000 berildi.",
        "undo": "Yo'q. Qaytarilgan to'lov qayta tiklanmaydi — xato bo'lsa, yangi to'lov qabul qilasiz.",
        "parentReply": "Assalomu alaykum! [Doniyor] [15] kun o'qidi — [150\u00a0000] so'm. Qolgan [150\u00a0000] so'mni qaytaramiz. Olib ketishingiz mumkin. Rahmat!",
        "link": {
          "href": "/transactions",
          "label": "Kassaga o'tish"
        },
        "see": [
          "oquvchi-ketdi"
        ]
      },
      {
        "slug": "oquvchi-ketdi",
        "title": "O'quvchi boshqa kelmaydi — nima qilaman?",
        "roles": "admin",
        "permission": "student.delete",
        "risk": "careful",
        "who": "Administrator",
        "keywords": [
          "ketdi",
          "o'qishni tashladi",
          "chiqib ketdi",
          "boshqa kelmaydi",
          "arxiv",
          "ketgan o'quvchi"
        ],
        "answer": "Hozir yagona yo'l — o'quvchini o'chirish. Shunda keyingi oydan unga hisob yozilmaydi.",
        "steps": [
          "«O'quvchilar» da o'quvchini toping.",
          "O'chirish belgisini bosing.",
          "\"{ism} — o'chirilsinmi? (keyin tiklash mumkin)\" — tasdiqlang."
        ],
        "example": "Kamola dekabrda ketdi. 20-dekabrda o'chirildi — yanvar hisobi yozilmaydi. Dekabr hisobi o'zgarmaydi.",
        "undo": "Ha. «Korzina» → «Tiklash» — guruhlari bilan qaytadi.",
        "link": {
          "href": "/students",
          "label": "O'quvchilarga o'tish"
        },
        "note": [
          "Hozircha yo'q — \"ketdi\" holati va ketish sababi. Sababni daftarga yozib qo'ying.",
          "O'chirish joriy oy hisobini kamaytirmaydi. To'lanmagan qoldiq qarz bo'lib turadi — kechirsangiz, «Chegirma» bilan yoping."
        ],
        "see": [
          "oquvchini-ochirish"
        ]
      },
      {
        "slug": "ustoz-kasal",
        "title": "Ustoz kasal, 2 ta dars bo'lmadi — pul nima bo'ladi?",
        "roles": "admin",
        "module": "payments",
        "permission": "payment.create",
        "risk": "careful",
        "who": "Administrator",
        "keywords": [
          "dars bo'lmadi",
          "ustoz kasal",
          "dars qoldirildi",
          "bayram",
          "o'tilmagan dars",
          "kompensatsiya"
        ],
        "answer": "Tizim o'zi hech narsani kamaytirmaydi. Ikki yo'l bor: darsni qo'shimcha kuni o'tish yoki chegirma qilish.",
        "steps": [
          "Qo'shimcha dars: «Dars jadvali» → «Qo'shimcha dars» → sana, vaqt, guruh → «Dars qo'shish».",
          "Yoki chegirma: «To'lovlar» → hisob → «+ Qabul qilish» → summa → usul «Chegirma»."
        ],
        "example": "Oyda 12 dars, narx 300\u00a0000. 2 dars bo'lmadi: 300\u00a0000 ÷ 12 × 2 = 50\u00a0000 so'm chegirma. Bu kassaga pul bo'lib tushmaydi.",
        "undo": "Chegirma ham to'lov kabi — faqat «Pulni qaytarish» bilan qaytadi.",
        "parentReply": "Assalomu alaykum! Ustozimiz betob bo'lgani uchun [2] dars o'tmadi. Buning uchun [sentyabr] to'lovingizdan [50\u00a0000] so'm kamaytirildi. Uzr so'raymiz!",
        "note": [
          "Chegirma qilingan qism ustoz foiziga kirmaydi."
        ],
        "see": [
          "qoshimcha-dars",
          "chegirma-qanday"
        ]
      },
      {
        "slug": "tatil-muzlatish",
        "title": "Ota-ona: \"Bolam bir oy ta'tilga ketadi, to'xtatib turing\"",
        "roles": "admin",
        "module": "payments",
        "permission": "payment.read",
        "risk": "careful",
        "who": "Administrator",
        "keywords": [
          "muzlatish",
          "ta'til",
          "to'xtatish",
          "pauza",
          "bir oy kelmaydi",
          "safar",
          "kasal",
          "zamorozka"
        ],
        "answer": "Muzlatish funksiyasi hozircha yo'q. O'rniga ta'til oyida alohida narxni 0 qilasiz, keyingi oy boshida guruh narxiga qaytarasiz.",
        "steps": [
          "Ta'til oyining boshida, shu oyga pul tushmasdan: profil → «Guruhlari» → «Narxni o'zgartirish».",
          "«Boshqa narx» → 0 yozing (\"Bepul\" izohi chiqadi) → «Davom etish» → «Saqlash».",
          "Keyingi oyning 1-kuni shu oynada «Guruh narxiga qaytarish»."
        ],
        "example": "Otabek iyulda safarga ketdi. 1-iyulda narx 0 qilindi — iyul hisobi o'chdi. 1-avgustda guruh narxiga qaytarildi — avgust hisobi to'liq yozildi.",
        "undo": "Ha — «Guruh narxiga qaytarish».",
        "note": [
          "Oy tugamasdan qaytarsangiz, o'sha oy hisobi yangi narx bilan yozilib qoladi. Qaytarishni aynan keyingi oyning 1-kuni qiling.",
          "Ta'til oyiga pul tushgan bo'lsa (hamyondan o'zi qo'llangan bo'lsa ham), 0 narx keyingi oydan qo'llanadi. Unda ta'til oyini «Chegirma» bilan yoping."
        ],
        "see": [
          "alohida-narx"
        ]
      },
      {
        "slug": "bola-kelmadi-xabar-kelmadi",
        "title": "Ota-ona: \"Bolam kelmagan ekan, menga xabar kelmadi\"",
        "roles": "admin",
        "module": "portal",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "xabar kelmadi",
          "bildirishnoma kelmadi",
          "sms kelmadi",
          "telegram xabar",
          "ota-onaga xabar",
          "bilmay qoldim"
        ],
        "answer": "Xabar faqat Telegram yoki kabinet orqali boradi. SMS hozircha yuborilmaydi.",
        "steps": [
          "Ustoz shu darsda «Kelmadi» deb belgilaganini tekshiring.",
          "«Mening profilim» → «Markaz sozlamalari» → «Ota-onaga bildirishnoma» yoqilganmi?",
          "Ota-ona Telegram botga kabinet logini bilan kirganmi? Kirmagan bo'lsa — pastdagi javobni yuboring."
        ],
        "example": "Zarina \"kelmadi\" deb belgilandi, lekin onasi botga ulanmagan edi. Admin login yubordi, ertasidan xabarlar kela boshladi.",
        "parentReply": "Assalomu alaykum! Xabarlar Telegram orqali keladi. https://t.me/eduvo_erp_bot ni oching, «Ilovani ochish» ni bosing. Login: [v123], parol: [parol]. Shundan keyin davomat va to'lov xabarlari Telegramga keladi.",
        "note": [
          "Hozircha yo'q — SMS xabarlar."
        ],
        "see": [
          "telegram-ulash"
        ]
      },
      {
        "slug": "xato-kelmadi-xabari",
        "title": "Ota-ona: \"Bolam darsda edi, 'kelmadi' xabari keldi\"",
        "roles": "all",
        "module": "attendance",
        "risk": "careful",
        "who": "O'qituvchi",
        "keywords": [
          "xato belgiladim",
          "noto'g'ri kelmadi",
          "adashib",
          "keldi edi",
          "xabar xato ketdi",
          "kelmadi xato"
        ],
        "answer": "Davomatni tuzatsa bo'ladi, lekin ketgan xabar qaytmaydi. Ota-onaga tuzatilganini aytib qo'ying.",
        "steps": [
          "O'qituvchi o'sha darsning davomatini qayta ochadi.",
          "O'quvchini «Keldi» qiladi va saqlaydi.",
          "Administrator ota-onaga qisqa xabar yozadi."
        ],
        "example": "Ustoz Aziza Umarovani Aziza Karimova bilan adashtirdi. 5 daqiqada tuzatdi, admin onasiga uzr yozdi.",
        "undo": "Belgini tuzatish — ha. Yuborilgan Telegram xabari — yo'q.",
        "parentReply": "Assalomu alaykum! Uzr, [Aziza] bugun darsda edi — davomat xato belgilangan ekan, tuzatildi. Xavotirga sabab yo'q.",
        "see": [
          "otgan-darsni-tuzatish"
        ]
      },
      {
        "slug": "kassada-kam",
        "title": "Kun oxirida kassada 50\u00a0000 kam chiqdi",
        "roles": "admin",
        "module": "finance",
        "permission": "transaction.create",
        "risk": "careful",
        "who": "Kassir",
        "keywords": [
          "pul kam",
          "kassa to'g'ri kelmadi",
          "farq",
          "yetishmaydi",
          "ortiqcha pul",
          "kamomad",
          "nedostacha"
        ],
        "answer": "Kunni haqiqiy sanalgan summa bilan yopasiz. Farq sabab bilan alohida yoziladi — yashirilmaydi.",
        "steps": [
          "«Kassa» → «Kun yakuni».",
          "«SANAB CHIQQAN SUMMA (naqd)» ga qo'lingizdagi pulni yozing.",
          "Farq chiqsa, sababni tanlang, masalan «Yozilmagan xarajat» yoki «Keyin aniqlanadi».",
          "«Kunni yakunlash» ni bosing."
        ],
        "example": "Hisob bo'yicha 1\u00a0250\u00a0000, sanalgani 1\u00a0200\u00a0000. Farq −50\u00a0000 \"Kassa farqi\" bo'lib yoziladi. Ertaga kassa 1\u00a0200\u00a0000 dan boshlanadi.",
        "undo": "Ha — direktor «Kunni qayta ochish» qiladi, farq yozuvi bekor bo'ladi.",
        "link": {
          "href": "/transactions",
          "label": "Kassaga o'tish"
        },
        "note": [
          "Pul keyin topilsa, direktorga ayting — u kunni qayta ochadi, siz qayta yopasiz."
        ],
        "see": [
          "kun-yakuni"
        ]
      },
      {
        "slug": "kecha-pul-oldim",
        "title": "Pulni kecha oldim, bugun kiritdim — sana to'g'rimi?",
        "roles": "admin",
        "module": "payments",
        "permission": "payment.create",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "kecha oldim",
          "kechikib kiritdim",
          "sana",
          "o'tgan sana",
          "eski sana",
          "to'lov sanasi"
        ],
        "answer": "O'quvchi to'lovi doim bugungi sana bilan yoziladi. O'tgan sanani tanlab bo'lmaydi.",
        "example": "Dilshod juma kuni pul berdi, admin dushanba kiritdi. To'lov dushanba sanasida turadi, hisob esa baribir o'sha oy uchun yopiladi.",
        "note": [
          "Hozircha yo'q — o'quvchi to'lovini o'tgan sanaga yozish. Pulni imkon qadar o'sha kuni kiriting, aks holda kassa kun yakuni to'g'ri kelmaydi."
        ]
      },
      {
        "slug": "chek-soradi",
        "title": "Ota-ona chek so'rayapti",
        "roles": "admin",
        "module": "payments",
        "permission": "payment.read",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "chek",
          "kvitansiya",
          "chop etish",
          "pechat",
          "dalil",
          "to'lov tasdig'i"
        ],
        "answer": "Chek chop etish hozircha yo'q. Kabinet ulangan bo'lsa, to'lov ota-onaning «To'lov» bo'limida ko'rinadi.",
        "steps": [
          "Ota-ona kabinetga kirganmi — tekshiring.",
          "Kirgan bo'lsa: «To'lov» bo'limida oy va summa ko'rinadi.",
          "Kirmagan bo'lsa: pastdagi matnni yuboring."
        ],
        "parentReply": "To'lovingiz tizimga yozildi: [300\u00a0000] so'm, [sentyabr] oyi uchun. Telefoningizdagi kabinetda «To'lov» bo'limida ko'rishingiz mumkin. Rahmat!",
        "note": [
          "Hozircha yo'q — chek chop etish. To'lov qabul qilinganda Telegramga \"To'lov qabul qilindi\" xabari ham boradi (ulangan bo'lsa)."
        ]
      },
      {
        "slug": "ustoz-ketdi",
        "title": "Ustoz ishdan ketdi — guruhlari nima bo'ladi?",
        "roles": "admin",
        "permission": "group.update",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "ustoz ketdi",
          "o'qituvchi almashdi",
          "yangi ustoz",
          "guruhni boshqa ustozga",
          "ishdan bo'shadi"
        ],
        "answer": "Guruhlarni yangi ustozga o'tkazasiz. O'tgan oylar hisobi eski ustoz nomida qoladi.",
        "steps": [
          "«Guruhlar» (Boshqaruv) → guruh qatoridagi qalam.",
          "«O'QITUVCHI» ni yangisiga almashtiring → «Saqlash».",
          "Har bir guruh uchun takrorlang."
        ],
        "example": "Ustoz Sanjar 15-oktyabrda ketdi. Uning 3 guruhi Malika ustozga o'tdi. Sentyabr hisoblari Sanjar nomida qoldi.",
        "link": {
          "href": "/manage-groups",
          "label": "Guruhlarga o'tish"
        },
        "note": [
          "Eski ustoz kartasini o'chirsangiz ham, uning login hisobi ochiq qoladi. «Xodimlar» dan ham o'chiring."
        ],
        "see": [
          "oqituvchi-ochirish"
        ]
      }
    ],
    "tip": "Har savolning pastida «Havolani nusxalash» bor. Hamkasbingizga Telegramda aynan kerakli javobni yuborishingiz mumkin."
  },
  {
    "slug": "tolovlar",
    "title": "To'lovlar va qarzlar",
    "icon": "CreditCard",
    "roles": "admin",
    "intro": "Oylik hisoblar qanday yoziladi, to'lov qanday qabul qilinadi, qarz qayerda ko'rinadi.",
    "questions": [
      {
        "slug": "hisob-qachon",
        "title": "Oylik hisob qachon yoziladi?",
        "roles": "all",
        "risk": "safe",
        "who": "Tizim o'zi",
        "keywords": [
          "hisob",
          "invoys",
          "hisob-faktura",
          "qachon chiqadi",
          "yangi oy",
          "oy boshi",
          "avtomatik"
        ],
        "answer": "Har oyning 1-sanasi tunda tizim o'zi yozadi. Bir o'quvchiga bir oyda bitta hisob, har guruhi alohida qator.",
        "steps": [
          "1-sana tunda — barcha o'quvchilarga yangi oy hisobi.",
          "O'quvchi guruhga qo'shilganda — shu oy hisobi darhol.",
          "Bepul (narxi 0) o'quvchiga hisob yozilmaydi."
        ],
        "example": "Shaxzod ingliz tili (300\u00a0000) va matematikada (250\u00a0000). Oktyabr hisobida ikki qator, jami 550\u00a0000.",
        "link": {
          "href": "/payments",
          "label": "To'lovlarga o'tish"
        },
        "note": [
          "Hisob ikki marta yozilmaydi — tizim buni o'zi tekshiradi."
        ]
      },
      {
        "slug": "hisob-chiqmadi",
        "title": "O'quvchi qo'shdim, lekin hisobi ko'rinmayapti",
        "roles": "all",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "hisob yo'q",
          "hisob chiqmadi",
          "to'lovda yo'q",
          "ko'rinmayapti",
          "o'quvchi hisobi"
        ],
        "answer": "Hisob faqat guruhga biriktirilganda yoziladi. Avval o'quvchi guruhda ekanini tekshiring.",
        "steps": [
          "«O'quvchilar» ro'yxatida «GURUH» ustuniga qarang.",
          "Bo'sh bo'lsa — o'quvchini guruhga biriktiring.",
          "«To'lovlar» da ismi bo'yicha qidiring."
        ],
        "note": [
          "Alohida narxi 0 (bepul) bo'lsa ham hisob yozilmaydi — bu to'g'ri."
        ],
        "see": [
          "guruhga-biriktirish"
        ]
      },
      {
        "slug": "muddat-qachon",
        "title": "To'lov muddati qachon?",
        "roles": "all",
        "risk": "safe",
        "who": "Tizim o'zi",
        "keywords": [
          "muddat",
          "5-sana",
          "oxirgi kun",
          "qachongacha",
          "srok",
          "to'lov kuni"
        ],
        "answer": "Standart muddat — oyning 5-kuni. 6-sana tunda to'lanmagan hisob «Muddati o'tgan» bo'ladi.",
        "example": "Oktyabr hisobi 1-oktyabrda yozildi. 5-oktyabrgacha «To'lanmagan». 6-oktyabr tunda — «Muddati o'tgan».",
        "note": [
          "Oy o'rtasida qo'shilgan o'quvchiga imtiyoz yo'q: 15-sanada qo'shilsa, hisobi darhol «Muddati o'tgan», o'zi «Qarzdor» ko'rinadi. To'lov olingach belgi yo'qoladi.",
          "Hozircha yo'q — muddatni ekrandan o'zgartirish. Boshqa kun kerak bo'lsa, direktor ERS jamoasidan so'raydi."
        ],
        "see": [
          "holatlar-manosi"
        ]
      },
      {
        "slug": "holatlar-manosi",
        "title": "\"Qisman\", \"To'lanmagan\", \"Muddati o'tgan\" nimani bildiradi?",
        "roles": "all",
        "risk": "safe",
        "who": "Tizim o'zi",
        "keywords": [
          "holat",
          "status",
          "qisman",
          "to'langan",
          "to'lanmagan",
          "muddati o'tgan",
          "oldinda"
        ],
        "answer": "Holat hisobga qancha pul tushganini ko'rsatadi. Tizim uni to'lovdan keyin o'zi yangilaydi.",
        "steps": [
          "«To'langan» — summa to'liq yopilgan.",
          "«Qisman» — bir qismi to'langan.",
          "«To'lanmagan» — pul tushmagan, muddat hali o'tmagan.",
          "«Muddati o'tgan» — muddat o'tgan, to'liq yopilmagan."
        ],
        "example": "400\u00a0000 lik hisobga 150\u00a0000 tushdi — «Qisman». Muddat o'tgach, keyingi tunda «Muddati o'tgan» bo'ladi."
      },
      {
        "slug": "qabul-hisob-boyicha",
        "title": "Hisob bo'yicha to'lovni qanday qabul qilaman?",
        "roles": "all",
        "permission": "payment.create",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "to'lov qabul qilish",
          "pul olish",
          "qabul qilish",
          "hisobni yopish",
          "to'lov kiritish",
          "oplata"
        ],
        "answer": "Hisob qatoridagi «+ Qabul qilish» tugmasi bilan. Summa hisobdagi qoldiq bilan o'zi to'ladi.",
        "steps": [
          "«To'lovlar» da o'quvchi ismini qidiring.",
          "Hisob qatorida «+ Qabul qilish» ni bosing.",
          "Summani tekshiring, usulni tanlang: «Naqd», «Karta» yoki «Chegirma».",
          "«To'lovni tasdiqlash» ni bosing."
        ],
        "example": "Asal oktyabr uchun 285\u00a0000 to'ladi. «+ Qabul qilish» → 285\u00a0000 → «Naqd». Hisob «To'langan», kassaga 285\u00a0000 kirim tushdi.",
        "undo": "Ha, lekin faqat to'liq: «Kassa» → yozuv → «Pulni qaytarish».",
        "link": {
          "href": "/payments",
          "label": "To'lovlarga o'tish"
        },
        "note": [
          "Qoldiqdan ko'p summa kiritsangiz, ortgani o'quvchi hamyoniga tushadi.",
          "Oyna yopilmasa — internetni tekshiring. Ba'zi xatolar bu oynada ko'rsatilmaydi."
        ],
        "see": [
          "qabul-oquvchi-boyicha"
        ]
      },
      {
        "slug": "qabul-oquvchi-boyicha",
        "title": "Bir necha oylik qarzni bitta to'lov bilan qanday olaman?",
        "roles": "all",
        "permission": "payment.create",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "bir necha oy",
          "eski qarz",
          "umumiy to'lov",
          "o'quvchi bo'yicha",
          "tepadagi tugma",
          "izoh"
        ],
        "answer": "Tepadagi «To'lov qabul qilish» tugmasi bilan. Pul eng eski hisobdan boshlab taqsimlanadi.",
        "steps": [
          "«To'lovlar» tepasidagi «To'lov qabul qilish» ni bosing.",
          "«O'QUVCHI» ga ism yozing — balansi ham ko'rinadi.",
          "«SUMMA», «TO'LOV USULI», kerak bo'lsa «IZOH».",
          "«Tasdiqlash» ni bosing."
        ],
        "example": "Avgust 285\u00a0000 (muddati o'tgan) va sentyabr 285\u00a0000. Ota 600\u00a0000 berdi. Ikkala oy «To'langan», 30\u00a0000 hamyonga. Oktyabr hisobi yozilganda 30\u00a0000 o'zi ishlatiladi.",
        "undo": "Ha, lekin faqat butun to'lov: «Kassa» → yozuv → «Pulni qaytarish».",
        "link": {
          "href": "/payments",
          "label": "To'lovlarga o'tish"
        },
        "note": [
          "Izoh faqat shu usulda bor. Izoh ota-onaga ko'rinmaydi."
        ],
        "see": [
          "hamyon-balans"
        ]
      },
      {
        "slug": "hamyon-balans",
        "title": "\"Balans\" (hamyon) nima?",
        "roles": "all",
        "risk": "safe",
        "who": "Tizim o'zi",
        "keywords": [
          "balans",
          "hamyon",
          "ortiqcha pul",
          "avans",
          "plus",
          "minus",
          "balansdagi pul"
        ],
        "answer": "Balans — o'quvchining oldindan to'lagan puli. Plus bo'lsa, keyingi oy hisobi yozilganda o'zi ishlatiladi.",
        "steps": [
          "Ortiqcha to'lov avtomatik balansga tushadi.",
          "1-sana tunda yangi hisob yozilganda balans qo'llanadi.",
          "Balans kassaga ikkinchi marta kirim bo'lib tushmaydi."
        ],
        "example": "Balansda 30\u00a0000. Oktyabr hisobi 285\u00a0000 yozildi, 30\u00a0000 qo'llandi. Hisob «Qisman», qoldiq 255\u00a0000, balans 0.",
        "note": [
          "Minus balans kamdan-kam bo'ladi: qaytarilgan to'lovning bir qismi allaqachon ishlatilgan bo'lsa."
        ],
        "see": [
          "qarzdorlar-qayerda"
        ]
      },
      {
        "slug": "qarzdorlar-qayerda",
        "title": "Qarzdorlarni qayerdan ko'raman?",
        "roles": "all",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "qarzdorlar",
          "qarz ro'yxati",
          "kim to'lamagan",
          "qarzdorlik",
          "to'lamaganlar",
          "top qarzdorlar"
        ],
        "answer": "«O'quvchilar» da filtr «Qarzdorlar» yoki «To'lovlar» da «Muddati o'tgan (qarzdor)». Qarzdor — to'lov muddati o'tib, hisobi to'liq yopilmagan o'quvchi.",
        "steps": [
          "«O'quvchilar» → filtr «Qarzdorlar».",
          "«To'lovlar» → «Muddati o'tgan (qarzdor)» — qaysi oy, qancha.",
          "Bosh sahifadagi «Top qarzdorlar» — eng katta 4 ta qarz."
        ],
        "example": "9-oktyabr. Filtr 14 o'quvchini ko'rsatdi. Admin eng eskisidan qo'ng'iroq qilishni boshladi.",
        "link": {
          "href": "/payments",
          "label": "To'lovlarga o'tish"
        },
        "note": [
          "Muddati hali kelmagan hisob qarz emas: 1–5-sanada hech kim qarzdor bo'lmaydi. Oy o'rtasida qo'shilgan o'quvchi to'laguncha «Qarzdor» ko'rinadi — uning muddati o'tib ketgan."
        ],
        "see": [
          "eslatmalar-tabi"
        ]
      },
      {
        "slug": "qisman-oy-formula",
        "title": "Oy o'rtasida qo'shilganda summa qanday hisoblanadi?",
        "roles": "all",
        "risk": "safe",
        "who": "Tizim o'zi",
        "keywords": [
          "qisman oy",
          "kunlar bo'yicha",
          "proporsional",
          "formula",
          "hisoblash",
          "oy o'rtasi",
          "nega bunday summa"
        ],
        "answer": "Guruh narxi oy kunlariga bo'linib, qolgan kunlarga ko'paytiriladi. Qo'shilgan kun ham hisobga kiradi.",
        "steps": [
          "Oydagi kunlar: 28, 29, 30 yoki 31.",
          "Qolgan kunlar = oy kunlari − qo'shilgan sana + 1.",
          "Summa = narx ÷ oy kunlari × qolgan kunlar."
        ],
        "example": "Narx 285\u00a0000, 15-sentyabr (30 kun): 16 kun → 152\u00a0000 so'm.\nNarx 285\u00a0000, 20-oktyabr (31 kun): 12 kun → 110\u00a0322,58 so'm.\nNarx 900\u00a0000, 30-iyun (oxirgi kun): 1 kun → 30\u00a0000 so'm.",
        "note": [
          "Hisob tizimga kiritilgan kundan boshlanadi, darsga kelgan kundan emas."
        ],
        "see": [
          "nega-130000"
        ]
      },
      {
        "slug": "ikkinchi-guruh-shu-oy",
        "title": "Oy o'rtasida ikkinchi guruhga qo'shsam, bu oy hisobi qanday bo'ladi?",
        "roles": "all",
        "risk": "safe",
        "who": "Tizim o'zi",
        "keywords": [
          "ikkinchi guruh",
          "yana bir guruh",
          "qo'shimcha kurs",
          "hisobga qo'shilmadi",
          "oy o'rtasida guruh"
        ],
        "answer": "Shu oy hisobiga hali pul tushmagan bo'lsa, yangi guruh qo'shilgan kundan oy oxirigacha qo'shiladi. Pul tushgan bo'lsa — yangi guruh keyingi oydan.",
        "example": "Sherzod ingliz tilida (300\u00a0000). 18-sentyabrda matematikaga (240\u00a0000) qo'shildi. Pul tushmagan: 13 kun → 104\u00a0000, sentyabr hisobi 404\u00a0000. 300\u00a0000 to'lab bo'lgan: sentyabr 300\u00a0000 qoladi. Oktyabrdan ikkalasi: 540\u00a0000.",
        "note": [
          "«Pul tushgan» — naqd, karta, chegirma yoki hamyondan, ozgina bo'lsa ham."
        ],
        "see": [
          "qisman-oy-formula",
          "narx-bu-oyga-tasir-qilmadi"
        ]
      },
      {
        "slug": "alohida-narx",
        "title": "Bitta o'quvchiga boshqa narx qanday qo'yaman?",
        "roles": "all",
        "permission": "student.update",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "alohida narx",
          "individual narx",
          "boshqa narx",
          "arzonroq",
          "chegirmali narx",
          "bepul",
          "narxni o'zgartirish"
        ],
        "answer": "O'quvchi profilida «Narxni o'zgartirish» orqali. Bu narx faqat shu o'quvchi va shu guruh uchun.",
        "steps": [
          "«O'quvchilar» → o'quvchi profilini oching.",
          "«Guruhlari» kartasida «Narxni o'zgartirish».",
          "«Boshqa narx» → «Shu o'quvchi uchun oylik narx» ga summani yozing.",
          "«Davom etish» → tasdiqni o'qing → «Saqlash»."
        ],
        "example": "Guruh 285\u00a0000. Laylo uchun 265\u00a0000 qo'yildi. Natija: \"Saqlandi. Sentabr hisobi 265\u00a0000 so'mga yangilandi.\"",
        "undo": "Ha. Shu oynada «Guruh narxiga qaytarish».",
        "note": [
          "0 yozsangiz — bepul, hisob yozilmaydi. 265 yozsangiz, tizim \"265\u00a0000 so'm demoqchimisiz?\" deb so'raydi."
        ],
        "see": [
          "narx-bu-oyga-tasir-qilmadi"
        ]
      },
      {
        "slug": "narx-bu-oyga-tasir-qilmadi",
        "title": "Narxni o'zgartirdim, bu oyga ta'sir qilmadi",
        "roles": "all",
        "risk": "safe",
        "who": "Tizim o'zi",
        "keywords": [
          "narx o'zgarmadi",
          "keyingi oydan",
          "eski narxda",
          "bu oyga ta'sir",
          "narx qo'llanmadi"
        ],
        "answer": "Shu oy hisobiga ozgina bo'lsa ham pul tushgan bo'lsa, yangi narx keyingi oydan qo'llanadi. Pul tushmagan bo'lsa — shu oydan.",
        "example": "Guruh 285\u00a0000. Sentyabrga 100\u00a0000 to'langan. 265\u00a0000 qo'yildi — sentyabr 285\u00a0000 qoladi, oktyabrdan 265\u00a0000.\nFarqni yopish: «+ Qabul qilish» → 20\u00a0000 → «Chegirma». Kassaga pul bo'lib yozilmaydi.",
        "note": [
          "Chegirma usuli bilan yopilgan to'lov ham \"pul tushgan\" hisoblanadi."
        ],
        "see": [
          "chegirma-qanday"
        ]
      },
      {
        "slug": "guruh-narxini-oshirdim",
        "title": "Guruh narxini oshirdim — eski o'quvchilarga ta'sir qiladimi?",
        "roles": "all",
        "permission": "group.update",
        "risk": "careful",
        "who": "Administrator",
        "keywords": [
          "narx oshdi",
          "guruh narxi",
          "yangi narx",
          "qimmatlashdi",
          "narxni o'zgartirish guruh"
        ],
        "answer": "Yozilgan hisoblar o'zgarmaydi. Yangi narx keyingi oy hisoblaridan qo'llanadi.",
        "steps": [
          "«Guruhlar» (Boshqaruv) → qalam → «NARX (SO'M)».",
          "Alohida narxli o'quvchilar bo'lsa, ogohlantirish chiqadi — ular o'z narxida qoladi.",
          "«Saqlash»."
        ],
        "example": "20-sentyabrda guruh narxi 285\u00a0000 dan 300\u00a0000 ga oshirildi. Sentyabr hisoblari 285\u00a0000 qoladi, oktyabrdan 300\u00a0000.",
        "undo": "Ha — narxni eski qiymatga qaytarasiz. Oradagi yangi hisob yozilgan bo'lsa, u o'zgarmaydi.",
        "link": {
          "href": "/manage-groups",
          "label": "Guruhlarga o'tish"
        }
      },
      {
        "slug": "chegirma-qanday",
        "title": "Chegirma qanday qilinadi?",
        "roles": "all",
        "permission": "payment.create",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "chegirma",
          "skidka",
          "kamaytirish",
          "bir martalik chegirma",
          "bepul oy",
          "aksiya"
        ],
        "answer": "Chegirma — to'lov usullaridan biri. Hisobni pulsiz yopadi.",
        "steps": [
          "«To'lovlar» → hisob → «+ Qabul qilish».",
          "«TO'LOV SUMMASI» ga chegirma summasini yozing.",
          "«TO'LOV USULI» → «Chegirma» → «To'lovni tasdiqlash»."
        ],
        "example": "Olimpiada g'olibi Mohinurga oktyabr uchun 100\u00a0000 chegirma. Hisob 300\u00a0000 edi — «Qisman», qoldiq 200\u00a0000.",
        "undo": "Ha, to'lov kabi: «Kassa» → yozuv → «Pulni qaytarish».",
        "note": [
          "Doimiy chegirma uchun alohida narx qo'ying. Ota-ona kabinetida bu \"Hisob kamaytirildi\" deb ko'rinadi."
        ],
        "see": [
          "chegirma-kassaga",
          "alohida-narx"
        ]
      },
      {
        "slug": "chegirma-kassaga",
        "title": "Chegirma kassaga tushadimi?",
        "roles": "all",
        "risk": "safe",
        "who": "Tizim o'zi",
        "keywords": [
          "chegirma kassa",
          "naqd qoldiq",
          "daromadga kiradimi",
          "chegirma hisobot",
          "ustoz foizi chegirma"
        ],
        "answer": "Kassa qoldig'iga tushmaydi — naqd va karta summasi o'zgarmaydi. Ustoz foizi ham chegirma qismidan hisoblanmaydi.",
        "steps": [
          "Kassa qoldig'i, kun yakuni va «SOF» — chegirmasiz.",
          "«Hisobotlar» dagi daromad va bosh sahifadagi «OYLIK DAROMAD» — chegirma bilan birga."
        ],
        "example": "Oyda 20\u00a0000\u00a0000 naqd/karta va 1\u00a0000\u00a0000 chegirma. Kassa 20\u00a0000\u00a0000 ko'rsatadi, «OYLIK DAROMAD» 21\u00a0000\u00a0000.",
        "note": [
          "Haqiqiy tushgan pulni kassadan qarang."
        ]
      },
      {
        "slug": "eslatmalar-tabi",
        "title": "Qarz eslatmalari qanday ishlaydi?",
        "roles": "all",
        "module": "reminders",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "eslatma",
          "qarz eslatmasi",
          "telegram eslatma",
          "3 kun",
          "7 kun",
          "14 kun",
          "avtomatik xabar",
          "napominaniye"
        ],
        "answer": "Tizim har kuni ertalab eslatmalarni tayyorlaydi, lekin o'zi yubormaydi. Har birini siz ko'rib, yuborasiz.",
        "steps": [
          "«To'lovlar» → «Eslatmalar» tabi.",
          "Muddatdan 3, 7 va 14 kun o'tgan hisoblar chiqadi.",
          "«Yuborish» — Telegramga darhol ketadi.",
          "«O'tkazib yuborish» — bu eslatma yuborilmaydi."
        ],
        "example": "Muddat 5-oktyabr. 8-oktyabrda 3 kunlik, 12-da 7 kunlik, 19-da 14 kunlik eslatma chiqadi.",
        "link": {
          "href": "/payments",
          "label": "To'lovlarga o'tish"
        },
        "note": [
          "«Yuborish» faqat Telegram ulangan o'quvchida bor. Ulanmaganda telefon raqami ko'rsatiladi — qo'ng'iroq qiling.",
          "Faqat administrator va markaz egasi ko'radi."
        ],
        "see": [
          "eslatma-yuborish"
        ]
      },
      {
        "slug": "eslatma-yuborish",
        "title": "Eslatmani yuborsam, qaytarib olsa bo'ladimi?",
        "roles": "all",
        "module": "reminders",
        "risk": "irreversible",
        "who": "Administrator",
        "keywords": [
          "eslatma yuborish",
          "xato yubordim",
          "qaytarib olish",
          "telegram xabar",
          "to'lagan edi"
        ],
        "answer": "Yo'q, yuborilgan xabar qaytmaydi. Shuning uchun yuborishdan oldin to'lovni tekshiring.",
        "steps": [
          "«Yuborish» ni bosing.",
          "Tasdiq oynasini o'qing: summa va ism.",
          "To'lov kelgan bo'lsa, «O'tkazib yuborish» ni tanlang."
        ],
        "example": "7 kunlik xabar: \"…to'lovi hali qabul qilinmadi. To'lov summasi: 250\u00a0000 so'm. Agar to'lovni allaqachon amalga oshirgan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.\"",
        "undo": "Yo'q. \"Yuborilgan xabarni qaytarib bo'lmaydi.\"",
        "note": [
          "Hozircha yo'q — hammasini bir tugmada yuborish."
        ]
      },
      {
        "slug": "eslatma-otkazib-yuborish",
        "title": "\"O'tkazib yuborish\" bosilsa nima bo'ladi?",
        "roles": "all",
        "module": "reminders",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "o'tkazib yuborish",
          "eslatmani olib tashlash",
          "yubormaslik",
          "keyingi eslatma"
        ],
        "answer": "Shu eslatma ro'yxatdan chiqadi va yuborilmaydi. To'lov kelmasa, keyingi bosqichda yangisi tayyorlanadi.",
        "example": "3 kunlik eslatma o'tkazib yuborildi. Pul kelmadi — 7 kunlik eslatma o'z vaqtida chiqadi."
      }
    ],
    "module": "payments",
    "permission": "payment.read",
    "tip": "To'lov qabul qilinganda ota-onaga Telegramda \"To'lov qabul qilindi\" xabari o'zi boradi (ulangan bo'lsa). Qo'shimcha xabar yozish shart emas."
  },
  {
    "slug": "davomat",
    "title": "Davomat",
    "icon": "ClipboardCheck",
    "roles": "all",
    "intro": "Davomat telefon ilovasida, Telegram botda yoki kompyuterda belgilanadi.",
    "questions": [
      {
        "slug": "davomat-qanday",
        "title": "Davomatni qanday belgilayman?",
        "roles": "all",
        "permission": "attendance.mark",
        "risk": "safe",
        "who": "O'qituvchi",
        "keywords": [
          "davomat belgilash",
          "yo'qlama",
          "keldi",
          "kelmadi",
          "belgilash",
          "telefon",
          "qanday"
        ],
        "answer": "Telefonda eng qulay: ilova doim bugungi darsni ochadi. Hammasini \"keldi\" qilib, keyin kelmaganlarni o'zgartirasiz.",
        "steps": [
          "Ilovada guruhni tanlang.",
          "«Hammasi keldi» ni bosing.",
          "Kelmaganlarni «Yo'q», kechikkanlarni «Kech» qiling.",
          "«Saqlash» — \"Saqlandi. N keldi, M kelmadi.\" chiqadi."
        ],
        "example": "12 kishilik guruhda 2 kishi yo'q. «Hammasi keldi», ikkitasini «Yo'q», «Saqlash». 20 soniya.",
        "undo": "Ha — istalgan vaqt qayta belgilab saqlaysiz.",
        "note": [
          "Belgilanmagan o'quvchi oldindan \"Keldi\" bo'lib turadi. Saqlashdan oldin ro'yxatni ko'zdan kechiring."
        ],
        "see": [
          "holatlar-farqi",
          "internet-yoq-davomat"
        ]
      },
      {
        "slug": "holatlar-farqi",
        "title": "\"Kech\" va \"Sababli\" farqi nima? Pul kamayadimi?",
        "roles": "all",
        "risk": "safe",
        "who": "O'qituvchi",
        "keywords": [
          "kech",
          "kechikdi",
          "sababli",
          "kelmadi",
          "farqi",
          "pul kamayadimi",
          "uzrli"
        ],
        "answer": "Davomat to'lovga ta'sir qilmaydi — hech bir belgi hisobni kamaytirmaydi. Farq faqat ota-onaga xabar va o'quvchi seriyasida.",
        "steps": [
          "«Keldi» — xabar yo'q.",
          "«Kechikdi» / «Kech» — ota-onaga \"darsga kechikdi\" xabari.",
          "«Kelmadi» / «Yo'q» — ota-onaga \"darsda qatnashmadi\" xabari.",
          "«Sababli» — xabar yo'q, o'quvchi seriyasi uzilmaydi."
        ],
        "example": "Jamshid kasal edi, onasi oldindan aytdi. «Sababli» qo'yildi — ortiqcha xabar ketmadi, seriyasi saqlandi.",
        "note": [
          "Ustoz maoshiga ham davomat ta'sir qilmaydi."
        ],
        "see": [
          "sababli-telefonda-yoq"
        ]
      },
      {
        "slug": "sababli-telefonda-yoq",
        "title": "Telefonda \"Sababli\" tugmasi yo'q",
        "roles": "all",
        "permission": "attendance.mark",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "sababli yo'q",
          "uzrli",
          "telefon ilovasi",
          "sababli qo'yish",
          "3 ta tugma"
        ],
        "answer": "To'g'ri, telefonda uchta tugma bor: «Keldi», «Kech», «Yo'q». «Sababli» faqat kompyuterdagi «Davomat» sahifasida.",
        "steps": [
          "Kompyuterda «Davomat» ni oching.",
          "Guruhni tanlang — oxirgi ochilgan dars chiqadi.",
          "O'quvchiga «Sababli» qo'yib, «Davomatni saqlash»."
        ],
        "link": {
          "href": "/attendance",
          "label": "Davomatga o'tish"
        },
        "note": [
          "«Yo'q» bilan saqlasangiz, ota-onaga xabar ketadi. Sababli bo'lsa, kompyuterdan belgilashni administratordan so'rang."
        ]
      },
      {
        "slug": "otgan-darsni-tuzatish",
        "title": "Kechagi davomatni unutdim yoki xato qildim",
        "roles": "all",
        "permission": "attendance.mark",
        "risk": "safe",
        "who": "O'qituvchi",
        "keywords": [
          "unutdim",
          "kecha",
          "o'tgan dars",
          "tuzatish",
          "o'zgartirish",
          "xato belgiladim",
          "eski dars"
        ],
        "answer": "O'tgan darsni istalgan vaqt tuzatsa bo'ladi, vaqt cheklovi yo'q. Lekin telefon ilovasi faqat bugungi kunni ochadi.",
        "steps": [
          "Kompyuterda «Davomat» → guruhni tanlang.",
          "Sahifa guruhning oxirgi ochilgan darsini ko'rsatadi.",
          "Belgilarni tuzatib, «Davomatni saqlash»."
        ],
        "example": "Ustoz dushanba davomatini xato saqladi. Seshanba ertalab, yangi dars ochilmasdan oldin, kompyuterdan tuzatdi.",
        "undo": "Ha, istalgancha qayta saqlaysiz. Ota-onaga ketgan xabar qaytmaydi.",
        "link": {
          "href": "/attendance",
          "label": "Davomatga o'tish"
        },
        "note": [
          "Hozircha yo'q — kompyuterda sanani tanlash. Bugungi dars ochilgach, kechagisi ekrandan ochilmaydi. Kecha dars umuman ochilmagan bo'lsa, uni keyin belgilab bo'lmaydi."
        ],
        "see": [
          "xato-kelmadi-xabari"
        ]
      },
      {
        "slug": "kelasi-kun",
        "title": "Ertangi darsga oldindan belgilasam bo'ladimi?",
        "roles": "all",
        "risk": "safe",
        "who": "O'qituvchi",
        "keywords": [
          "ertaga",
          "oldindan",
          "kelasi kun",
          "kelajak",
          "oldindan belgilash"
        ],
        "answer": "Yo'q. Kelajak kun uchun \"Kelasi kun uchun davomat varaqasi ochilmaydi\" deb chiqadi.",
        "note": [
          "Ota-ona \"ertaga kelmaydi\" desa — daftarga yozing, dars kuni «Sababli» qo'ying."
        ]
      },
      {
        "slug": "internet-yoq-davomat",
        "title": "Internet yo'q — davomat saqlanmadi",
        "roles": "all",
        "permission": "attendance.mark",
        "risk": "safe",
        "who": "O'qituvchi",
        "keywords": [
          "internet yo'q",
          "saqlanmadi",
          "oflayn",
          "aloqa yo'q",
          "saqlanmayapti",
          "xato"
        ],
        "answer": "Belgilaringiz telefonda saqlanib turadi. Aloqa tiklanganda o'zi yuboriladi yoki «Qayta saqlash» ni bosasiz.",
        "steps": [
          "\"Saqlanmadi — internet yo'q…\" yozuvini ko'rsangiz, ilovani yopmang.",
          "Internetga ulaning.",
          "«Qayta saqlash» ni bosing — \"Saqlandi\" chiqishini kuting."
        ],
        "example": "Ustoz yerto'ladagi xonada belgiladi, saqlanmadi. Koridorga chiqdi, «Qayta saqlash» — \"Saqlandi. 10 keldi, 1 kelmadi.\"",
        "note": [
          "Boshqa xato bo'lsa: \"Saqlanmadi. Qayta urinib ko'ring.\" — bir daqiqadan keyin qayta bosing."
        ]
      },
      {
        "slug": "kompyuter-davomat-saqlandimi",
        "title": "Kompyuterda saqladim — saqlandimi?",
        "roles": "all",
        "permission": "attendance.mark",
        "risk": "safe",
        "who": "Siz",
        "keywords": [
          "saqlandimi",
          "xabar chiqmadi",
          "davomatni saqlash",
          "kompyuter",
          "tasdiq yo'q"
        ],
        "answer": "Kompyuterdagi «Davomatni saqlash» hozir \"saqlandi\" deb yozmaydi. Tekshirish uchun sahifani yangilang.",
        "steps": [
          "«Davomatni saqlash» ni bosing.",
          "Sahifani yangilang.",
          "Belgilar joyida bo'lsa — saqlangan."
        ],
        "note": [
          "Telefon ilovasi natijani aniq ko'rsatadi: \"Saqlandi. N keldi, M kelmadi.\""
        ]
      },
      {
        "slug": "davomat-sahifasi-xato",
        "title": "Kompyuterda \"Davomat\" ochilmayapti, xato chiqyapti",
        "roles": "all",
        "risk": "safe",
        "who": "O'qituvchi",
        "keywords": [
          "davomat ochilmadi",
          "xato",
          "dars topilmadi",
          "lesson not found",
          "bo'sh",
          "yangi guruh"
        ],
        "answer": "Guruhda hali birorta dars ochilmagan bo'lsa shunday bo'ladi. Birinchi davomatni telefon ilovasidan oching.",
        "steps": [
          "O'qituvchi dars kuni telefonda guruhni ochadi — dars o'zi yaratiladi.",
          "Yoki «Dars jadvali» → «Qo'shimcha dars» qo'shiladi.",
          "Shundan keyin kompyuterdagi sahifa ham ochiladi."
        ],
        "see": [
          "qoshimcha-dars"
        ]
      },
      {
        "slug": "guruh-biriktirilmagan",
        "title": "\"Bu guruh sizga biriktirilmagan\" chiqyapti",
        "roles": "all",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "biriktirilmagan",
          "guruhim yo'q",
          "ruxsat yo'q",
          "o'z guruhlaringiz",
          "guruh ko'rinmayapti"
        ],
        "answer": "O'qituvchi faqat o'z guruhlari bilan ishlaydi. Administrator guruhni sizga biriktirishi kerak.",
        "steps": [
          "Administratorga guruh nomini ayting.",
          "U «Guruhlar» (Boshqaruv) da guruhni tahrirlab, «O'QITUVCHI» ga sizni tanlaydi.",
          "Ilovani yangilang."
        ],
        "note": [
          "\"Hisobingiz o'qituvchilar ro'yxatiga bog'lanmagan\" chiqsa — login telefoningiz o'qituvchi kartasidagi telefon bilan bir xil emas. Administrator tekshiradi."
        ]
      },
      {
        "slug": "ota-ona-biladimi",
        "title": "Ota-ona bola kelmaganini biladimi?",
        "roles": "all",
        "risk": "safe",
        "who": "Tizim o'zi",
        "keywords": [
          "ota-ona biladimi",
          "xabar ketadimi",
          "bildirishnoma",
          "telegram",
          "kelmadi xabari"
        ],
        "answer": "Ha, Telegram yoki kabinet ulangan bo'lsa — darhol. «Kelmadi» va «Kech» belgisi saqlanganda xabar ketadi.",
        "example": "Xabar: \"2026-10-07 · Ingliz tili A1 — darsda qatnashmadi\". Kechikishda: \"… — darsga kechikdi (+10 daq)\".",
        "note": [
          "Bir varaqni qayta saqlash xabarni takrorlamaydi. «Keldi» va «Sababli» xabar yubormaydi. SMS hozircha yo'q."
        ],
        "see": [
          "bola-kelmadi-xabar-kelmadi"
        ]
      },
      {
        "slug": "davomat-foizi-0",
        "title": "Guruh kartasidagi davomat foizi qanday hisoblanadi?",
        "roles": "all",
        "risk": "safe",
        "who": "Tizim o'zi",
        "keywords": [
          "0%",
          "nol foiz",
          "davomat foizi",
          "o'rtacha davomat",
          "halqa",
          "noto'g'ri foiz",
          "foiz qanday"
        ],
        "answer": "«Keldi» va «Kech» belgilari barcha belgilangan darslarga nisbatan olinadi. Foiz har safar davomat saqlanganda yangilanadi.",
        "example": "Guruhda 40 ta belgi: 34 «Keldi», 2 «Kech», 4 «Kelmadi». (34 + 2) ÷ 40 = 90%.",
        "note": [
          "Eski guruhlarda foiz keyingi davomat saqlangandan keyin to'g'rilanadi."
        ]
      }
    ],
    "module": "attendance",
    "permission": "attendance.read",
    "tip": "«Sababli» belgisi o'quvchi seriyasini uzmaydi. Bola qaytgach, seriyasi davom etadi."
  },
  {
    "slug": "guruhlar-oquvchilar",
    "title": "Guruhlar va o'quvchilar",
    "icon": "Users",
    "roles": "all",
    "intro": "Guruh ochish, o'quvchi qo'shish, biriktirish va o'chirish.",
    "questions": [
      {
        "slug": "guruh-ochish",
        "title": "Yangi guruhni qanday ochaman?",
        "roles": "admin",
        "module": "groups",
        "permission": "group.create",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "guruh ochish",
          "yangi guruh",
          "guruh yaratish",
          "kurs ochish",
          "sinf"
        ],
        "answer": "«Guruhlar» (Boshqaruv) → «Yangi guruh». Avval yo'nalish, xona va o'qituvchi qo'shilgan bo'lsin.",
        "steps": [
          "«GURUH NOMI», «FAN», «O'QITUVCHI» ni to'ldiring.",
          "«DARS KUNLARI» ni belgilang, «BOSHLANISHI» va «TUGASHI» vaqtini yozing.",
          "«XONA», «DARAJA», «NARX (SO'M)» ni tanlang.",
          "«Saqlash» ni bosing."
        ],
        "example": "\"Ingliz tili A1\", Du · Cho · Ju, 18:00–19:30, 101-xona, \"Boshlang'ich\", 300\u00a0000 so'm.",
        "link": {
          "href": "/manage-groups",
          "label": "Guruhlarga o'tish"
        },
        "note": [
          "Tizim xona va o'qituvchi band ekanini tekshirmaydi. Vaqtlarni o'zingiz solishtiring."
        ]
      },
      {
        "slug": "oquvchi-qoshish",
        "title": "O'quvchini bittalab qanday qo'shaman?",
        "roles": "admin",
        "permission": "student.create",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "o'quvchi qo'shish",
          "yangi o'quvchi",
          "ro'yxatga olish",
          "bola qo'shish",
          "talaba qo'shish"
        ],
        "answer": "«O'quvchilar» pastki o'ng burchagidagi «O'quvchi qo'shish» tugmasi bilan.",
        "steps": [
          "«O'quvchi qo'shish» ni bosing.",
          "«ISM FAMILIYA» va «TELEFON RAQAM» ni yozing.",
          "«GURUHGA BIRIKTIRISH» dan guruhni tanlang.",
          "«Qo'shish» ni bosing."
        ],
        "example": "Kamron 12-oktyabrda keldi, 300\u00a0000 lik guruhga yozildi. Oktyabr hisobi darhol yozildi: 20 kun → 193\u00a0548,39 so'm.",
        "undo": "Ha — o'chirsangiz «Korzina» ga tushadi, «Tiklash» bilan qaytadi.",
        "link": {
          "href": "/students",
          "label": "O'quvchilarga o'tish"
        },
        "note": [
          "Oyna yopilmasa — ma'lumotni tekshirib, qayta bosing. Ba'zi xatolar bu oynada ko'rsatilmaydi.",
          "Oy o'rtasida qo'shilgan o'quvchi birinchi to'lovgacha «Qarzdor» ko'rinadi — muddat (5-sana) o'tib ketgan. Pulni shu kuni oling."
        ]
      },
      {
        "slug": "aka-uka-bir-telefon",
        "title": "Aka-uka bitta telefon raqamda — qo'shsa bo'ladimi?",
        "roles": "admin",
        "permission": "student.create",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "aka-uka",
          "bir telefon",
          "bitta raqam",
          "opa-singil",
          "raqam band",
          "ikki farzand"
        ],
        "answer": "Ha. «O'quvchilar» orqali qo'shganda telefon takrori tekshirilmaydi — ikkalasini bir raqam bilan kiritasiz.",
        "example": "Jasur va Javohir onasining raqami bilan kiritildi. Ota-ona kabinetida ikkala farzand bitta akkauntda ko'rinadi.",
        "note": [
          "Liddan aylantirganda ham bo'ladi — faqat ismi boshqacha bo'lsin."
        ],
        "see": [
          "liddan-aka-uka",
          "ikki-farzand"
        ]
      },
      {
        "slug": "guruhga-biriktirish",
        "title": "O'quvchini guruhga qanday biriktiraman?",
        "roles": "admin",
        "module": "groups",
        "permission": "group.update",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "biriktirish",
          "guruhga qo'shish",
          "guruhga yozish",
          "kursga yozish",
          "ikkinchi guruh"
        ],
        "answer": "O'quvchi profilidagi «+ Guruhga qo'shish» bilan. Narx — guruh narxi, hisob qo'shilgan kundan yoziladi.",
        "steps": [
          "«O'quvchilar» → profilni oching.",
          "«Guruhlari» kartasida «+ Guruhga qo'shish».",
          "«GURUH» ni tanlang → «Qo'shish» — \"Qo'shildi.\" chiqadi."
        ],
        "example": "Import qilingan 120 o'quvchi guruhsiz edi. Admin ularni bittalab biriktirdi — har biriga oktyabr hisobi darhol yozildi. Guruhsiz o'quvchilarni «Guruhlar» (Boshqaruv) → «O'quvchi biriktirish» bilan ham biriktirsa bo'ladi.",
        "link": {
          "href": "/manage-groups",
          "label": "Guruhlarga o'tish"
        },
        "note": [
          "Hozircha yo'q — o'quvchini bitta guruhdan butunlay chiqarish. Xato qo'shilsa, administrator ERS jamoasiga murojaat qiladi."
        ],
        "see": [
          "boshqa-guruhga-otkazish",
          "ikkinchi-guruh-shu-oy"
        ]
      },
      {
        "slug": "boshqa-guruhga-otkazish",
        "title": "O'quvchini boshqa guruhga qanday o'tkazaman?",
        "roles": "admin",
        "module": "groups",
        "permission": "student.update",
        "risk": "careful",
        "who": "Administrator",
        "keywords": [
          "o'tkazish",
          "boshqa guruhga",
          "guruh almashtirish",
          "guruhni o'zgartirish",
          "perevod"
        ],
        "answer": "O'quvchi profilida «Boshqa guruhga o'tkazish» orqali. Eski guruh kechagacha, yangisi bugundan hisoblanadi — bir kun ikki marta hisoblanmaydi.",
        "steps": [
          "«O'quvchilar» → o'quvchi profilini oching.",
          "«Guruhlari» kartasida «Boshqa guruhga o'tkazish».",
          "«GURUH» ni tanlang — ostida o'tkazish yozuvi chiqadi.",
          "«O'tkazish» ni bosing."
        ],
        "example": "Sevinch 16-sentyabrda \"Ingliz A1\" (300\u00a0000) dan \"Ingliz A2\" (360\u00a0000) ga o'tdi. Sentyabrga pul tushmagan edi: A1: 15 kun → 150\u00a0000. A2: 15 kun → 180\u00a0000. Sentyabr hisobi 330\u00a0000. Pul tushgan bo'lsa — sentyabr 300\u00a0000 qoladi, A2 oktyabrdan.",
        "link": {
          "href": "/students",
          "label": "O'quvchilarga o'tish"
        },
        "note": [
          "Alohida narx yangi guruhga o'tmaydi — yangi guruhda guruh narxi. Kerak bo'lsa, «Narxni o'zgartirish». Ro'yxatdagi qalam orqali ham bo'ladi: «GURUH» ni almashtirasiz. O'quvchi bir nechta guruhda bo'lsa — faqat profildan."
        ],
        "see": [
          "ikkinchi-guruh-shu-oy",
          "alohida-narx"
        ]
      },
      {
        "slug": "oquvchini-ochirish",
        "title": "O'quvchini o'chirsam nima bo'ladi?",
        "roles": "admin",
        "permission": "student.delete",
        "risk": "careful",
        "who": "Administrator",
        "keywords": [
          "o'chirish",
          "o'quvchini o'chirish",
          "udalit",
          "olib tashlash",
          "ro'yxatdan chiqarish"
        ],
        "answer": "O'quvchi «Korzina» ga tushadi va barcha guruhlaridan chiqadi. Keyingi oydan unga hisob yozilmaydi.",
        "steps": [
          "O'quvchi qatoridagi o'chirish belgisini bosing.",
          "\"{ism} — o'chirilsinmi? (keyin tiklash mumkin)\" — tasdiqlang."
        ],
        "undo": "Ha. «Korzina» → «Tiklash» — guruhlari bilan qaytadi.",
        "note": [
          "Joriy oy hisobi va to'lovlari o'zgarmaydi."
        ],
        "see": [
          "korzina-tiklash"
        ]
      },
      {
        "slug": "korzina-tiklash",
        "title": "Tasodifan o'chirdim — qanday qaytaraman?",
        "roles": "admin",
        "permission": "student.delete",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "tasodifan o'chirdim",
          "qaytarish",
          "tiklash",
          "korzina",
          "savat",
          "yo'qoldi",
          "o'chib ketdi"
        ],
        "answer": "«O'quvchilar» dagi «Korzina» dan «Tiklash» bilan qaytarasiz. Guruhlari ham qaytadi.",
        "steps": [
          "«O'quvchilar» → «Korzina».",
          "O'quvchini toping, «Tiklash» ni bosing.",
          "«Faollar» ga qaytib, tekshiring."
        ],
        "example": "Admin Malikaning o'rniga Mohinurni o'chirib qo'ydi. Korzinadan tikladi — 30 soniya.",
        "link": {
          "href": "/students",
          "label": "O'quvchilarga o'tish"
        }
      },
      {
        "slug": "oquvchi-topilmadi",
        "title": "O'quvchini qidiruvda topolmayapman",
        "roles": "all",
        "permission": "student.read",
        "risk": "safe",
        "who": "Siz",
        "keywords": [
          "topilmadi",
          "qidiruv",
          "topolmayapman",
          "ko'rinmayapti",
          "yo'qoldi",
          "telefon bo'yicha qidirish"
        ],
        "answer": "Qidiruv ism yoki guruh nomi bo'yicha ishlaydi, telefon bo'yicha emas. Filtr «Hammasi» ekanini ham tekshiring.",
        "steps": [
          "Ismning bir qismini yozing, masalan \"Nilu\".",
          "Filtrni «Hammasi» ga qo'ying.",
          "Topilmasa — «Korzina» ni tekshiring."
        ]
      },
      {
        "slug": "qarzdor-minus",
        "title": "O'quvchi balansida minus — bu nima?",
        "roles": "admin",
        "permission": "payment.read",
        "risk": "safe",
        "who": "Tizim o'zi",
        "keywords": [
          "minus",
          "manfiy balans",
          "qizil",
          "qarzdor belgisi",
          "balans minus"
        ],
        "answer": "Minus balans — o'quvchi markazga pul qarzdor. Bu kamdan-kam bo'ladi: qaytarilgan to'lovning bir qismi allaqachon ishlatilgan bo'lsa.",
        "example": "Hamyondagi 30\u00a0000 oktyabrga ishlatilgan edi. Keyin avgust to'lovi qaytarildi — balans −30\u00a0000, belgisi «Qarzdor».",
        "note": [
          "Oddiy qarz balansni minus qilmaydi — u «To'lovlar» dagi hisobda turadi. «Qarzdor» belgisi ikkala holatda ham chiqadi."
        ],
        "see": [
          "qarzdorlar-qayerda"
        ]
      },
      {
        "slug": "guruh-sahifasi",
        "title": "Guruh sahifasida nimalar bor?",
        "roles": "all",
        "module": "groups",
        "permission": "group.read",
        "risk": "safe",
        "who": "Siz",
        "keywords": [
          "guruh sahifasi",
          "guruh ichi",
          "tablar",
          "roster",
          "o'quvchilar ro'yxati guruh"
        ],
        "answer": "Guruh kartasini bossangiz, to'rt tab ochiladi: «O'quvchilar», «Davomat», «Uyga vazifa», «To'lovlar».",
        "steps": [
          "«O'quvchilar» — ro'yxat, «OXIRGI 6 DARS» nuqtalari, holat, balans.",
          "«Davomat» — shu guruh davomati.",
          "«Uyga vazifa» — kim topshirdi.",
          {
            "text": "«To'lovlar» — kim oldinda, kim qarzdor.",
            "roles": "admin"
          }
        ],
        "link": {
          "href": "/groups",
          "label": "Guruhlarga o'tish"
        },
        "note": [
          "O'qituvchi faqat o'z guruhlarini ko'radi. «OYLIK NARX» ustuni faqat to'lovni ko'rish ruxsati borlarga chiqadi."
        ]
      },
      {
        "slug": "ustoz-nimani-koradi",
        "title": "O'qituvchi boshqa guruhlar va narxlarni ko'radimi?",
        "roles": "all",
        "risk": "safe",
        "who": "Direktor",
        "keywords": [
          "ustoz ko'radimi",
          "o'qituvchi nimani ko'radi",
          "maxfiylik",
          "narxni ko'radimi",
          "boshqa guruhlar"
        ],
        "answer": "Guruhlar va davomatda o'qituvchi faqat o'z guruhlarini ko'radi. Oylik narxni ko'rmaydi.",
        "steps": [
          "Guruhlar, davomat, vazifa baholash — faqat o'ziniki.",
          "«Dars jadvali» va «O'quvchilar» ro'yxati — butun markaz bo'yicha.",
          "Boshqalarning ish haqini hech qachon ko'rmaydi."
        ],
        "note": [
          "Guruh sahifasidagi «BALANS» ustuni o'qituvchiga ham ko'rinadi."
        ]
      },
      {
        "slug": "guruh-ochirish",
        "title": "Guruh tugadi — o'chirsam to'lovlar nima bo'ladi?",
        "roles": "admin",
        "module": "groups",
        "permission": "group.delete",
        "risk": "irreversible",
        "who": "Administrator",
        "keywords": [
          "guruh tugadi",
          "guruhni o'chirish",
          "kurs tugadi",
          "yopish",
          "arxiv guruh"
        ],
        "answer": "Yozilgan hisob va to'lovlar o'zgarmaydi. Keyingi oylardan o'chirilgan guruh uchun hisob yozilmaydi.",
        "steps": [
          "«Guruhlar» (Boshqaruv) → savat belgisi.",
          "\"{nom} — o'chirilsinmi?\" — tasdiqlang."
        ],
        "example": "\"IELTS iyun\" guruhi 31-avgustda tugadi. 30-avgustda o'chirildi — sentyabr hisobi yozilmadi.",
        "undo": "Ekranda guruhni qaytarish tugmasi yo'q.",
        "note": [
          "Hozircha yo'q — guruhni \"arxiv\" qilish. Oy oxirida, keyingi oy hisobi yozilishidan oldin o'chiring."
        ]
      },
      {
        "slug": "yonalish-qoshish",
        "title": "Yo'nalish (fan) qanday qo'shiladi?",
        "roles": "admin",
        "module": "groups",
        "permission": "subject.create",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "yo'nalish",
          "fan",
          "predmet",
          "kurs turi",
          "yangi fan"
        ],
        "answer": "«Yo'nalishlar» → «Yangi yo'nalish» → nom va izoh → «Qo'shish».",
        "example": "\"Ingliz tili\", \"Matematika\", \"IT\". Guruhlar ro'yxatida shular bo'yicha filtrlaysiz.",
        "link": {
          "href": "/directions",
          "label": "Yo'nalishlarga o'tish"
        },
        "note": [
          "O'chirish mumkin, lekin ekranda qaytarish tugmasi yo'q. Bog'langan guruhlar tekshirilmaydi — o'chirishdan oldin o'ylang."
        ]
      }
    ],
    "tip": "O'quvchini oyning birinchi kuni guruhga biriktirsangiz, birinchi hisobi to'liq oy bo'lib chiqadi."
  },
  {
    "slug": "vazifalar",
    "title": "Vazifalar",
    "icon": "FileText",
    "roles": "all",
    "intro": "Guruhga uy vazifasi berish, topshirilganini ko'rish va baholash.",
    "questions": [
      {
        "slug": "vazifa-berish",
        "title": "Uy vazifasini qanday beraman?",
        "roles": "all",
        "permission": "assignment.create",
        "risk": "safe",
        "who": "O'qituvchi",
        "keywords": [
          "vazifa berish",
          "uy vazifasi",
          "topshiriq",
          "yangi vazifa",
          "zadaniye"
        ],
        "answer": "«Vazifalar» → «Yangi vazifa». Guruhdagi o'quvchi va ota-onalarga xabar o'zi boradi.",
        "steps": [
          "«VAZIFA NOMI» ni yozing.",
          "«GURUH» va «MUDDAT» ni tanlang.",
          "Kerak bo'lsa «IZOH» va «Fayl biriktirish».",
          "Saqlang."
        ],
        "example": "\"3-mavzu: Present Simple, 10 ta gap\", muddat — payshanba. O'quvchilarga: \"3-mavzu… Muddat — ertaga.\"",
        "link": {
          "href": "/assignments",
          "label": "Vazifalarga o'tish"
        },
        "note": [
          "Telegram xabari 08:00–21:00 oralig'ida boradi. Kechqurun berilgan vazifa xabari ertalab 08:00 da ketadi."
        ]
      },
      {
        "slug": "fayl-biriktirish",
        "title": "Vazifaga qanday fayl biriktirsa bo'ladi?",
        "roles": "all",
        "permission": "assignment.create",
        "risk": "safe",
        "who": "O'qituvchi",
        "keywords": [
          "fayl",
          "rasm",
          "pdf",
          "biriktirish",
          "yuklash",
          "hajm",
          "word"
        ],
        "answer": "Faqat rasm yoki PDF, har biri 10 MB gacha. Word yoki video biriktirilmaydi.",
        "example": "Darslikdagi mashq sahifasini telefonda suratga olib biriktirasiz.",
        "note": [
          "\"faqat rasm yoki PDF biriktirish mumkin\" chiqsa — Word faylni PDF qilib saqlang."
        ]
      },
      {
        "slug": "oquvchi-qanday-topshiradi",
        "title": "O'quvchi vazifani qanday topshiradi?",
        "roles": "all",
        "module": "portal",
        "risk": "safe",
        "who": "O'quvchi",
        "keywords": [
          "topshirish",
          "javob yuborish",
          "o'quvchi topshiradi",
          "portal",
          "havola"
        ],
        "answer": "O'quvchi o'z kabinetida matn yoki havola bilan topshiradi. Fayl yuklash yo'q.",
        "steps": [
          "O'quvchi kabinet → «Vazifalar».",
          "«Vazifani topshirish» → javob yoki havola.",
          "«Topshirish» — \"Barakalla, topshirildi!\"."
        ],
        "note": [
          "Hozircha yo'q — o'quvchi fayl yuklashi. Rasm kerak bo'lsa, Google Drive yoki Telegram havolasini qo'ysin.",
          "Baho qo'yilgach, qayta topshirish tugmasi yo'qoladi."
        ]
      },
      {
        "slug": "baholash",
        "title": "Vazifani qanday baholayman?",
        "roles": "all",
        "permission": "assignment.grade",
        "risk": "safe",
        "who": "O'qituvchi",
        "keywords": [
          "baholash",
          "ball",
          "baho",
          "tekshirish",
          "ocenka"
        ],
        "answer": "Vazifani ochasiz, topshirgan o'quvchiga ball yozib «Baholash» ni bosasiz.",
        "steps": [
          "«Vazifalar» → vazifani oching.",
          "\"Topshirgan\" o'quvchi qatorida «Ball (0-100)» ga ball yozing.",
          "«Baholash» ni bosing."
        ],
        "example": "Dilnoza 85 ball oldi. O'quvchiga \"Ustoz vazifangni ko'rib chiqdi\" xabari boradi — ballsiz.",
        "undo": "Ha — ballni o'zgartirib, qayta «Baholash». Birinchi bahodan keyin 15 daqiqa ichidagi tuzatish qayta xabar yubormaydi.",
        "note": [
          "Ball faqat topshirganlarga qo'yiladi. O'qituvchi faqat o'z guruhlarini baholaydi."
        ]
      },
      {
        "slug": "bajarilgan-filtr",
        "title": "\"Bajarilgan\" filtri doim bo'sh",
        "roles": "all",
        "risk": "safe",
        "who": "Tizim o'zi",
        "keywords": [
          "bajarilgan",
          "yakunlandi",
          "filtr bo'sh",
          "vazifa tugadi"
        ],
        "answer": "Hozir vazifa \"bajarilgan\" holatiga o'tmaydi, shuning uchun filtr bo'sh. Vazifalaringiz joyida.",
        "note": [
          "Barcha vazifalarni «Hammasi» filtri bilan ko'ring. Kim topshirgani \"X/Y topshirdi\" yozuvida."
        ]
      },
      {
        "slug": "vazifa-ochirish",
        "title": "Vazifani o'chirsam bo'ladimi?",
        "roles": "all",
        "permission": "assignment.update",
        "risk": "irreversible",
        "who": "O'qituvchi",
        "keywords": [
          "vazifani o'chirish",
          "xato vazifa",
          "olib tashlash"
        ],
        "answer": "Ha, \"{nom} — o'chirilsinmi?\" tasdig'idan keyin. O'quvchilarga ketgan xabar qaytmaydi.",
        "undo": "Ekranda vazifani qaytarish tugmasi yo'q."
      },
      {
        "slug": "qogoz-vazifa",
        "title": "Daftardagi vazifani davomat bilan birga belgilasa bo'ladimi?",
        "roles": "all",
        "risk": "safe",
        "who": "O'qituvchi",
        "keywords": [
          "daftar",
          "qog'oz vazifa",
          "davomatda vazifa",
          "bajardi bajarmadi"
        ],
        "answer": "Hozircha yo'q. Vazifani «Vazifalar» da berib, topshirganlarni o'sha yerda baholaysiz.",
        "note": [
          "Hozircha yo'q — davomat qatorida \"vazifa bajardi\" belgisi. Hozircha qog'oz vazifalarni daftarda yuriting."
        ]
      }
    ],
    "module": "assignments",
    "permission": "assignment.read",
    "tip": "Vazifa baholanganda o'quvchiga boradigan xabarda ball yozilmaydi — u ballni kabinetida ko'radi."
  },
  {
    "slug": "jadval-xonalar",
    "title": "Dars jadvali va xonalar",
    "icon": "CalendarDays",
    "roles": "all",
    "intro": "Haftalik jadval, qo'shimcha darslar va xonalar.",
    "questions": [
      {
        "slug": "jadval-qanday",
        "title": "Dars jadvali qayerdan olinadi?",
        "roles": "all",
        "permission": "lesson.read",
        "risk": "safe",
        "who": "Tizim o'zi",
        "keywords": [
          "jadval",
          "raspisaniye",
          "dars vaqti",
          "haftalik",
          "qaysi kun"
        ],
        "answer": "Jadval guruh sozlamalaridagi dars kunlari va vaqtidan tuziladi. Qo'shimcha darslar \"QO'SHIMCHA\" belgisi bilan chiqadi.",
        "steps": [
          "«Dars jadvali» — Dushanbadan Yakshanbagacha 7 kun.",
          "«Barcha o'qituvchilar» filtridan ustozni tanlang.",
          "Rang — guruh darajasiga qarab."
        ],
        "link": {
          "href": "/schedule",
          "label": "Jadvalga o'tish"
        },
        "note": [
          "Telefonda davomat ochilgan dars ham \"QO'SHIMCHA\" bo'lib, oddiy dars yonida ikkinchi marta ko'rinishi mumkin. Bu takror dars emas."
        ]
      },
      {
        "slug": "qoshimcha-dars",
        "title": "Qo'shimcha darsni qanday qo'shaman?",
        "roles": "all",
        "permission": "lesson.update",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "qo'shimcha dars",
          "ortiqcha dars",
          "dars qo'shish",
          "qoldirilgan dars",
          "qayta dars",
          "otrabotka"
        ],
        "answer": "«Dars jadvali» → «Qo'shimcha dars». Keyin shu dars uchun davomat belgilanadi.",
        "steps": [
          "«SANA», «BOSHLANISHI», «TUGASHI» ni kiriting.",
          "«XONA» ni tanlang — band xonalar \"— band\" deb yoziladi.",
          "«GURUH» ni tanlang.",
          "«Dars qo'shish» ni bosing."
        ],
        "example": "Ustoz kasal bo'lgan darsni shanba 10:00 da 102-xonada o'tdi. Qo'shimcha dars qo'shildi, davomat belgilandi.",
        "link": {
          "href": "/schedule",
          "label": "Jadvalga o'tish"
        },
        "note": [
          "\"Xona band: bu vaqtda boshqa dars bor\" chiqsa — boshqa xona yoki vaqt tanlang."
        ]
      },
      {
        "slug": "dars-bekor",
        "title": "Dars bekor bo'ldi — jadvaldan qanday olib tashlayman?",
        "roles": "all",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "dars bekor",
          "bayram",
          "dars bo'lmaydi",
          "olib tashlash",
          "otmena"
        ],
        "answer": "Hozircha darsni bekor qilish funksiyasi yo'q. Jadvalda dars turaveradi.",
        "note": [
          "Hozircha yo'q — darsni bekor qilish va bayram kalendari. O'quvchilarga guruh chatida xabar bering. To'lov masalasi — «Ustoz kasal» savoliga qarang."
        ],
        "see": [
          "ustoz-kasal"
        ]
      },
      {
        "slug": "xona-qoshish",
        "title": "Xona qanday qo'shiladi?",
        "roles": "admin",
        "permission": "room.create",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "xona",
          "auditoriya",
          "kabinet",
          "sinf xonasi",
          "sig'im"
        ],
        "answer": "«Xonalar» → «Yangi xona» → nom, sig'im, izoh → «Qo'shish».",
        "example": "\"101-xona\", 12 o'rin, \"Proyektor bor, 2-qavat\".",
        "link": {
          "href": "/rooms",
          "label": "Xonalarga o'tish"
        },
        "note": [
          "Sig'im faqat ma'lumot uchun — tizim guruhni cheklamaydi."
        ]
      },
      {
        "slug": "xona-toqnashuv",
        "title": "Bitta xonaga bir vaqtda ikki guruh qo'yib qo'ydim",
        "roles": "admin",
        "permission": "group.update",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "to'qnashuv",
          "xona band",
          "bir vaqtda",
          "ikki guruh",
          "ustoz band"
        ],
        "answer": "Guruh ochishda tizim buni tekshirmaydi — o'zingiz solishtirasiz. Faqat qo'shimcha darsda band xona tanlanmaydi.",
        "steps": [
          "«Dars jadvali» da kunni ko'zdan kechiring.",
          "Bir xonada bir vaqt bo'lsa, bir guruhning xonasini yoki vaqtini o'zgartiring."
        ],
        "note": [
          "O'qituvchi bir vaqtda ikki guruhga qo'yilganini ham tizim tekshirmaydi."
        ]
      },
      {
        "slug": "dars-eslatmasi",
        "title": "O'qituvchiga dars oldidan eslatma keladimi?",
        "roles": "all",
        "risk": "safe",
        "who": "Tizim o'zi",
        "keywords": [
          "eslatma",
          "dars eslatmasi",
          "10 daqiqa",
          "telegram",
          "darsni unutmaslik"
        ],
        "answer": "Ha, Telegram ulangan o'qituvchiga dars boshlanishidan 10 daqiqa oldin. Faqat oldindan ochilgan darslar uchun.",
        "example": "\"17:50 — Ingliz tili A1 darsi yaqinlashdi. Davomatni ilovada belgilang\".",
        "note": [
          "Oddiy haftalik darslar uchun eslatma kelmasligi mumkin — ular dars kuni ochiladi."
        ]
      }
    ],
    "module": "schedule",
    "tip": "Qo'shimcha dars qo'shishda tizim xona bandligini ko'rsatadi: band xona ro'yxatda \"— band\" deb turadi."
  },
  {
    "slug": "ish-haqi",
    "title": "Ish haqi",
    "icon": "Coins",
    "roles": "all",
    "intro": "Ish haqi qanday hisoblanadi, qachon tasdiqlanadi va to'lanadi.",
    "questions": [
      {
        "slug": "ish-haqi-qanday",
        "title": "Ish haqim qanday hisoblanadi?",
        "roles": "all",
        "permission": "payroll.self",
        "risk": "safe",
        "who": "Tizim o'zi",
        "keywords": [
          "maosh",
          "ish haqi",
          "qanday hisoblanadi",
          "foiz",
          "oylik",
          "ulush",
          "zarplata"
        ],
        "answer": "Guruhlaringizdan haqiqatan tushgan pulning foizi va tan oylik asosida. Qoida administrator sozlagan rejimga bog'liq.",
        "steps": [
          "«Mening ish haqim» → «Qanday hisoblandi» blokini oching.",
          "\"O'quvchilaringizdan tushgan\" va \"Shundan sizning ulushingiz\" qatorlarini ko'ring.",
          "Pastda qoida yozilgan: \"kattasi olinadi\" yoki \"qo'shiladi\"."
        ],
        "example": "Tan oylik 3\u00a0000\u00a0000, ulush 50%. Tushgan pul 8\u00a0000\u00a0000 → ulush 4\u00a0000\u00a0000. Kattasi — 4\u00a0000\u00a0000 so'm.",
        "link": {
          "href": "/my-salary",
          "label": "Ish haqimni ochish"
        },
        "note": [
          "Faqat o'z hisobingizni ko'rasiz. Davomat va dars soni maoshga ta'sir qilmaydi."
        ]
      },
      {
        "slug": "ish-haqi-kam",
        "title": "Oy o'rtasida ish haqim kam ko'rinyapti",
        "roles": "all",
        "permission": "payroll.self",
        "risk": "safe",
        "who": "Tizim o'zi",
        "keywords": [
          "kam",
          "nega kam",
          "oraliq hisob",
          "oy tugamagan",
          "maosh kam"
        ],
        "answer": "Oy davomida bu oraliq hisob. Odatda to'lovlar tushgani sayin o'sadi. Faqat o'quvchiga to'lov qaytarilsa kamayishi mumkin.",
        "example": "10-oktyabrda 1\u00a0200\u00a0000 ko'rindi. 25-oktyabrga kelib, to'lovlar tushgach 3\u00a0600\u00a0000 bo'ldi.",
        "note": [
          "Holat \"Oraliq hisob (oy tugamagan)\" bo'lsa — yakuniy emas. \"Tasdiqlangan\" bo'lgach o'zgarmaydi."
        ]
      },
      {
        "slug": "tolov-kutilmoqda",
        "title": "\"To'lov kutilmoqda\" — bu pul yo'qoladimi?",
        "roles": "all",
        "permission": "payroll.self",
        "risk": "safe",
        "who": "Tizim o'zi",
        "keywords": [
          "to'lov kutilmoqda",
          "to'lamagan o'quvchilar",
          "keyin tushgan",
          "pul yo'qoladimi"
        ],
        "answer": "Yo'qolmaydi. O'quvchi oy tasdiqlangandan keyin to'lasa, ulushingiz keyingi oy hisobiga alohida qator bo'lib qo'shiladi. «Oylik yoki foiz — kattasi» rejimida hisob faqat ulush tan oylikdan oshsa o'sadi.",
        "example": "Sentyabr tasdiqlangach, o'quvchi 240\u00a0000 to'ladi. Ulush 50% — oktyabr hisobida +120\u00a0000 \"keyin tushgan to'lov\" qatori."
      },
      {
        "slug": "chegirma-foizga",
        "title": "Chegirma qilingan o'quvchidan foiz olamanmi?",
        "roles": "all",
        "permission": "payroll.self",
        "risk": "safe",
        "who": "Tizim o'zi",
        "keywords": [
          "chegirma",
          "foiz",
          "ulush",
          "arzon o'quvchi",
          "bepul o'quvchi"
        ],
        "answer": "Chegirma qismidan foiz hisoblanmaydi. Faqat haqiqatan tushgan pulingizdan.",
        "example": "Hisob 300\u00a0000, shundan 50\u00a0000 chegirma. Foiz 250\u00a0000 dan hisoblanadi."
      },
      {
        "slug": "ish-haqim-korinmaydi",
        "title": "\"Mening ish haqim\" ko'rinmaydi yoki \"topilmadi\" deydi",
        "roles": "all",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "ish haqim yo'q",
          "ko'rinmayapti",
          "topilmadi",
          "bog'lanmagan",
          "menyuda yo'q"
        ],
        "answer": "Ikki sabab bo'ladi: rolingizda ruxsat yo'q yoki hisobingiz o'qituvchi kartasiga bog'lanmagan. Administratorga ayting.",
        "steps": [
          "Administrator «Rollar» da \"O'z ish haqini ko'rish\" ruxsatini yoqadi.",
          "Siz chiqib, qayta kirasiz.",
          "\"Hisobingiz o'qituvchi kartasiga bog'lanmagan\" chiqsa — administrator ERS jamoasiga murojaat qiladi."
        ],
        "note": [
          "\"Ish haqi qoidasi hali sozlanmagan\" chiqsa — administrator qoidani sozlashi kerak."
        ]
      },
      {
        "slug": "qoida-sozlash",
        "title": "O'qituvchiga ish haqi qoidasini qanday qo'yaman?",
        "roles": "admin",
        "permission": "compensation.update",
        "risk": "careful",
        "who": "Direktor",
        "keywords": [
          "qoida",
          "stavka",
          "foiz qo'yish",
          "oylik belgilash",
          "ish haqi sozlash",
          "rejim"
        ],
        "answer": "O'qituvchi kartasini tahrirlash oynasidagi «Ish haqi» blokida. Qoida standart keyingi oyning 1-kunidan kuchga kiradi.",
        "steps": [
          "«O'qituvchilar» → qalam → «Ish haqi» → «Sozlash».",
          "«ISH HAQI REJIMI» ni tanlang.",
          "«TAN OYLIK» va «FOIZ» ni yozing.",
          "Kerak bo'lsa «Shu oydan boshlab qo'llash».",
          "«Saqlash»."
        ],
        "example": "Ustoz Malika: \"Oylik yoki foiz — kattasi\", 3\u00a0000\u00a0000 va 50%. Oynada o'tgan oy misoli bilan natija ko'rinadi.",
        "undo": "Ha — qoidani yana o'zgartirasiz. O'tgan oyga qoida yozilmaydi.",
        "link": {
          "href": "/teachers",
          "label": "O'qituvchilarga o'tish"
        },
        "see": [
          "rejimlar-farqi"
        ]
      },
      {
        "slug": "rejimlar-farqi",
        "title": "Ish haqi rejimlari farqi nima?",
        "roles": "admin",
        "permission": "compensation.update",
        "risk": "safe",
        "who": "Direktor",
        "keywords": [
          "rejim",
          "kattasi",
          "qo'shiladi",
          "faqat foiz",
          "tan oylik",
          "garantiya",
          "darsbay"
        ],
        "answer": "To'rt rejim bor. Foiz o'z guruhlaridan haqiqatan tushgan puldan olinadi.",
        "steps": [
          "\"Oylik yoki foiz — kattasi\" — qaysi katta bo'lsa, o'sha.",
          "\"Oylik va foiz qo'shiladi\" — ikkalasi ham.",
          "\"Faqat tan oylik\" — har oy bir xil.",
          "\"Faqat foiz\" — tan oyliksiz."
        ],
        "example": "Oylik 3\u00a0000\u00a0000, 50%, tushum 8\u00a0000\u00a0000:\nKattasi → 4\u00a0000\u00a0000. Qo'shiladi → 7\u00a0000\u00a0000.\nTushum 3\u00a0300\u00a0000 bo'lsa: kattasi → 3\u00a0000\u00a0000.\nFaqat foiz 40%, tushum 5\u00a0000\u00a0000 → 2\u00a0000\u00a0000.",
        "note": [
          "Hozircha yo'q — \"Darsbay\" rejimi."
        ]
      },
      {
        "slug": "avans",
        "title": "Avans berdim — qanday yozaman?",
        "roles": "admin",
        "permission": "payroll.approve",
        "risk": "careful",
        "who": "Direktor",
        "keywords": [
          "avans",
          "oldindan berdim",
          "qarzga berdim",
          "ushlab qolish",
          "minus"
        ],
        "answer": "Avans — shu oy hisobida \"Ayiriladi\" tuzatish qatori. Izoh majburiy, xodim uni o'z ekranida ko'radi.",
        "steps": [
          "«Ish haqi» → xodim qatorini oching.",
          "«Tuzatish qo'shish» → «TUR»: «Ayiriladi».",
          "Summa, sabab «Oldindan berilgan avans», izoh.",
          "Saqlang."
        ],
        "example": "10-oktyabrda ustozga 1\u00a0000\u00a0000 avans berildi. Oktyabr hisobiga −1\u00a0000\u00a0000 qatori qo'shildi.",
        "link": {
          "href": "/payroll",
          "label": "Ish haqiga o'tish"
        },
        "note": [
          "Tuzatish faqat tasdiqlanmagan oyga qo'shiladi. Avans tuzatishi kassaga o'zi yozilmaydi — naqd bergan bo'lsangiz, kassaga alohida xarajat yozing."
        ]
      },
      {
        "slug": "hisoblash-tasdiqlash",
        "title": "Oy oxirida ish haqini qanday hisoblab to'layman?",
        "roles": "admin",
        "permission": "payroll.approve",
        "risk": "careful",
        "who": "Direktor",
        "keywords": [
          "hisoblash",
          "tasdiqlash",
          "to'lash",
          "oy oxiri",
          "maosh berish",
          "vedomost"
        ],
        "answer": "Uch qadam: «Hisoblash», «Tasdiqlash», «To'lovni yozish». Tizim o'zi hisoblamaydi — tugmani siz bosasiz.",
        "steps": [
          "«Ish haqi» → oyni tanlang → «Hisoblash».",
          "Qatorlarni tekshiring, kerak bo'lsa tuzatish qo'shing.",
          "«Tasdiqlash» — summalar muzlaydi.",
          "«To'lovni yozish» → xodimlar, usul, sana."
        ],
        "example": "1-noyabrda oktyabr hisoblandi: 6 xodim, jami 21\u00a0400\u00a0000. Tasdiqlandi, naqd to'landi — kassaga 6 ta \"Maosh\" chiqimi tushdi.",
        "undo": "Tasdiq — «Tasdiqni bekor qilish» (to'langan qator bo'lmasa). To'lov — «Kassa» da «Xatoni to'g'rilash».",
        "link": {
          "href": "/payroll",
          "label": "Ish haqiga o'tish"
        }
      },
      {
        "slug": "keyin-tushgan-tolov",
        "title": "Tasdiqlagandan keyin o'quvchi to'lasa nima bo'ladi?",
        "roles": "admin",
        "permission": "payroll.read",
        "risk": "safe",
        "who": "Tizim o'zi",
        "keywords": [
          "keyin tushgan",
          "kechikkan to'lov",
          "tasdiqdan keyin",
          "keyingi oy"
        ],
        "answer": "Ustoz ulushi keyingi ochiq oy hisobiga alohida qator bo'lib qo'shiladi. Yopilgan oy o'zgarmaydi.",
        "example": "\"Oylik va foiz qo'shiladi\", 1\u00a0000\u00a0000 + 50%. Iyul yopilgach 240\u00a0000 tushdi. Avgust hisobida +120\u00a0000 qatori."
      },
      {
        "slug": "qaytarilgan-tolov-maosh",
        "title": "O'quvchiga pul qaytarilsa, ustoz maoshi kamayadimi?",
        "roles": "admin",
        "permission": "payroll.read",
        "risk": "safe",
        "who": "Tizim o'zi",
        "keywords": [
          "qaytarilgan to'lov",
          "refund maosh",
          "ulush qaytdi",
          "kamaydi"
        ],
        "answer": "Ochiq oyda qaytarilsa — faqat shu to'lovdan hisoblangan ulush alohida qator bilan kamayadi. Boshqa hech narsa olinmaydi.",
        "example": "Ustoz ekranida: \"To'lov o'quvchiga qaytarilgani uchun undan hisoblangan ulush ham qaytdi.\""
      },
      {
        "slug": "bonus-kimga",
        "title": "Yangi o'quvchi bonusi kimga beriladi?",
        "roles": "admin",
        "permission": "compensation.update",
        "risk": "safe",
        "who": "Direktor",
        "keywords": [
          "bonus",
          "yangi o'quvchi bonusi",
          "qabulxona bonusi",
          "kim olib keldi"
        ],
        "answer": "O'quvchini tizimga kim kiritgan bo'lsa, o'shanga. O'quvchi birinchi to'lovni qilganda, bir marta.",
        "example": "Lidni Dilfuza kiritdi, Malika o'quvchiga aylantirdi. Bonus Dilfuzaga — lid egasiga.\nFiks 50\u00a0000 × 3 yangi o'quvchi = 150\u00a0000.",
        "note": [
          "Import qilingan o'quvchilar hech kimga bonus bermaydi. Sinov darsi uchun bonus yo'q."
        ]
      }
    ],
    "module": "payroll",
    "tip": "Qoida o'zgarsa, oy hech qachon ikkiga bo'linmaydi. Oyning 1-kunida qaysi qoida kuchda bo'lsa, butun oy shunga hisoblanadi."
  },
  {
    "slug": "kassa-hisobotlar",
    "title": "Kassa va hisobotlar",
    "icon": "Wallet",
    "roles": "admin",
    "intro": "Naqd va karta qoldig'i, xarajatlar, kun yakuni va hisobotlar.",
    "questions": [
      {
        "slug": "kassa-boshlangich-qoldiq",
        "title": "Tizimga o'tganda kassada pul bor edi — qanday kiritaman?",
        "roles": "admin",
        "module": "finance",
        "permission": "transaction.create",
        "risk": "careful",
        "who": "Kassir",
        "keywords": [
          "boshlang'ich qoldiq",
          "kassadagi pul",
          "start",
          "2 mln bor edi",
          "ochilish qoldig'i"
        ],
        "answer": "«Qoldiqni kiritish» orqali naqd va kartani alohida kiritasiz. Bu daromad bo'lib yozilmaydi.",
        "steps": [
          "«Kassa» → \"Kassa qoldig'i hali belgilanmagan\" → «Qoldiqni kiritish».",
          "«NAQD KASSADA» va «KARTA / BANK HISOBIDA».",
          "«SANADAN BOSHLAB» — tizimga o'tgan kun.",
          "Saqlang."
        ],
        "example": "1-sentyabrda kassada 2\u00a0000\u00a0000 naqd, kartada 5\u00a0400\u00a0000. Shu ikkisi kiritildi.",
        "undo": "Keyin faqat rahbar o'zgartiradi: «Mening profilim» → «Kassa sozlamalari».",
        "link": {
          "href": "/transactions",
          "label": "Kassaga o'tish"
        },
        "note": [
          "Qoldiq kiritilmaguncha «Pul topshirish» va «Kun yakuni» ishlamaydi."
        ]
      },
      {
        "slug": "naqd-karta",
        "title": "Naqd va karta alohida hisoblanadimi?",
        "roles": "admin",
        "module": "finance",
        "permission": "transaction.read",
        "risk": "safe",
        "who": "Tizim o'zi",
        "keywords": [
          "naqd",
          "karta",
          "bank",
          "alohida",
          "click",
          "payme",
          "terminal"
        ],
        "answer": "Ha. «KASSA QOLDIG'I» kartasida «NAQD», «KARTA» va «JAMI» alohida.",
        "note": [
          "Kun yakunida faqat naqd sanaladi — karta puli bank hisobida."
        ]
      },
      {
        "slug": "xarajat-yozish",
        "title": "Xarajatni qanday yozaman?",
        "roles": "admin",
        "module": "finance",
        "permission": "transaction.create",
        "risk": "safe",
        "who": "Kassir",
        "keywords": [
          "xarajat",
          "chiqim",
          "ijara",
          "kommunal",
          "rasxod",
          "pul chiqdi"
        ],
        "answer": "«+ Xarajat yozish» → maydonlar → tekshirish → «Tasdiqlash va yozish».",
        "steps": [
          "«SUMMA», «KATEGORIYA», «USUL» (Naqd/Karta).",
          "«SANA», kerak bo'lsa «KIMGA» va «IZOH».",
          "«Davom etish» → \"Tekshiring va tasdiqlang\".",
          "«Tasdiqlash va yozish»."
        ],
        "example": "Oktyabr ijarasi 4\u00a0000\u00a0000, karta, \"Ijara\". Kassa qoldig'i va oy «SOF» i kamaydi.",
        "undo": "60 soniya ichida «Bekor qilish». Keyin — «Xatoni to'g'rilash».",
        "link": {
          "href": "/transactions",
          "label": "Kassaga o'tish"
        },
        "note": [
          "Kelajak sanaga yozib bo'lmaydi."
        ],
        "see": [
          "tasdiq-kutilmoqda"
        ]
      },
      {
        "slug": "kirim-yozish",
        "title": "O'quvchi to'lovidan boshqa kirimni qanday yozaman?",
        "roles": "admin",
        "module": "finance",
        "permission": "transaction.create",
        "risk": "safe",
        "who": "Kassir",
        "keywords": [
          "kirim",
          "kitob sotuvi",
          "forma",
          "boshqa kirim",
          "daromad"
        ],
        "answer": "«+ Kirim» → kategoriya «Sotuv (kitob, forma)» yoki «Boshqa kirim».",
        "example": "5 ta kitob sotildi — 250\u00a0000 naqd, \"Sotuv (kitob, forma)\".",
        "note": [
          "O'quvchi oylik to'lovini bu yerdan emas, «To'lovlar» dan qabul qiling — aks holda hisob yopilmaydi."
        ],
        "see": [
          "qabul-hisob-boyicha"
        ]
      },
      {
        "slug": "bekor-60-soniya",
        "title": "Hozirgina xato yozdim — tez bekor qilsa bo'ladimi?",
        "roles": "admin",
        "module": "finance",
        "permission": "transaction.create",
        "risk": "safe",
        "who": "Kassir",
        "keywords": [
          "bekor qilish",
          "60 soniya",
          "tez",
          "adashdim",
          "hozirgina",
          "undo"
        ],
        "answer": "Ha, 60 soniya ichida. Yozuvdan keyin pastda \"Yozildi: … · Bekor qilish · 60\" chiqadi.",
        "steps": [
          "Hisoblagich tugamasdan «Bekor qilish» ni bosing."
        ],
        "undo": "Vaqt o'tgach — \"Vaqt tugadi. Bu yozuvni «Xatoni to'g'rilash» orqali o'zgartirish mumkin.\"",
        "note": [
          "Faqat o'zingiz yozgan va kuni yopilmagan yozuv bekor qilinadi."
        ]
      },
      {
        "slug": "xatoni-togrilash",
        "title": "Xarajatni xato yozdim — o'chiraymi?",
        "roles": "admin",
        "module": "finance",
        "permission": "transaction.correct",
        "risk": "careful",
        "who": "Kassani to'g'rilash ruxsati bor xodim",
        "keywords": [
          "o'chirish",
          "xato xarajat",
          "noto'g'ri summa",
          "takror yozildi",
          "storno",
          "to'g'rilash"
        ],
        "answer": "Kassa yozuvi o'chirilmaydi — «Xatoni to'g'rilash» qilinadi. Asl yozuv chizilgan holda qoladi, teskari yozuv qo'shiladi.",
        "steps": [
          "Yozuvni oching (\"Yozuv #…\").",
          "«Xatoni to'g'rilash» → sabab: «Summa xato kiritilgan», «Bu yozuv takror kiritilgan» va h.k.",
          "Kerak bo'lsa «To'g'ri yozuvni hozir kiritish»."
        ],
        "example": "Ijara 400\u00a0000 o'rniga 4\u00a0000\u00a0000 yozildi. To'g'rilandi — 4\u00a0000\u00a0000 qaytdi, 400\u00a0000 qayta yozildi.",
        "undo": "To'g'rilashni yana to'g'rilab bo'lmaydi. To'g'ri yozuvni yangidan kiritasiz.",
        "link": {
          "href": "/transactions",
          "label": "Kassaga o'tish"
        }
      },
      {
        "slug": "pul-topshirish",
        "title": "Pulni direktorga yoki bankka topshirdim — bu xarajatmi?",
        "roles": "admin",
        "module": "finance",
        "permission": "transaction.create",
        "risk": "safe",
        "who": "Kassir",
        "keywords": [
          "topshirish",
          "inkassatsiya",
          "bankka",
          "direktorga berdim",
          "seyf"
        ],
        "answer": "Yo'q, bu xarajat emas. «Pul topshirish» bilan yozasiz — foydaga ta'sir qilmaydi.",
        "steps": [
          "«Pul topshirish» → maqsad: Bank / Direktor / Boshqa.",
          "Summa (faqat naqd).",
          "Tasdiqlang."
        ],
        "example": "Kechqurun 3\u00a0000\u00a0000 direktorga berildi. Naqd qoldiq kamaydi, «SOF» o'zgarmadi.",
        "note": [
          "Summa xarajat chegarasidan katta bo'lsa, topshirish ham direktor tasdig'ini kutadi."
        ]
      },
      {
        "slug": "tasdiq-kutilmoqda",
        "title": "Xarajatim \"Tasdiq kutilmoqda\" bo'lib qoldi",
        "roles": "admin",
        "module": "finance",
        "permission": "transaction.create",
        "risk": "safe",
        "who": "Direktor",
        "keywords": [
          "tasdiq kutilmoqda",
          "kutilmoqda",
          "limit",
          "chegara",
          "direktor tasdig'i",
          "pending"
        ],
        "answer": "Summa xarajat chegarasidan katta — direktor tasdiqlashi kerak. Tasdiqlanmaguncha kassa qoldig'iga kirmaydi.",
        "example": "Chegara 500\u00a0000. 1\u00a0200\u00a0000 lik jihoz xarajati \"Tasdiq kutilmoqda\". Direktor tasdiqladi — kassadan chiqdi.",
        "note": [
          "Xato bo'lsa, «Yozuvni qaytarib olish» bilan o'zingiz bekor qilasiz."
        ],
        "see": [
          "direktor-tasdiqlash"
        ]
      },
      {
        "slug": "direktor-tasdiqlash",
        "title": "Direktor: kutayotgan xarajatlarni qanday tasdiqlayman?",
        "roles": "admin",
        "module": "finance",
        "permission": "transaction.approve",
        "risk": "careful",
        "who": "Direktor",
        "keywords": [
          "tasdiqlash",
          "direktor",
          "aniqlik so'rash",
          "qaytarish",
          "pending"
        ],
        "answer": "Bosh sahifadagi \"Kassada N ta xarajat tasdiq kutmoqda\" kartasidan yoki «Kassa» dan. Har birini alohida ko'rasiz.",
        "steps": [
          "«Ko'rish» ni bosing.",
          "«Tasdiqlash» — kassadan chiqadi.",
          "Yoki «Aniqlik so'rash» → sabab: «Hujjat yoki chek kerak» va h.k."
        ],
        "link": {
          "href": "/transactions?pending=1",
          "label": "Kutayotganlarni ko'rish"
        },
        "note": [
          "Hozircha yo'q — hammasini birdan tasdiqlash."
        ]
      },
      {
        "slug": "aniqlik-soradi",
        "title": "Direktor \"aniqlik so'radi\" — nima qilaman?",
        "roles": "admin",
        "module": "finance",
        "permission": "transaction.create",
        "risk": "safe",
        "who": "Kassir",
        "keywords": [
          "aniqlik kutilmoqda",
          "qaytarildi",
          "direktor qaytardi",
          "tuzatish"
        ],
        "answer": "Direktor sababini o'qing va yozuvni tuzatib qayta yuboring yoki qaytarib oling.",
        "steps": [
          "\"Aniqlik kutilmoqda\" yozuvini oching.",
          "«Tuzatib qayta yuborish» — yana tasdiqqa ketadi.",
          "Yoki «Yozuvni qaytarib olish» — bekor bo'ladi."
        ]
      },
      {
        "slug": "kun-yakuni",
        "title": "Kun yakunini qanday qilaman?",
        "roles": "admin",
        "module": "finance",
        "permission": "transaction.create",
        "risk": "careful",
        "who": "Kassir",
        "keywords": [
          "kun yakuni",
          "kassani yopish",
          "kun oxiri",
          "sanash",
          "zakrit"
        ],
        "answer": "«Kun yakuni» da qo'lingizdagi naqdni sanab kiritasiz. Tizim kutilgan summa bilan solishtiradi.",
        "steps": [
          "«Kun yakuni» ni bosing.",
          "«HISOB BO'YICHA KASSADA (naqd)» ga qarang.",
          "«SANAB CHIQQAN SUMMA (naqd)» ga sanaganingizni yozing.",
          "Farq bo'lsa, sababini tanlang.",
          "«Kunni yakunlash»."
        ],
        "example": "Kecha 1\u00a0200\u00a0000. Bugun +500\u00a0000 kirim, −150\u00a0000 xarajat, −300\u00a0000 topshirish. Kutilgan 1\u00a0250\u00a0000. Sanaldi 1\u00a0240\u00a0000 — farq −10\u00a0000, sabab «Mayda qaytim».",
        "undo": "Ha — rahbar «Kunni qayta ochish» qiladi, keyin qayta yopasiz.",
        "link": {
          "href": "/transactions",
          "label": "Kassaga o'tish"
        },
        "note": [
          "Faqat bugungi kun yopiladi. Farq 500\u00a0000 dan katta bo'lsa, tizim yana sanashni so'raydi."
        ]
      },
      {
        "slug": "kunni-qayta-ochish",
        "title": "Kunni yopdim, keyin bitta to'lov esimga tushdi",
        "roles": "admin",
        "module": "finance",
        "risk": "careful",
        "who": "Direktor",
        "keywords": [
          "kunni qayta ochish",
          "yopilgan kun",
          "esimga tushdi",
          "unutilgan to'lov"
        ],
        "answer": "Yopilgan kunga yozuv qo'shsa bo'ladi, lekin farq o'zgaradi. To'g'risi — direktor kunni qayta ochadi, siz qayta yopasiz.",
        "steps": [
          "Direktor kun yozuvida «Kunni qayta ochish».",
          "Farq yozuvi bekor bo'ladi.",
          "Unutilgan yozuvni kiriting, kunni qayta yoping."
        ],
        "undo": "Qayta ochilgan kun yana yopiladi."
      },
      {
        "slug": "kategoriya",
        "title": "Xarajat kategoriyasini qanday qo'shaman?",
        "roles": "admin",
        "module": "finance",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "kategoriya",
          "yangi kategoriya",
          "xarajat turi",
          "statya"
        ],
        "answer": "Xarajat oynasidagi «Yangi kategoriya…» dan yoki «Mening profilim» → «Kassa sozlamalari» → «Xarajat kategoriyalari».",
        "example": "\"Internet\", \"Kanselyariya\". Nomi 40 belgigacha.",
        "note": [
          "\"O'quvchi to'lovi\", \"Kassa farqi\", \"Pul topshirish\" — tizim kategoriyalari, qo'lda tanlanmaydi va o'chirilmaydi."
        ]
      },
      {
        "slug": "xarajat-chegarasi",
        "title": "Xarajat tasdiq chegarasini qanday o'zgartiraman?",
        "roles": "admin",
        "module": "finance",
        "permission": "report.finance",
        "risk": "safe",
        "who": "Markaz egasi",
        "keywords": [
          "chegara",
          "limit",
          "500 000",
          "tasdiq limiti",
          "tasdiqsiz"
        ],
        "answer": "«Mening profilim» → «Kassa sozlamalari» → «Xarajat tasdiq chegarasi». Standart — 500\u00a0000 so'm.",
        "example": "1\u00a0000\u00a0000 qo'yildi — kassir 1\u00a0000\u00a0000 gacha xarajatni tasdiqsiz yozadi. 0 — tasdiq talab qilinmaydi.",
        "link": {
          "href": "/profile",
          "label": "Profilga o'tish"
        },
        "note": [
          "Saqlash faqat administrator va markaz egasiga ruxsat. Boshqalarda \"Saqlashda xatolik\" chiqadi."
        ]
      },
      {
        "slug": "hisobotlar-nima",
        "title": "\"Hisobotlar\" nimani ko'rsatadi?",
        "roles": "admin",
        "module": "reports",
        "permission": "report.finance",
        "risk": "safe",
        "who": "Direktor",
        "keywords": [
          "hisobot",
          "otchet",
          "moliya",
          "daromad",
          "sof foyda",
          "statistika"
        ],
        "answer": "Uch tab: «Moliya», «Davomat», «O'qituvchilar». Tepadagi kartalar barcha davr bo'yicha.",
        "steps": [
          "«Moliya» — \"Yig'ilgan\", \"Kutilgan\", \"Xarajat\", \"Sof\".",
          "\"3 oy / 6 oy / 12 oy\" — faqat grafik va kategoriyalar uchun.",
          "«O'qituvchilar» — guruh narxi × faol o'quvchi (taxminiy)."
        ],
        "link": {
          "href": "/reports",
          "label": "Hisobotlarga o'tish"
        },
        "note": [
          "\"Yig'ilgan\" va daromad chegirmani ham o'z ichiga oladi. Haqiqiy pul — «Kassa» da.",
          "Hozircha yo'q — Excel eksport va filiallar umumiy hisoboti."
        ]
      }
    ],
    "tip": "Kassa oynasida internet uzilib, «Tasdiqlash va yozish» ni qayta bossangiz ham yozuv ikki marta tushmaydi."
  },
  {
    "slug": "lidlar",
    "title": "Lidlar",
    "icon": "UserPlus",
    "roles": "admin",
    "intro": "Qiziqish bildirganlarni kuzatish va o'quvchiga aylantirish.",
    "questions": [
      {
        "slug": "lid-qoshish",
        "title": "Yangi lidni qanday qo'shaman?",
        "roles": "all",
        "permission": "student.create",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "lid qo'shish",
          "yangi lid",
          "qo'ng'iroq qildi",
          "instagram",
          "qiziqdi",
          "mijoz"
        ],
        "answer": "«Lidlar» → «Yangi lid» → ism, telefon, qayerdan → «Qo'shish». Kiritgan xodim — lid egasi.",
        "steps": [
          "«ISM FAMILIYA» va «TELEFON».",
          "«QAYERDAN (IXTIYORIY)» — masalan, \"Instagram\".",
          "«IZOH (IXTIYORIY)» — nimaga qiziqdi.",
          "«Qo'shish»."
        ],
        "example": "\"Aziza, +998 90\u00a0555 12 34, Instagram, IELTS ga qiziqadi\".",
        "link": {
          "href": "/leads",
          "label": "Lidlarga o'tish"
        }
      },
      {
        "slug": "lid-holatlari",
        "title": "Lid holatlari nimani bildiradi?",
        "roles": "all",
        "permission": "student.update",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "holat",
          "bosqich",
          "bog'lanildi",
          "sinov darsi",
          "yo'qotildi",
          "voronka"
        ],
        "answer": "Lid bosqichma-bosqich o'tadi: «Yangi» → «Bog'lanildi» → «Sinov darsida» → «O'quvchi bo'ldi». Rad etsa — «Yo'qotildi».",
        "steps": [
          "Kartadagi ro'yxatdan holatni tanlang.",
          "«Yo'qotildi» lar alohida «Yo'qotilganlar» tabida."
        ],
        "note": [
          "Hozircha yo'q — qayta qo'ng'iroq sanasi va yo'qotish sababi. Izohga yozib qo'ying."
        ]
      },
      {
        "slug": "oquvchiga-aylantirish",
        "title": "Lid rozi bo'ldi — o'quvchiga qanday aylantiraman?",
        "roles": "all",
        "permission": "student.create",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "aylantirish",
          "o'quvchi bo'ldi",
          "konversiya",
          "sinovdan keyin",
          "rozi"
        ],
        "answer": "Lid kartasida «O'quvchiga aylantirish». O'quvchi guruhsiz yaratiladi — guruhni keyin biriktirasiz.",
        "steps": [
          "«O'quvchiga aylantirish» ni bosing.",
          "\"O'quvchilar ro'yxatiga qo'shildi. — ochish\".",
          "«ochish» ni bosing → profilda «+ Guruhga qo'shish»."
        ],
        "example": "Aziza sinov darsidan keyin rozi bo'ldi. Aylantirildi, keyin \"IELTS 6.5\" guruhiga biriktirildi — hisob shu kuni yozildi.",
        "note": [
          "Hisob faqat guruhga biriktirilganda yoziladi."
        ],
        "see": [
          "guruhga-biriktirish"
        ]
      },
      {
        "slug": "liddan-aka-uka",
        "title": "Aka-uka bitta raqamda — liddan o'quvchiga aylantirsa bo'ladimi?",
        "roles": "all",
        "permission": "student.create",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "raqam band",
          "bu raqamli o'quvchi bor",
          "aka-uka",
          "singlisi",
          "bir telefon",
          "takror",
          "allaqachon mavjud"
        ],
        "answer": "Ha. Tizim faqat telefon ham, ism ham bir xil bo'lsa to'xtatadi — demak, bu o'sha odamning o'zi.",
        "note": [
          "Xabar: \"Bu o'quvchi allaqachon mavjud (telefon va ism bir xil)\". «ochish» ni bosib, mavjud o'quvchini ko'ring."
        ],
        "see": [
          "aka-uka-bir-telefon"
        ]
      },
      {
        "slug": "lid-ochirish",
        "title": "Lidni o'chirsam qaytadimi?",
        "roles": "all",
        "permission": "student.delete",
        "risk": "irreversible",
        "who": "Administrator",
        "keywords": [
          "lidni o'chirish",
          "xato lid",
          "qaytarish"
        ],
        "answer": "Yo'q, o'chirilgan lidni ekrandan qaytarib bo'lmaydi. Rad etganlarni o'chirmang — «Yo'qotildi» qiling.",
        "undo": "Ekranda qaytarish tugmasi yo'q."
      }
    ],
    "module": "leads",
    "permission": "student.read",
    "tip": "Yangi o'quvchi bonusi lid egasiga yoziladi — kim lidni kiritgan bo'lsa, o'shanga. Kim \"aylantirish\" ni bosgani ahamiyatsiz."
  },
  {
    "slug": "filiallar",
    "title": "Filiallar",
    "icon": "Building2",
    "roles": "admin",
    "intro": "Bir direktor bir nechta markazni boshqarishi.",
    "questions": [
      {
        "slug": "filial-nima",
        "title": "Filial qanday ishlaydi?",
        "roles": "all",
        "risk": "safe",
        "who": "Direktor",
        "keywords": [
          "filial",
          "ikkinchi markaz",
          "yangi bino",
          "tarmoq"
        ],
        "answer": "Har filial — alohida mustaqil markaz, o'z bazasi bilan. Direktor hammasiga bitta login bilan kiradi.",
        "note": [
          "O'quvchi, guruh va kassa filiallar orasida umumiy emas.",
          "Hozircha yo'q — filiallarning umumiy hisoboti. Har filial hisobotini alohida ko'rasiz."
        ]
      },
      {
        "slug": "filial-ochish",
        "title": "Yangi filialni qanday ochaman?",
        "roles": "all",
        "risk": "irreversible",
        "who": "Direktor",
        "keywords": [
          "filial ochish",
          "yangi filial",
          "yaratish"
        ],
        "answer": "«Filiallar» → «Yangi filial» → nomi → «Yaratish». Faqat direktor qila oladi.",
        "steps": [
          "«RASMIY NOMI» ni yozing.",
          "Kerak bo'lsa «BREND NOMI (ixtiyoriy)».",
          "«Yaratish»."
        ],
        "undo": "Ekranda filialni o'chirish tugmasi yo'q.",
        "link": {
          "href": "/branches",
          "label": "Filiallarga o'tish"
        },
        "note": [
          "Yangi filial bo'sh boshlanadi. Unda faqat \"Administrator\" roli bor — \"O'qituvchi\" rolini «Rollar» da o'zingiz yarating."
        ],
        "see": [
          "yangi-rol"
        ]
      },
      {
        "slug": "filialga-otish",
        "title": "Filialga qanday o'taman?",
        "roles": "all",
        "risk": "safe",
        "who": "Direktor",
        "keywords": [
          "filialga o'tish",
          "kirish",
          "boshqa filial",
          "almashtirish"
        ],
        "answer": "«Filiallar» dagi filial kartasida «Kirish». Hozirgi markaz kartasi \"Joriy markaz\" deb turadi.",
        "link": {
          "href": "/branches",
          "label": "Filiallarga o'tish"
        },
        "note": [
          "Administrator va o'qituvchilarga bu sahifa \"Faqat direktor uchun\" deb chiqadi."
        ]
      }
    ],
    "module": "branches",
    "tip": "Filialda direktor shu telefon va parol bilan kiradi — alohida login kerak emas."
  },
  {
    "slug": "xodimlar-ruxsatlar",
    "title": "Xodimlar va ruxsatlar",
    "icon": "ShieldCheck",
    "roles": "admin",
    "intro": "Xodim qo'shish, login berish, rollar va markaz sozlamalari.",
    "questions": [
      {
        "slug": "xodim-qoshish",
        "title": "Yangi xodimni (qabulxona, kassir) qanday qo'shaman?",
        "roles": "all",
        "permission": "user.create",
        "risk": "safe",
        "who": "Direktor",
        "keywords": [
          "xodim qo'shish",
          "administrator qo'shish",
          "kassir",
          "qabulxona",
          "yangi xodim"
        ],
        "answer": "«Xodimlar» → «Yangi xodim». Shu yerda login (telefon) va parol ham beriladi.",
        "steps": [
          "«ISM FAMILIYA», «TELEFON», «LAVOZIM».",
          "«PAROL» — kamida 6 belgi.",
          "«ROLLAR» dan bir yoki bir nechtasini tanlang.",
          "«Qo'shish»."
        ],
        "example": "Qabulxonaga Nigora: lavozim \"Qabulxona\", rol — to'lov va o'quvchi ruxsatlari bor rol.",
        "link": {
          "href": "/staff",
          "label": "Xodimlarga o'tish"
        },
        "note": [
          "Oyna yopilmasa — bu telefon bilan xodim allaqachon bo'lishi mumkin."
        ]
      },
      {
        "slug": "oqituvchiga-login",
        "title": "O'qituvchiga login qanday beraman?",
        "roles": "all",
        "permission": "teacher.update",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "o'qituvchi login",
          "ustozga parol",
          "akkaunt",
          "kirish berish"
        ],
        "answer": "«O'qituvchilar» dagi kalit belgisi orqali. Login — o'qituvchi telefoni, parolni siz yozasiz.",
        "steps": [
          "Kalit belgisini bosing — \"O'qituvchi login/parol\".",
          "«LOGIN (TELEFON)» va «PAROL» (kamida 6 belgi).",
          "«Saqlash» — \"O'qituvchi\" roli o'zi beriladi.",
          "Telefon va parolni o'qituvchiga bering."
        ],
        "example": "Ustoz Malika: login +998 91\u00a0234 56 78, parol \"malika25\". U ERP, \"Eduvo Ustoz\" yoki Telegram botdan kiradi.",
        "undo": "Ha — shu oynada yangi parol yozasiz.",
        "link": {
          "href": "/teachers",
          "label": "O'qituvchilarga o'tish"
        },
        "note": [
          "O'qituvchi kartasini qo'shish login yaratmaydi — bu alohida qadam."
        ]
      },
      {
        "slug": "rol-ruxsat",
        "title": "Xodimga faqat kerakli ruxsatni qanday beraman?",
        "roles": "all",
        "permission": "role.update",
        "risk": "careful",
        "who": "Direktor",
        "keywords": [
          "rol",
          "ruxsat",
          "huquq",
          "cheklash",
          "kassir faqat",
          "dostup"
        ],
        "answer": "«Rollar» da rol tanlab, kerakli ruxsatlarni yoqasiz. Keyin rolni xodimga biriktirasiz.",
        "steps": [
          "«Rollar» → chapdan rolni tanlang.",
          "O'ngda ruxsatlarni yoqing yoki o'chiring.",
          "«Saqlash».",
          "Xodim chiqib, qayta kirsin."
        ],
        "example": "\"Kassir\" roli: to'lov ko'rish va qabul qilish, kassa ko'rish va yozish. O'quvchini o'chirish — yo'q.",
        "undo": "Ha — ruxsatni qaytadan o'chirasiz yoki yoqasiz.",
        "link": {
          "href": "/roles",
          "label": "Rollarga o'tish"
        },
        "note": [
          "\"Xodimlar\" guruhidagi \"Tahrirlash\" ruxsati ko'z belgisi orqali boshqalar hisobiga kirishni ham beradi. Uni faqat ishonchli odamga bering."
        ]
      },
      {
        "slug": "yangi-rol",
        "title": "Yangi rol qanday yaratiladi?",
        "roles": "all",
        "permission": "role.create",
        "risk": "careful",
        "who": "Direktor",
        "keywords": [
          "yangi rol",
          "rol yaratish",
          "o'qituvchi roli yo'q"
        ],
        "answer": "«Rollar» → «Yangi rol qo'shish» → nom va tavsif. Rol ruxsatsiz yaratiladi — keyin ruxsatlarni yoqasiz.",
        "undo": "Rolni o'chirish yoki qayta nomlash tugmasi yo'q. Nomni o'ylab yozing."
      },
      {
        "slug": "ruxsat-kuchga-kirmadi",
        "title": "Ruxsat berdim, lekin xodimda o'zgarmadi",
        "roles": "all",
        "permission": "role.update",
        "risk": "safe",
        "who": "Xodim",
        "keywords": [
          "kuchga kirmadi",
          "o'zgarmadi",
          "ruxsat ishlamayapti",
          "ko'rinmayapti"
        ],
        "answer": "Yangi ruxsat xodim qayta kirgandan keyin ishlaydi. Xodim chiqib, qayta kirsin.",
        "steps": [
          "Xodim menyu pastidagi «Chiqish» ni bosadi.",
          "Qayta kiradi."
        ]
      },
      {
        "slug": "xodim-ochirish",
        "title": "Xodim ishdan ketdi — nima qilaman?",
        "roles": "all",
        "permission": "user.delete",
        "risk": "irreversible",
        "who": "Direktor",
        "keywords": [
          "ishdan ketdi",
          "xodimni o'chirish",
          "kirishni yopish",
          "bloklash"
        ],
        "answer": "«Xodimlar» dan o'chiring — uning kirishi darhol yopiladi.",
        "undo": "Ekranda xodimni qaytarish tugmasi yo'q. Kerak bo'lsa, yangidan qo'shasiz.",
        "note": [
          "O'qituvchini «O'qituvchilar» dan o'chirish login hisobini yopmaydi — «Xodimlar» dan ham o'chiring."
        ],
        "see": [
          "oqituvchi-ochirish"
        ]
      },
      {
        "slug": "oqituvchi-ochirish",
        "title": "O'qituvchi kartasini o'chirsam nima bo'ladi?",
        "roles": "all",
        "permission": "teacher.delete",
        "risk": "irreversible",
        "who": "Administrator",
        "keywords": [
          "o'qituvchini o'chirish",
          "ustoz ketdi",
          "kartani o'chirish"
        ],
        "answer": "Karta ro'yxatdan yo'qoladi, lekin login hisobi ochiq qoladi. Avval guruhlarini boshqa ustozga o'tkazing.",
        "steps": [
          "Guruhlarini yangi ustozga o'tkazing.",
          "«O'qituvchilar» dan kartani o'chiring.",
          "«Xodimlar» dan uning login hisobini ham o'chiring."
        ],
        "undo": "Ekranda qaytarish tugmasi yo'q.",
        "see": [
          "ustoz-ketdi"
        ]
      },
      {
        "slug": "oqituvchi-rejimi",
        "title": "\"O'qituvchi rejimi\" nima?",
        "roles": "all",
        "risk": "safe",
        "who": "Markaz egasi",
        "keywords": [
          "o'qituvchi rejimi",
          "menyuni cheklash",
          "qisqa menyu",
          "teacher mode"
        ],
        "answer": "Yoqilsa, direktordan boshqa hammaning menyusi kundalik ishga qisqaradi: guruhlar, davomat, jadval, vazifa, ish haqim, qo'llanma.",
        "steps": [
          "«Mening profilim» → «Markaz sozlamalari».",
          "«O'qituvchi rejimi» ni yoqing."
        ],
        "undo": "Ha — o'chirsangiz, menyu qaytadi.",
        "link": {
          "href": "/profile",
          "label": "Profilga o'tish"
        },
        "note": [
          "Bu faqat menyuni yashiradi, ruxsatlarni emas. Ruxsatni cheklash — «Rollar» da."
        ]
      },
      {
        "slug": "markaz-sozlamalari",
        "title": "Markaz sozlamalarida nimalar bor?",
        "roles": "all",
        "risk": "safe",
        "who": "Markaz egasi",
        "keywords": [
          "sozlamalar",
          "markaz sozlamalari",
          "ota-onaga bildirishnoma",
          "rejim"
        ],
        "answer": "«Mening profilim» → «Markaz sozlamalari». Faqat markaz egasi va administrator o'zgartiradi.",
        "steps": [
          "«O'qituvchi rejimi» — menyuni qisqartiradi.",
          "«Ota-onaga bildirishnoma» — to'lov va davomat xabarlari ota-onaga."
        ],
        "link": {
          "href": "/profile",
          "label": "Profilga o'tish"
        }
      }
    ],
    "module": "staff_roles",
    "tip": "Ko'z belgisi bilan xodim hisobiga kirib, u nimani ko'rishini tekshirsangiz bo'ladi. Qaytish — tepadagi «ERS hisobimga qaytish»."
  },
  {
    "slug": "ilova-portal",
    "title": "Telefon ilovasi va ota-ona portali",
    "icon": "Smartphone",
    "roles": "all",
    "intro": "O'quvchi va ota-ona kabineti, Telegram bot va o'qituvchi ilovasi.",
    "questions": [
      {
        "slug": "portal-nima",
        "title": "Ota-ona kabinetida nimalar ko'rinadi?",
        "roles": "all",
        "module": "portal",
        "risk": "safe",
        "who": "Ota-ona",
        "keywords": [
          "kabinet",
          "portal",
          "ota-ona ko'radi",
          "nimani ko'radi",
          "lichniy kabinet"
        ],
        "answer": "Ota-ona farzandining davomati, to'lovi va vazifalarini ko'radi. Bo'limlar: «Bosh sahifa», «To'lov», «Davomat», «Profil».",
        "steps": [
          "Bosh sahifa: bugun darsga keldimi, haftalik davomat, to'lov holati.",
          "«To'lov»: har oy summasi va muddati.",
          "«Davomat»: oxirgi darslar."
        ],
        "note": [
          "Kabinetda \"qarz\" so'zi ishlatilmaydi — \"Qoldiq\" deb yoziladi. Reyting va nishonlar faqat o'quvchiga ko'rinadi."
        ]
      },
      {
        "slug": "ommaviy-login",
        "title": "Hamma o'quvchi va ota-onaga login qanday beraman?",
        "roles": "admin",
        "module": "portal",
        "risk": "careful",
        "who": "Markaz egasi",
        "keywords": [
          "login parol",
          "ommaviy",
          "hammaga",
          "csv",
          "excel",
          "parollar ro'yxati"
        ],
        "answer": "«O'quvchilar» → «Login/parol» → «Yaratish va yuklash». Parollar fayl bo'lib bir marta yuklanadi.",
        "steps": [
          "«Login/parol» ni bosing.",
          "«Ota-onalar uchun ham yaratilsin» yoqilgan bo'lsin.",
          "«Yaratish va yuklash» — login-parollar.csv yuklanadi.",
          "Faylni Excel'da ochib, har oilaga o'z loginini yuboring."
        ],
        "example": "120 o'quvchi: o'quvchi loginlari \"o\" bilan, ota-onalarniki \"v\" bilan boshlanadi (masalan o57, v57). Parol — 6 belgi.",
        "undo": "Mavjud loginlar qayta yaratilmaydi. Parol yo'qolsa — bittalab yangi parol qo'yasiz.",
        "link": {
          "href": "/students",
          "label": "O'quvchilarga o'tish"
        },
        "note": [
          "Parollar faqat shu faylda bir marta ko'rinadi. Faylni xavfsiz joyda saqlang. Bu tugma faqat markaz egasida."
        ],
        "see": [
          "bitta-login"
        ]
      },
      {
        "slug": "bitta-login",
        "title": "Bitta o'quvchi yoki ota-onaga login qanday beraman?",
        "roles": "admin",
        "module": "portal",
        "permission": "student.update",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "bitta login",
          "ota-ona qo'shish",
          "parol berish",
          "kalit belgisi"
        ],
        "answer": "O'quvchi qatoridagi kalit belgisi orqali. Shu oynada ota-onani ham qo'shasiz.",
        "steps": [
          "Kalit belgisi → \"O'quvchi login/parol\".",
          "«LOGIN» bo'sh qolsa, o'zi yaratiladi. «PAROL» — kamida 6 belgi → «O'quvchini saqlash».",
          "\"Ota-onalar\" → «Qo'shish» → «ISM», «TELEFON», «LOGIN», «PAROL» → «Ota-ona qo'shish»."
        ],
        "example": "Madinaning onasi: login v57, parol \"madina2026\". Telefon — onasining raqami.",
        "parentReply": "Assalomu alaykum! [Madina]ning o'qishini telefondan kuzatishingiz mumkin. Havola: https://admin.eduvo.uz/portal. Login: [v57]. Parol: [parol]. Kirgach «Profil» bo'limida parolni o'zingizga qulayiga almashtiring.",
        "link": {
          "href": "/students",
          "label": "O'quvchilarga o'tish"
        }
      },
      {
        "slug": "ota-ona-parol-unutdi",
        "title": "Ota-ona parolni unutdi",
        "roles": "admin",
        "module": "portal",
        "permission": "student.update",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "parolni unutdi",
          "kira olmayapti",
          "ota-ona paroli",
          "tiklash",
          "yangi parol"
        ],
        "answer": "Yangi parol qo'yasiz — eski parolni hech kim ko'rmaydi. Ota-onaning boshqa telefonlaridagi eski kirishlar yopiladi.",
        "steps": [
          "O'quvchi qatoridagi kalit belgisi.",
          "\"Ota-onalar\" dan ota-onani toping.",
          "«YANGI PAROL» → «Saqlash».",
          "Yangi parolni ota-onaga yuboring."
        ],
        "parentReply": "Assalomu alaykum! Kabinet uchun yangi parolingiz: [parol]. Login o'zgarmadi: [v57]. Kirgach, «Profil» bo'limida o'zingizga qulay parol qo'yishingiz mumkin.",
        "note": [
          "Kabinet kirish sahifasidagi telefon raqami — ERS yordam raqami, markazingizniki emas. Ota-onaga o'z raqamingizni bering."
        ]
      },
      {
        "slug": "ikki-farzand",
        "title": "Bitta ota-onaning ikki farzandi bor",
        "roles": "admin",
        "module": "portal",
        "permission": "student.update",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "ikki farzand",
          "bir nechta bola",
          "aka-uka kabinet",
          "farzand almashtirish"
        ],
        "answer": "Ikkala farzandga ota-onani bir xil telefon bilan qo'shing. Kabinetda farzandlar bitta akkauntda birlashadi.",
        "steps": [
          "Har farzandning kalit belgisi → \"Ota-onalar\" → «Qo'shish».",
          "«TELEFON» — ikkalasida bir xil.",
          "Ota-ona kabinetda farzandlar orasida tugma bilan almashadi."
        ],
        "example": "Jasur va Javohirning onasi +998 90\u00a0111 22 33 bilan qo'shildi. Kabinetda ikki tugma: \"Jasur\" va \"Javohir\"."
      },
      {
        "slug": "telegram-ulash",
        "title": "Ota-ona Telegramga qanday ulanadi?",
        "roles": "admin",
        "module": "portal",
        "risk": "safe",
        "who": "Ota-ona",
        "keywords": [
          "telegram",
          "bot",
          "ulash",
          "xabar olish",
          "bildirishnoma",
          "tg"
        ],
        "answer": "Ota-ona Eduvo botida (@eduvo_erp_bot) «Ilovani ochish» ni bosib, kabinet logini bilan kiradi. Shundan keyin xabarlar Telegramga keladi.",
        "steps": [
          "Ota-onaga bot havolasini yuboring: https://t.me/eduvo_erp_bot",
          "U istalgan xabar yozadi — bot «Ilovani ochish» tugmasini beradi.",
          "Kabinet logini va paroli bilan kiradi.",
          "Keyingi safar avtomatik kiradi."
        ],
        "parentReply": "Assalomu alaykum! Farzandingiz davomati va to'lovlari haqida xabarlarni Telegramda olish uchun: https://t.me/eduvo_erp_bot ni oching, «Ilovani ochish» ni bosing va shu login bilan kiring. Login: [v57], parol: [parol].",
        "note": [
          "Telefon raqam orqali ulash yo'q — faqat login bilan."
        ]
      },
      {
        "slug": "kabinet-kirmayapti",
        "title": "Ota-ona: \"Login yoki parol xato\" deyapti",
        "roles": "admin",
        "permission": "student.update",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "login xato",
          "kira olmayapti",
          "parol xato",
          "kabinet ochilmayapti"
        ],
        "answer": "Ko'pincha parol xato yoziladi. Yangi parol qo'yib, qayta yuboring.",
        "steps": [
          "Ota-ona logini \"v\" harfi bilan boshlanganini tekshiring.",
          "Kalit belgisi → yangi parol → «Saqlash».",
          "Ota-ona yana urinib ko'rsin."
        ],
        "note": [
          "Markazda o'quvchi/ota-ona kabineti bo'limi yoqilmagan bo'lsa ham shu xabar chiqadi. Rahbar «Tarif va modullar» ni tekshiradi."
        ]
      },
      {
        "slug": "oquvchi-seriya",
        "title": "O'quvchi kabinetidagi seriya va daraja nima?",
        "roles": "all",
        "module": "portal",
        "risk": "safe",
        "who": "Tizim o'zi",
        "keywords": [
          "seriya",
          "streak",
          "daraja",
          "nishon",
          "reyting",
          "yutuqlar",
          "chempion"
        ],
        "answer": "Seriya — ketma-ket kelgan darslar soni. Daraja davomat va vazifa ballaridan chiqadi. Faqat o'quvchiga ko'rinadi.",
        "steps": [
          "«Keldi» va «Kech» seriyani oshiradi.",
          "«Kelmadi» seriyani 0 ga tushiradi.",
          "«Sababli» seriyani uzmaydi.",
          "Darajalar: Boshlovchi, Intiluvchan, Bilimdon, Yulduz, Chempion."
        ],
        "note": [
          "Yangi o'quvchida reyting 5 ta darsdan keyin boshlanadi. Boshqa o'quvchilar bilan solishtirish yo'q."
        ]
      },
      {
        "slug": "telegram-davomat",
        "title": "O'qituvchi: Telegram orqali davomat qilsa bo'ladimi?",
        "roles": "teacher",
        "permission": "attendance.mark",
        "risk": "safe",
        "who": "O'qituvchi",
        "keywords": [
          "telegram davomat",
          "bot orqali",
          "mini app",
          "telegramdan belgilash"
        ],
        "answer": "Ha. Botda «Ilovani ochish» → «O'qituvchi» → telefon va parol. Keyin telefon ilovasidagi kabi belgilaysiz.",
        "steps": [
          "Botda «Ilovani ochish».",
          "«O'qituvchi» → telefon + parol → «Kirish».",
          "Guruhni tanlang, belgilang, «Saqlash»."
        ],
        "note": [
          "\"Sizga guruh biriktirilmagan\" chiqsa — administratorga ayting.",
          "Bot bu chatga dars oldidan 10 daqiqalik eslatma ham yuboradi."
        ]
      },
      {
        "slug": "oflayn-sahifa",
        "title": "\"Internet bilan aloqa yo'q\" sahifasi chiqdi",
        "roles": "all",
        "risk": "safe",
        "who": "Siz",
        "keywords": [
          "internet yo'q",
          "oflayn",
          "aloqa yo'q",
          "ochilmayapti",
          "qayta urinish"
        ],
        "answer": "Telefon ilovasi yoki kabinet internet yo'qligini ko'rsatmoqda. Aloqa tiklanganda sahifa o'zi ochiladi.",
        "steps": [
          "Internetni tekshiring.",
          "«Qayta urinish» ni bosing."
        ],
        "note": [
          "Davomat belgilari internet yo'qligida telefonda saqlanib turadi."
        ]
      }
    ],
    "tip": "Ota-ona kabinetida parolni o'zi almashtirishi mumkin: «Profil» bo'limida, kamida 4 belgi."
  },
  {
    "slug": "tarif-modullar",
    "title": "Tarif va modullar",
    "icon": "Package",
    "roles": "admin",
    "intro": "Qaysi bo'limlar yoqilgan va oylik to'lov qancha.",
    "questions": [
      {
        "slug": "modul-yoqish",
        "title": "Yangi bo'limni (modulni) qanday yoqaman?",
        "roles": "all",
        "risk": "careful",
        "who": "Markaz rahbari",
        "keywords": [
          "modul yoqish",
          "bo'lim yoqish",
          "lidlar yoqish",
          "kassa yoqish",
          "yangi funksiya"
        ],
        "answer": "«Tarif va modullar» → bo'lim kartasida «Yoqish». Oylik to'lov o'zgarishi oldindan ko'rsatiladi.",
        "steps": [
          "Kerakli bo'limni toping.",
          "«Yoqish» → \"Oylik to'lovingiz X → Y so'm bo'ladi\" ni o'qing.",
          "Tasdiqlang — bo'lim darhol menyuda paydo bo'ladi."
        ],
        "undo": "Ha — «O'chirish». Ma'lumotlar saqlanadi.",
        "link": {
          "href": "/modules",
          "label": "Tarif va modullarga o'tish"
        },
        "note": [
          "Summa keyingi oylik yechimdan o'zgaradi."
        ]
      },
      {
        "slug": "modul-ochirish",
        "title": "Bo'limni o'chirsam ma'lumotlar yo'qoladimi?",
        "roles": "all",
        "risk": "safe",
        "who": "Markaz rahbari",
        "keywords": [
          "modul o'chirish",
          "ma'lumot yo'qoladimi",
          "bo'limni yopish"
        ],
        "answer": "Yo'qolmaydi. Bo'lim menyudan yashiriladi, qayta yoqsangiz hammasi joyida turadi.",
        "undo": "Ha — qayta «Yoqish».",
        "note": [
          "Ba'zi bo'limni o'chirish uchun avval unga bog'liq bo'limni o'chirish kerak — tizim nomini aytadi."
        ]
      },
      {
        "slug": "balans-manfiy",
        "title": "Tepada balans qizil — nima bo'ladi?",
        "roles": "all",
        "risk": "careful",
        "who": "Markaz rahbari",
        "keywords": [
          "balans",
          "qizil",
          "manfiy",
          "obuna",
          "to'lov kerak",
          "bloklanadi"
        ],
        "answer": "Obuna to'lovi uchun mablag' yetmayapti. 3 kun tizim to'liq ishlaydi, keyin markaz to'xtatiladi.",
        "steps": [
          "\"Balans manfiy — to'lov kerak\" ko'rsangiz, ERS bilan bog'laning: +998 77\u00a0317 05 21.",
          "Balans to'ldirilgach, ish davom etadi."
        ],
        "note": [
          "To'xtatilganda ma'lumotlar saqlanadi. Balansni markaz o'zi to'ldira olmaydi — ERS to'ldiradi.",
          "Hozircha 3 kunlik muhlat haqida ekranda ogohlantirish chiqmaydi — balansni oy boshida tekshiring."
        ]
      },
      {
        "slug": "tarif-ozgartirish",
        "title": "Tarifni qanday o'zgartiraman?",
        "roles": "all",
        "risk": "safe",
        "who": "Markaz rahbari",
        "keywords": [
          "tarif",
          "start",
          "biznes",
          "all-in",
          "tarifni o'zgartirish"
        ],
        "answer": "Tarifni o'zgartirish uchun ERS'ga qo'ng'iroq qiling: +998 77\u00a0317 05 21. Alohida bo'limlarni esa o'zingiz yoqasiz.",
        "link": {
          "href": "/modules",
          "label": "Tarif va modullarga o'tish"
        }
      }
    ],
    "permission": "@manage",
    "tip": "Bo'lim o'chirilganda ham ma'lumotlar o'chmaydi — qayta yoqsangiz, hammasi joyida bo'ladi."
  },
  {
    "slug": "yordam",
    "title": "Yordam kerakmi?",
    "icon": "LifeBuoy",
    "roles": "all",
    "intro": "Javob topmasangiz yoki ekranda tushunarsiz xabar chiqsa.",
    "questions": [
      {
        "slug": "kimga-murojaat",
        "title": "Javob topmadim — kimga murojaat qilaman?",
        "roles": "all",
        "risk": "safe",
        "who": "Administrator",
        "keywords": [
          "yordam",
          "murojaat",
          "qo'llab-quvvatlash",
          "support",
          "aloqa",
          "telefon"
        ],
        "answer": "Markazingiz administratoriga yoki direktoriga murojaat qiling. Ular kerak bo'lsa ERS jamoasi bilan bog'lanadi.",
        "steps": [
          "Nima qilmoqchi bo'lganingizni yozing.",
          "Ekrandagi xabarni aynan ko'chiring yoki suratga oling.",
          "Qaysi o'quvchi yoki guruh ekanini qo'shing."
        ],
        "note": [
          "Qidiruvga ekrandagi xabarni yozib ko'ring — ko'p xabarlarning izohi shu bo'limda bor."
        ]
      },
      {
        "slug": "tugma-ishlamadi",
        "title": "Tugmani bosdim, oyna yopilmadi, xabar ham yo'q",
        "roles": "all",
        "risk": "safe",
        "who": "Siz",
        "keywords": [
          "ishlamayapti",
          "oyna yopilmadi",
          "hech narsa bo'lmadi",
          "saqlanmadi",
          "qotib qoldi"
        ],
        "answer": "Ba'zi oynalar xatoni ko'rsatmaydi — oyna ochiq qoladi, xolos. Bu ma'lumot saqlanmaganini bildiradi.",
        "steps": [
          "Maydonlarni tekshiring: bo'sh yoki noto'g'ri raqam yo'qmi.",
          "Internetni tekshiring.",
          "Qayta bosing.",
          "Yana ochiq qolsa — administratorga ayting."
        ],
        "note": [
          "Takror telefon raqami (xodim, profil) va ruxsat yo'qligi ko'pincha shunday ko'rinadi."
        ]
      },
      {
        "slug": "sinov-tugadi",
        "title": "\"Sinov davri tugadi\" yozuvi chiqdi",
        "roles": "all",
        "risk": "safe",
        "who": "Markaz rahbari",
        "keywords": [
          "sinov tugadi",
          "trial",
          "bo'limlar yopildi",
          "yo'qoldi"
        ],
        "answer": "Sinovda ochiq bo'lgan bo'limlar yopildi, ma'lumotlar saqlanadi. Markaz rahbari istalgan vaqt qayta yoqadi.",
        "steps": [
          "Rahbar «Bo'limlarni ko'rish» ni bosadi.",
          "Kerakli bo'limni «Yoqish»."
        ]
      },
      {
        "slug": "obuna-toxtatilgan",
        "title": "\"Obuna to'xtatilgan — administrator bilan bog'laning\" chiqdi",
        "roles": "all",
        "risk": "safe",
        "who": "Markaz rahbari",
        "keywords": [
          "obuna to'xtatilgan",
          "bloklandi",
          "kira olmayapman",
          "tizim yopildi"
        ],
        "answer": "Markaz obunasi to'lanmagani uchun to'xtatilgan. Ma'lumotlar saqlanadi.",
        "steps": [
          "Direktorga ayting.",
          "Direktor ERS bilan bog'lanadi: +998 77\u00a0317 05 21.",
          "To'lovdan keyin qayta kirasiz."
        ]
      },
      {
        "slug": "tizimdan-chiqarib-yubordi",
        "title": "Tizim o'zi chiqarib yubordi",
        "roles": "all",
        "risk": "safe",
        "who": "Siz",
        "keywords": [
          "chiqarib yubordi",
          "sessiya",
          "qayta kirish",
          "xavfsizlik uchun"
        ],
        "answer": "Kirish muddati tugagan yoki parolingiz o'zgargan. Telefon va parol bilan qayta kiring.",
        "note": [
          "Bu xavfsizlik uchun — ma'lumotlaringiz joyida."
        ]
      }
    ],
    "tip": "Hamkasbingizga yordam kerak bo'lsa, savol ostidagi «Havolani nusxalash» bilan aynan shu javobni yuboring."
  }
];
