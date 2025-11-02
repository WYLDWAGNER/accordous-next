import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabaseClient";

interface ScheduleVisitDialogProps {
  propertyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const scheduleVisitSchema = z.object({
  visitor_name: z.string().min(1, "Nome é obrigatório"),
  visitor_phone: z.string().min(1, "Telefone é obrigatório"),
  visitor_email: z.string().email().optional().or(z.literal("")).transform(v => v || null),
  visit_date: z.string().min(1, "Data é obrigatória"),
  visit_time: z.string().min(1, "Hora é obrigatória"),
  notes: z.string().optional().or(z.literal("")).transform(v => v || null),
});

type ScheduleVisitForm = z.infer<typeof scheduleVisitSchema>;

export const ScheduleVisitDialog: React.FC<ScheduleVisitDialogProps> = ({
  propertyId,
  open,
  onOpenChange,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ScheduleVisitForm>({
    resolver: zodResolver(scheduleVisitSchema),
  });

  const queryClient = useQueryClient();

  const onSubmit = async (values: ScheduleVisitForm) => {
    try {
      const { data: userData, error: authErr } = await supabase.auth.getUser();
      if (authErr) throw authErr;

      const user_id = userData?.user?.id ?? null;

      const insertPayload = {
        id: uuidv4(),
        visitor_name: values.visitor_name,
        visitor_phone: values.visitor_phone,
        visitor_email: values.visitor_email,
        visit_date: values.visit_date,
        visit_time: values.visit_time,
        notes: values.notes,
        property_id: propertyId,
        user_id,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("scheduled_visits").insert([insertPayload]);
      if (error) throw error;

      queryClient.invalidateQueries(["property-visits", propertyId]);
      queryClient.invalidateQueries(["property-visits"]);

      reset();
      onOpenChange(false);
    } catch (err) {
      console.error("Erro ao agendar visita:", err);
    }
  };

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded bg-white p-6 shadow-lg">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Agendar Visita</h2>
          <button
            onClick={() => {
              reset();
              onOpenChange(false);
            }}
            aria-label="Fechar"
            className="text-gray-600"
          >
            ✕
          </button>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nome do interessado</label>
            <input {...register("visitor_name")} className="mt-1 w-full rounded border px-3 py-2" type="text" />
            {errors.visitor_name && <p className="text-sm text-red-600">{errors.visitor_name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Telefone</label>
            <input {...register("visitor_phone")} className="mt-1 w-full rounded border px-3 py-2" type="text" />
            {errors.visitor_phone && <p className="text-sm text-red-600">{errors.visitor_phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium">Email (opcional)</label>
            <input {...register("visitor_email")} className="mt-1 w-full rounded border px-3 py-2" type="email" />
            {errors.visitor_email && <p className="text-sm text-red-600">{errors.visitor_email.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Data da visita</label>
              <input {...register("visit_date")} className="mt-1 w-full rounded border px-3 py-2" type="date" />
              {errors.visit_date && <p className="text-sm text-red-600">{errors.visit_date.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Hora da visita</label>
              <input {...register("visit_time")} className="mt-1 w-full rounded border px-3 py-2" type="time" />
              {errors.visit_time && <p className="text-sm text-red-600">{errors.visit_time.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Observações (opcional)</label>
            <textarea {...register("notes")} className="mt-1 w-full rounded border px-3 py-2" rows={3} />
          </div>

          <footer className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={() => { reset(); onOpenChange(false); }} className="rounded border px-4 py-2">Cancelar</button>

            <button type="submit" disabled={isSubmitting} className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60">
              {isSubmitting ? "Salvando..." : "Agendar visita"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default ScheduleVisitDialog;
