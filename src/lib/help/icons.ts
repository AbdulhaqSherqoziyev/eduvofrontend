import {
  BookOpen, Building2, CalendarDays, CircleHelp, ClipboardCheck, Coins, CreditCard, FileText, LifeBuoy,
  MessagesSquare, Package, Rocket, ShieldCheck, Smartphone, UserPlus, Users, Wallet, type LucideIcon,
} from 'lucide-react';

/** CONTENT.md `icon:` names -> lucide components (SPEC §13.2). Keep in sync with the generator's ICONS set. */
const ICONS: Record<string, LucideIcon> = {
  Rocket, MessagesSquare, CreditCard, ClipboardCheck, Users, FileText, CalendarDays, Coins,
  Wallet, UserPlus, Building2, ShieldCheck, Smartphone, Package, BookOpen, LifeBuoy,
};

export function helpIcon(name: string): LucideIcon {
  return ICONS[name] ?? CircleHelp;
}
