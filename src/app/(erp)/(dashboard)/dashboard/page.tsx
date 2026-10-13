import { Can } from '@/components/shared/can';
import { TrialEndedNotice } from './_components/trial-ended-notice';
import { OnboardingCard } from './_components/onboarding-card';
import { PendingCashCard } from './_components/pending-cash-card';
import { MetricCards } from './_components/metric-cards';
import { IncomeChart } from './_components/income-chart';
import { DebtorsCard } from './_components/debtors-card';
import { TeacherPerformanceCard } from './_components/teacher-performance-card';
import { ActivityFeed } from './_components/activity-feed';

/**
 * Dashboard home.
 *
 * Three widgets are whole-payload privileged and their endpoints now refuse
 * without the code, so the card is not drawn at all — a locked box asks "what
 * is in there?" and gets answered by a colleague; an absent box asks nothing.
 * `MetricCards` and `ActivityFeed` are mixed instead: the server narrows what
 * it sends and they draw whatever came back.
 */
export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-[22px] items-start">
      <TrialEndedNotice />
      <OnboardingCard />
      <PendingCashCard />
      <MetricCards />
      <Can permission="report.finance">
        <IncomeChart />
      </Can>
      {/* Named students and what they owe — never a teacher's to see [S2]. */}
      <Can permission="payment.read">
        <DebtorsCard />
      </Can>
      {/* A ranking of named colleagues — Sevara's leaderboard ban [S5.1]. */}
      <Can permission="report.teacher">
        <TeacherPerformanceCard />
      </Can>
      <ActivityFeed />
    </div>
  );
}
