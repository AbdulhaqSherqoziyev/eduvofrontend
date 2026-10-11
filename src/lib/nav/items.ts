import {
  LayoutGrid, Boxes, ClipboardCheck, CreditCard, FileText, CalendarDays,
  Wallet, Users, GraduationCap, Compass, Layers, ShieldCheck, BarChart3,
  UserCog, DoorOpen, Building2, UserPlus, Package, Coins, HandCoins, LifeBuoy, LineChart,
  type LucideIcon,
} from 'lucide-react';
import { can } from '@/lib/auth/permissions';
import { canViewModulesScreen, moduleOn } from '@/lib/auth/module-gate';
import { isSuperAdmin } from '@/lib/auth/session';

export type NavSection = 'asosiy' | 'boshqaruv' | 'imtihonlar';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: string;
  /**
   * Product module this screen belongs to. When the center has not bought it,
   * the item is not rendered at all — no lock icon, no greyed-out row (§B.1.1).
   */
  module?: string;
  /**
   * Subscription screen. Shown from the backend's own answer in
   * GET /api/modules, never by re-deriving the admin role list here — a second
   * copy of that rule is guaranteed to drift from the first.
   */
  manageOnly?: boolean;
  section: NavSection;
  /** Thin separator above the item (sets "Qo'llanma" apart from daily work). */
  divider?: boolean;
  /** Count badge key, resolved by the sidebar (design v3: live+upcoming sessions, AI queue). */
  badge?: 'examSessions' | 'examGrading';
}

/**
 * Sidebar navigation, split into the two top-bar sections.
 *
 * `module` keys mirror the backend's @RequiresModule decorators — the four that
 * can realistically hide are leads / finance / branches / assignments; the rest
 * point at core modules that are never off.
 */
export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: "Umumiy ko'rinish", icon: LayoutGrid, section: 'asosiy' },
  { href: '/groups', label: 'Guruhlar', icon: Boxes, permission: 'group.read', module: 'groups', section: 'asosiy' },
  { href: '/attendance', label: 'Davomat', icon: ClipboardCheck, permission: 'attendance.read', module: 'attendance', section: 'asosiy' },
  { href: '/payments', label: "To'lovlar", icon: CreditCard, permission: 'payment.read', module: 'payments', section: 'asosiy' },
  { href: '/assignments', label: 'Vazifalar', icon: FileText, permission: 'assignment.read', module: 'assignments', section: 'asosiy' },
  { href: '/schedule', label: 'Dars jadvali', icon: CalendarDays, permission: 'lesson.read', module: 'schedule', section: 'asosiy' },
  // Ustozning O'Z hisobi — `payroll.self`, `payroll.read` EMAS. Ikkinchisi
  // berilsa ustoz hammaning maoshini ko'radi va S1 buziladi (spec §H.1).
  { href: '/my-salary', label: 'Mening ish haqim', icon: Coins, permission: 'payroll.self', module: 'payroll', section: 'asosiy' },
  // Hamma uchun: modul/ruxsat yo'q. Kontent o'zi menyu qoidasi bilan filtrlanadi.
  { href: '/help', label: "Qo'llanma", icon: LifeBuoy, section: 'asosiy', divider: true },
  { href: '/transactions', label: 'Kassa', icon: Wallet, permission: 'transaction.read', module: 'finance', section: 'boshqaruv' },
  { href: '/leads', label: 'Lidlar', icon: UserPlus, permission: 'student.read', module: 'leads', section: 'boshqaruv' },
  { href: '/students', label: "O'quvchilar", icon: Users, permission: 'student.read', module: 'students', section: 'boshqaruv' },
  { href: '/teachers', label: "O'qituvchilar", icon: GraduationCap, permission: 'teacher.read', module: 'teachers', section: 'boshqaruv' },
  { href: '/directions', label: "Yo'nalishlar", icon: Compass, permission: 'subject.read', module: 'groups', section: 'boshqaruv' },
  { href: '/manage-groups', label: 'Guruhlar', icon: Layers, permission: 'group.update', module: 'groups', section: 'boshqaruv' },
  { href: '/rooms', label: 'Xonalar', icon: DoorOpen, permission: 'room.read', module: 'schedule', section: 'boshqaruv' },
  { href: '/branches', label: 'Filiallar', icon: Building2, module: 'branches', section: 'boshqaruv' },
  { href: '/payroll', label: 'Ish haqi', icon: HandCoins, permission: 'payroll.read', module: 'payroll', section: 'boshqaruv' },
  { href: '/reports', label: 'Hisobotlar', icon: BarChart3, permission: 'report.finance', module: 'reports', section: 'boshqaruv' },
  { href: '/staff', label: 'Xodimlar', icon: UserCog, permission: 'user.read', module: 'staff_roles', section: 'boshqaruv' },
  { href: '/roles', label: 'Rollar', icon: ShieldCheck, permission: 'role.read', module: 'staff_roles', section: 'boshqaruv' },
  { href: '/modules', label: 'Tarif va modullar', icon: Package, manageOnly: true, section: 'boshqaruv' },
  // Mock imtihonlar — markaz konsoli (design v3 sidebar). `/exams` (indekssiz)
  // o'quvchi hub'iga tegishli, shuning uchun konsol `/exams/catalog` dan boshlanadi.
  { href: '/exams/catalog', label: 'Katalog', icon: LayoutGrid, permission: 'exam.read', module: 'mock_exams', section: 'imtihonlar' },
  { href: '/exams/assignments', label: 'Rejalashtirilgan', icon: CalendarDays, permission: 'exam.read', module: 'mock_exams', section: 'imtihonlar', badge: 'examSessions' },
  { href: '/exams/results', label: 'Natijalar', icon: LineChart, permission: 'exam.read', module: 'mock_exams', section: 'imtihonlar' },
  { href: '/exams/ai', label: 'AI baholash', icon: ClipboardCheck, permission: 'exam.read', module: 'mock_exams', section: 'imtihonlar', badge: 'examGrading' },
  { href: '/exams/tests', label: 'Test banki', icon: Layers, permission: 'exam.read', module: 'mock_exams', section: 'imtihonlar' },
  { href: '/exams/credits', label: 'Kreditlar', icon: Wallet, permission: 'exam.read', module: 'mock_exams', section: 'imtihonlar' },
];

export const SECTION_HOME: Record<NavSection, string> = {
  asosiy: '/dashboard',
  boshqaruv: '/transactions',
  imtihonlar: '/exams/catalog',
};

export function sectionForPath(pathname: string): NavSection {
  const match = NAV_ITEMS.find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));
  return match?.section ?? 'asosiy';
}

/**
 * Module that gates a route, if any. Longest match wins so nested routes
 * (`/groups/<id>`, `/assignments/<id>`) inherit their parent's module.
 */
export function moduleForPath(pathname: string): string | undefined {
  return NAV_ITEMS.filter((i) => i.module && (pathname === i.href || pathname.startsWith(`${i.href}/`)))
    .sort((a, b) => b.href.length - a.href.length)[0]?.module;
}

/** Daily-work routes a teacher (teacher-only mode) is limited to. */
export const TEACHER_NAV = new Set([
  '/dashboard', '/groups', '/attendance', '/schedule', '/assignments', '/my-salary', '/help',
  // O'qituvchi o'z guruhiga mock tayinlaydi va natijani ko'radi (kontrakt §2, TeacherScope).
  '/exams/catalog', '/exams/assignments', '/exams/results',
]);

/**
 * Nav items the current user may actually see in a section:
 * gated by the center's modules, then by their permissions, and (in
 * teacher-only mode) narrowed to the daily-work routes.
 *
 * SUPER_ADMIN bypasses the permission and teacher-only filters, but NOT the
 * module filter: "director" is about who you are, "module" is about what the
 * center bought. A director whose center never bought Lidlar must not find a
 * dead Lidlar link either.
 *
 * `manageOnly` is likewise not a role check — it asks the backend whether the
 * page behind the link has anything to show this user, so the link exists
 * exactly when following it leads somewhere.
 */
export function visibleNavItems(section: NavSection, teacherOnly = false): NavItem[] {
  const su = isSuperAdmin();
  return NAV_ITEMS.filter((i) => i.section === section)
    .filter((i) => !i.module || moduleOn(i.module))
    .filter((i) => !i.manageOnly || canViewModulesScreen())
    .filter((i) => su || !i.permission || can(i.permission))
    .filter((i) => su || !teacherOnly || TEACHER_NAV.has(i.href));
}

/** Sections that have at least one visible item for the current user. */
export function visibleSections(teacherOnly = false): NavSection[] {
  return (['asosiy', 'boshqaruv', 'imtihonlar'] as NavSection[]).filter((s) => visibleNavItems(s, teacherOnly).length > 0);
}
