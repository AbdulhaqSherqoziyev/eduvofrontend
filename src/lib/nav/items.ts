import {
  LayoutGrid, Boxes, ClipboardCheck, CreditCard, FileText, CalendarDays,
  ArrowLeftRight, Users, GraduationCap, Compass, Layers, ShieldCheck, BarChart3,
  UserCog, type LucideIcon,
} from 'lucide-react';

export type NavSection = 'asosiy' | 'boshqaruv';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permission?: string;
  section: NavSection;
}

/** Sidebar navigation, split into the two top-bar sections. */
export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: "Umumiy ko'rinish", icon: LayoutGrid, section: 'asosiy' },
  { href: '/groups', label: 'Guruhlar', icon: Boxes, permission: 'group.read', section: 'asosiy' },
  { href: '/attendance', label: 'Davomat', icon: ClipboardCheck, permission: 'attendance.read', section: 'asosiy' },
  { href: '/payments', label: "To'lovlar", icon: CreditCard, permission: 'payment.read', section: 'asosiy' },
  { href: '/assignments', label: 'Vazifalar', icon: FileText, permission: 'assignment.read', section: 'asosiy' },
  { href: '/schedule', label: 'Dars jadvali', icon: CalendarDays, permission: 'lesson.read', section: 'asosiy' },
  { href: '/transactions', label: 'Tranzaksiyalar', icon: ArrowLeftRight, permission: 'transaction.read', section: 'boshqaruv' },
  { href: '/students', label: "O'quvchilar", icon: Users, permission: 'student.read', section: 'boshqaruv' },
  { href: '/teachers', label: "O'qituvchilar", icon: GraduationCap, permission: 'teacher.read', section: 'boshqaruv' },
  { href: '/directions', label: "Yo'nalishlar", icon: Compass, permission: 'subject.read', section: 'boshqaruv' },
  { href: '/manage-groups', label: 'Guruhlar', icon: Layers, permission: 'group.update', section: 'boshqaruv' },
  { href: '/reports', label: 'Hisobotlar', icon: BarChart3, permission: 'report.finance', section: 'boshqaruv' },
  { href: '/staff', label: 'Xodimlar', icon: UserCog, permission: 'user.read', section: 'boshqaruv' },
  { href: '/roles', label: 'Rollar', icon: ShieldCheck, permission: 'role.read', section: 'boshqaruv' },
];

export const SECTION_HOME: Record<NavSection, string> = {
  asosiy: '/dashboard',
  boshqaruv: '/transactions',
};

export function sectionForPath(pathname: string): NavSection {
  const match = NAV_ITEMS.find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));
  return match?.section ?? 'asosiy';
}
