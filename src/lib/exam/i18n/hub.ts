/**
 * Student hub copy — Uzbek only (T43). Keys from `_player-texts.md` (`results.*`,
 * `errors.*`, `gate.*`, `hub.*`) resolve through the player strings; the `hubx.*`
 * keys below are the hub-only texts written verbatim in `_hub-design.md`
 * (listed in the frontend report so Sevara can move them into her file).
 */
import { HUB_DETAIL } from './hub-copy-detail';
import { HUB_RESULTS } from './hub-copy-results';
import { t, type TextKey } from './index';

const HUBX = {
  'hubx.brand_sub': ' · Mock imtihonlar',
  'hubx.tab_exams': 'Imtihonlar',
  'hubx.tab_progress': 'Natijalarim',
  'hubx.back_cabinet': 'Kabinetga qaytish',
  'hubx.sign_out': 'Chiqish',
  'hubx.footer': "Bu mashq testlari rasmiy imtihon formatiga mos tuzilgan, lekin IELTS hamkorlari, UZBMB va boshqa rasmiy tashkilotlar bilan bog'liq emas.",
  'hubx.title': 'Mock imtihonlar',
  'hubx.lead': "Real imtihon formatida mashq qiling. Listening va Reading natijasi darhol, Writing — bir necha daqiqada.",
  'hubx.assigned': 'Tayinlangan',
  'hubx.assigned_at': 'Tayinlangan: {at}',
  'hubx.open_now': 'Hozir ochiq · {end} gacha',
  'hubx.more_assignments': 'Yana {n} ta tayinlov',
  'hubx.all': 'Barchasi',
  'hubx.duration': 'DAVOMIYLIK',
  'hubx.price': 'NARX',
  'hubx.payment': "TO'LOV",
  'hubx.best': 'ENG YAXSHI',
  'hubx.no_attempt': "Hali urinish yo'q",
  'hubx.details': 'Batafsil',
  'hubx.coming_soon': 'Tez kunda',
  'hubx.start': 'Boshlash',
  'hubx.continue': 'Davom etish',
  'hubx.view_result': "Natijani ko'rish",
  'hubx.empty_title': "Hozircha imtihon yo'q",
  'hubx.empty_body': "Markazingiz test qo'shgach shu yerda ko'rinadi.",
  'hubx.err_title': 'Imtihonlar yuklanmadi',
  'hubx.err_body': "Internet aloqasini tekshirib, qayta urinib ko'ring.",
  'hubx.retry': 'Qayta urinish',
  'hubx.module_off_title': 'Bu markazda mock imtihonlar yoqilmagan',
  'hubx.module_off_body': "Ochish uchun markaz administratoriga murojaat qiling.",
  'hubx.not_found': 'Imtihon topilmadi',
  'hubx.exams_list': "Imtihonlar ro'yxati",
  'hubx.open_on_pc': 'Kompyuterda oching',
  'hubx.copy_link': 'Havolani nusxalash',
  'hubx.copied': 'Nusxalandi',
  'hubx.speaking_soon': 'Tez orada',
  ...HUB_DETAIL,
  ...HUB_RESULTS,
} as const;

export type HubKey = keyof typeof HUBX | TextKey;
type Vars = Record<string, string | number>;

export function ht(key: HubKey, vars?: Vars): string {
  if (key in HUBX) {
    let s: string = HUBX[key as keyof typeof HUBX];
    for (const [k, v] of Object.entries(vars ?? {})) s = s.split(`{${k}}`).join(String(v));
    return s;
  }
  return t(key as TextKey, 'uz', vars);
}
