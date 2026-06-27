import { Avatar } from '@/components/ui/avatar';
import { StatusPill } from '@/components/shared/status-pill';
import { formatSom } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { STUDENT_STATUS_META, type Student } from '@/lib/types/student';
import { StudentRowActions } from './student-row-actions';

const COLS = 'grid grid-cols-[2.4fr_1.5fr_1.3fr_1.1fr_92px] items-center gap-4';

/** One student table row (avatar, group, balance, status, actions). */
export function StudentRow({ student }: { student: Student }) {
  const meta = STUDENT_STATUS_META[student.status];
  const debt = student.balance < 0;
  return (
    <div className={cn(COLS, 'rounded-[16px] px-4 py-[13px] transition-shadow hover:shadow-nm-inset-sm')}>
      <div className="flex min-w-0 items-center gap-[13px]">
        <Avatar name={student.fullName} size={42} />
        <div className="min-w-0">
          <div className="truncate text-[14px] font-bold text-foreground">{student.fullName}</div>
          <div className="text-[12px] font-semibold text-[#9aa6b8]">{student.phone}</div>
        </div>
      </div>
      <div>
        <span className="inline-flex rounded-[10px] bg-background px-[13px] py-1.5 text-[12.5px] font-semibold text-[#5b6b82] shadow-nm-inset-sm">
          {student.groupName ?? '—'}
        </span>
      </div>
      <div
        className={cn(
          'text-[14px] font-bold',
          student.balance === 0 ? 'text-muted' : debt ? 'text-danger' : 'text-success',
        )}
      >
        {student.balance === 0 ? '—' : formatSom(student.balance, { sign: true })}
      </div>
      <div>
        <StatusPill label={meta.label} tone={meta.tone} />
      </div>
      <StudentRowActions student={student} />
    </div>
  );
}
