import {
  LayoutGrid, Boxes, ClipboardCheck, CreditCard, FileText, CalendarDays,
  ArrowLeftRight, Users, GraduationCap, Compass, Layers, ShieldCheck, BarChart3,
  UserCog, DoorOpen, Building2, UserPlus, type LucideIcon,
} from 'lucide-react';
import { can } from '@/lib/auth/permissions';
import { isSuperAdmin } from '@/lib/auth/session';

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
  { href: '/leads', label: 'Lidlar', icon: UserPlus, permission: 'student.read', section: 'boshqaruv' },
  { href: '/students', label: "O'quvchilar", icon: Users, permission: 'student.read', section: 'boshqaruv' },
  { href: '/teachers', label: "O'qituvchilar", icon: GraduationCap, permission: 'teacher.read', section: 'boshqaruv' },
  { href: '/directions', label: "Yo'nalishlar", icon: Compass, permission: 'subject.read', section: 'boshqaruv' },
  { href: '/manage-groups', label: 'Guruhlar', icon: Layers, permission: 'group.update', section: 'boshqaruv' },
  { href: '/rooms', label: 'Xonalar', icon: DoorOpen, permission: 'room.read', section: 'boshqaruv' },
  { href: '/branches', label: 'Filiallar', icon: Building2, section: 'boshqaruv' },
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

/** Daily-work routes a teacher (teacher-only mode) is limited to. */
export const TEACHER_NAV = new Set(['/dashboard', '/groups', '/attendance', '/schedule', '/assignments']);

/**
 * Nav items the current user may actually see in a section:
 * gated by their permissions, and (in teacher-only mode) narrowed to the
 * daily-work routes. SUPER_ADMIN always sees everything.
 */
export function visibleNavItems(section: NavSection, teacherOnly = false): NavItem[] {
  const su = isSuperAdmin();
  return NAV_ITEMS.filter((i) => i.section === section)
    .filter((i) => su || !i.permission || can(i.permission))
    .filter((i) => su || !teacherOnly || TEACHER_NAV.has(i.href));
}

/** Sections that have at least one visible item for the current user. */
export function visibleSections(teacherOnly = false): NavSection[] {
  return (['asosiy', 'boshqaruv'] as NavSection[]).filter((s) => visibleNavItems(s, teacherOnly).length > 0);
}
