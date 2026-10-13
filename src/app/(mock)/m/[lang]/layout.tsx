/**
 * Second root layout: the mock.eduvo.uz site (served on the mock host as `/{lang}/…`; the
 * middleware rewrites it to `/m/{lang}/…`). Placeholder until the i18n layer lands.
 */
export default function MockRootLayout({ children, params: { lang } }: { children: React.ReactNode; params: { lang: string } }) {
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}
