/** Page title + subtitle by route, shown in the dashboard shell header. */
const TITLES: Record<string, [string, string]> = {
  '/dashboard': ['Assalomu alaykum!', 'Bugungi markaz holati'],
  '/groups': ['Guruhlar', "Faol o'quv guruhlari holati"],
  '/attendance': ['Davomat', "O'qituvchi mobil ko'rinishi"],
  '/payments': ["To'lovlar", 'Hisob-kitob va to’lov tarixi'],
  '/assignments': ['Vazifalar', 'Uy vazifalari va topshiriqlar'],
  '/schedule': ['Dars jadvali', 'Haftalik dars jadvali'],
  '/transactions': ['Tranzaksiyalar tarixi', 'Barcha kirim va chiqimlar'],
  '/leads': ['Lidlar', "Qiziqish bildirganlar va ularning bosqichlari"],
  '/students': ["O'quvchilar", "Barcha o'quvchilar ro'yxati"],
  '/teachers': ["O'qituvchilar", "O'qituvchilarni qo'shish va boshqarish"],
  '/directions': ["Yo'nalishlar", "O'quv yo'nalishlari va kurslar"],
  '/manage-groups': ['Guruhlar boshqaruvi', "Guruh ochish va o'quvchi biriktirish"],
  '/reports': ['Hisobotlar', 'Moliya, davomat va o’qituvchilar tahlili'],
  '/roles': ['Rollar va ruxsatlar', 'Foydalanuvchi huquqlarini boshqarish'],
  '/staff': ['Xodimlar', "Xodimlarni qo'shish, rol biriktirish va boshqarish"],
  '/profile': ['Mening profilim', "Ism, telefon va parolni o'zgartirish"],
  '/modules': ['Tarif va modullar', "Yoqilgan bo'limlar va oylik to'lov"],
};

export function titleForPath(pathname: string): [string, string] {
  if (pathname.startsWith('/groups/')) return ['Guruh tafsilotlari', "Davomat, vazifa va to'lovlar"];
  return TITLES[pathname] ?? ['', ''];
}
