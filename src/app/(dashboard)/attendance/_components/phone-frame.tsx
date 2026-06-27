'use client';

import { Calendar, Signal, Wifi, BatteryFull } from 'lucide-react';
import { AttendanceMarker } from '@/components/attendance/attendance-marker';

/** Device chrome wrapping the shared AttendanceMarker. */
export function PhoneFrame() {
  return (
    <div className="w-[394px] rounded-[48px] bg-foreground p-[13px] shadow-nm">
      <div className="flex h-[752px] flex-col overflow-hidden rounded-[36px] bg-background">
        <div className="flex items-center justify-between px-7 pb-1 pt-3.5 text-foreground">
          <span className="text-[15px] font-extrabold tracking-[-0.3px]">9:41</span>
          <div className="flex items-center gap-1.5">
            <Signal className="size-[15px]" />
            <Wifi className="size-[15px]" />
            <BatteryFull className="size-[17px]" />
          </div>
        </div>
        <div className="flex items-center justify-between px-[22px] py-3">
          <h3 className="text-[20px] font-extrabold tracking-[-0.3px] text-foreground">
            Davomat
          </h3>
          <div className="flex size-10 items-center justify-center rounded-[12px] bg-background text-primary shadow-nm-sm">
            <Calendar className="size-[18px]" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-[8px_18px]">
          <AttendanceMarker />
        </div>
      </div>
    </div>
  );
}
