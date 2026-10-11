/** Page title + subtitle by route, shown in the dashboard shell header. */
const TITLES: Record<string, [string, string]> = {
  '/dashboard': ['Assalomu alaykum!', 'Bugungi markaz holati'],
  '/groups': ['Guruhlar', "Faol o'quv guruhlari holati"],
  '/attendance': ['Davomat', "O'qituvchi mobil ko'rinishi"],
  '/payments': ["To'lovlar", 'Hisob-kitob va to’lov tarixi'],
  '/assignments': ['Vazifalar', 'Uy vazifalari va topshiriqlar'],
  '/schedule': ['Dars jadvali', 'Haftalik dars jadvali'],
  '/transactions': ['Kassa', 'Kirim, chiqim va kun yakuni'],
  '/leads': ['Lidlar', "Qiziqish bildirganlar va ularning bosqichlari"],
  '/students': ["O'quvchilar", "Barcha o'quvchilar ro'yxati"],
  '/teachers': ["O'qituvchilar", "O'qituvchilarni qo'shish va boshqarish"],
  '/directions': ["Yo'nalishlar", "O'quv yo'nalishlari va kurslar"],
  '/manage-groups': ['Guruhlar boshqaruvi', "Guruh ochish va o'quvchi biriktirish"],
  '/my-salary': ['Mening ish haqim', 'Oylik hisobingiz va u qanday chiqqani'],
  '/payroll': ['Ish haqi', 'Oylik hisob-kitob va to’lovlar'],
  '/reports': ['Hisobotlar', 'Moliya, davomat va o’qituvchilar tahlili'],
  '/roles': ['Rollar va ruxsatlar', 'Foydalanuvchi huquqlarini boshqarish'],
  '/staff': ['Xodimlar', "Xodimlarni qo'shish, rol biriktirish va boshqarish"],
  '/profile': ['Mening profilim', "Ism, telefon va parolni o'zgartirish"],
  '/modules': ['Tarif va modullar', "Yoqilgan bo'limlar va oylik to'lov"],
  '/help': ["Qo'llanma", "Tizim qanday ishlaydi — savollar va javoblar"],
  // Mock imtihonlar konsoli: design v3 puts the title row inside the screen
  // (with its action buttons), so those screens render `ConsoleHeader` themselves.
};

export function titleForPath(pathname: string): [string, string] {
  if (pathname.startsWith('/groups/')) return ['Guruh tafsilotlari', "Davomat, vazifa va to'lovlar"];
  if (pathname.startsWith('/exams/assignments/')) return ['Tayinlov tafsilotlari', 'Jonli kuzatuv, kirish kodlari va natijalar'];
  return TITLES[pathname] ?? ['', ''];
}
