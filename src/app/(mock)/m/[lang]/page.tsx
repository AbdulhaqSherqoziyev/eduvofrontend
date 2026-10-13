/** Landing — built in the design-system commit; placeholder keeps the locale home routable. */
import { setRequestLocale } from 'next-intl/server';

export default function LandingPage({ params: { lang } }: { params: { lang: string } }) {
  setRequestLocale(lang);
  return <main />;
}
