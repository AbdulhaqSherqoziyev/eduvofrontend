import { IntroPanel } from './_components/intro-panel';
import { PhoneFrame } from './_components/phone-frame';

/** Attendance screen — teacher mobile preview with the shared marking UI. */
export default function AttendancePage() {
  return (
    <section className="flex flex-wrap items-start justify-center gap-[46px] pt-1.5">
      <IntroPanel />
      <PhoneFrame />
    </section>
  );
}
