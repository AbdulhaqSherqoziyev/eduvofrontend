"use client";

import type { UseFormReturn } from "react-hook-form";
import { NmInput } from "@/components/ui/nm-input";
import { NmSelect } from "@/components/ui/nm-select";
import { FieldLabel } from "@/components/ui/label";
import { useSubjects } from "@/lib/hooks/use-subjects";
import type { TeacherFormValues } from "./teacher-schema";

/** Shared name / phone / direction fields for add & edit teacher dialogs. */
export function TeacherFormFields({ form }: { form: UseFormReturn<TeacherFormValues> }) {
  const { data } = useSubjects({ pageSize: 100 });
  const directions = (data?.items ?? []).map((s) => s.name);
  const { register, formState } = form;
  const { errors } = formState;

  return (
    <div className="flex flex-col gap-4">
      <div>
        <FieldLabel>ISM FAMILIYA</FieldLabel>
        <NmInput placeholder="Masalan: Dilshod Karimov" {...register("fullName")} />
        {errors.fullName ? <p className="mt-1.5 text-[12px] font-semibold text-danger">{errors.fullName.message}</p> : null}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <FieldLabel>TELEFON</FieldLabel>
          <NmInput placeholder="+998 90 ..." {...register("phone")} />
          {errors.phone ? <p className="mt-1.5 text-[12px] font-semibold text-danger">{errors.phone.message}</p> : null}
        </div>
        <div>
          <FieldLabel>YO‘NALISH</FieldLabel>
          <NmSelect defaultValue="" {...register("directions")}>
            <option value="">Yo‘nalishni tanlang...</option>
            {directions.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </NmSelect>
        </div>
      </div>
      <p className="text-[12px] font-medium text-muted">
        Guruhlar biriktirilgach, o‘qituvchining yo‘nalishlari avtomatik ko‘rinadi.
      </p>
    </div>
  );
}
