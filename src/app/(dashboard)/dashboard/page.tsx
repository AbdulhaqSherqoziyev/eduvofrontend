import { TrialEndedNotice } from './_components/trial-ended-notice';
import { OnboardingCard } from './_components/onboarding-card';
import { MetricCards } from './_components/metric-cards';
import { IncomeChart } from './_components/income-chart';
import { DebtorsCard } from './_components/debtors-card';
import { TeacherPerformanceCard } from './_components/teacher-performance-card';
import { ActivityFeed } from './_components/activity-feed';

/** Dashboard home — metrics, income chart, debtors, teacher performance, activity. */
export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-[22px] items-start">
      <TrialEndedNotice />
      <OnboardingCard />
      <MetricCards />
      <IncomeChart />
      <DebtorsCard />
      <TeacherPerformanceCard />
      <ActivityFeed />
    </div>
  );
}
