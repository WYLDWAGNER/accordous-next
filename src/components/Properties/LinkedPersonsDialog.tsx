import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabaseClient";

interface LinkedPersonsDialogProps {
  propertyId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLinkedPersons?: any[];
}

const personSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["fiador", "procurador", "proprietario", "outro"], {
    errorMap: () => ({ message: "Tipo é obrigatório" }),
  }),
  phone: z.string().min(1, "Telefone é obrigatório"),
  email: z.string().email().optional().or(z.literal("")).transform(v => v || null),
  document: z.string().optional().or(z.literal("")).transform(v => v || null),
  notes: z.string().optional().or(z.literal("")).transform(v => v || null),
});

type PersonForm = z.infer<typeof personSchema>;

export const LinkedPersonsDialog: React.FC<LinkedPersonsDialogProps> = ({
  propertyId,
  open,
  onOpenChange,
  initialLinkedPersons = [],
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PersonForm>({
    resolver: zodResolver(personSchema),
  });

  const queryClient = useQueryClient();

  const onAdd = async (values: PersonForm) => {
    try {
      const { data: propData, error: propErr } = await supabase
        .from("properties")
        .select("linked_persons")
        .eq("id", propertyId)
        .single();

      if (propErr) throw propErr;

      const current: any[] = propData?.linked_persons ?? [];

      const newPerson = {
        id: uuidv4(),
        name: values.name,
        type: values.type,
        phone: values.phone,
        email: values.email,
        document: values.document,
        notes: values.notes,
        created_at: new Date().toISOString(),
      };

      const updated = [...current, newPerson];

      const { error: updateErr } = await supabase
        .from("properties")
        .update({ linked_persons: updated })
        .eq("id", propertyId);

      if (updateErr) throw updateErr;

      queryClient.invalidateQueries(["property", propertyId]);
      queryClient.invalidateQueries(["properties"]);
      reset();
    } catch (err) {
      console.error("Erro ao adicionar pessoa vinculada:", err);
    }
  };

  const onRemove = async (personId: string) => {
    try {
      const { data: propData, error: propErr } = await supabase
        .from("properties")
        .select("linked_persons")
        .eq("id", propertyId)
        .single();

      if (propErr) throw propErr;

      const current: any[] = propData?.linked_persons ?? [];
      const updated = current.filter((p) => p.id !== personId);

      const { error: updateErr } = await supabase
        .from("properties")
        .update({ linked_persons: updated })
        .eq("id", propertyId);

      if (updateErr) throw updateErr;

      queryClient.invalidateQueries(["property", propertyId]);
      queryClient.invalidateQueries(["properties"]);
    } catch (err) {
      console.error("Erro ao remover pessoa vinculada:", err);
    }
  };

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded bg-white p-6 shadow-lg">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Pessoas vinculadas</h2>
          <button onClick={() => { reset(); onOpenChange(false); }} aria-label="Fechar" className="text-gray-600">✕</button>
        </header>

        <section className="mb-6">
          <h3 className="mb-2 font-medium">Lista atual</h3>
          <div className="space-y-3">
            {(initialLinkedPersons || []).length === 0 ? (
              <p className="text-sm text-gray-600">Nenhuma pessoa vinculada.</p>
            ) : (
              (initialLinkedPersons || []).map((p: any) => (
                <div key={p.id} className="flex items-start justify-between rounded border p-3">
                  <div>
                    <div className="font-medium">{p.name} <span className="text-sm text-gray-500">({p.type})</span></div>
                    <div className="text-sm text-gray-600">{p.phone} {p.email ? `• ${p.email}` : ""}</div>
                    {p.document && <div className="text-sm text-gray-600">Doc: {p.document}</div>}
                    {p.notes && <div className="text-sm text-gray-600">Obs: {p.notes}</div>}
                  </div>
                  <div>
                    <button onClick={() => onRemove(p.id)} className="rounded bg-red-600 px-3 py-1 text-white">Remover</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <h3 className="mb-2 font-medium">Adicionar nova pessoa</h3>
          <form onSubmit={handleSubmit(onAdd)} className="space-y-3">
            <div>
              <label className="block text-sm font-medium">Nome</label>
              <input {...register("name")} className="mt-1 w-full rounded border px-3 py-2" />
              {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Tipo</label>
              <select {...register("type")} className="mt-1 w-full rounded border px-3 py-2">
                <option value="fiador">Fiador</option>
                <option value="procurador">Procurador</option>
                <option value="proprietario">Proprietário</option>
                <option value="outro">Outro</option>
              </select>
              {errors.type && <p className="text-sm text-red-600">{errors.type.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Telefone</label>
              <input {...register("phone")} className="mt-1 w-full rounded border px-3 py-2" />
              {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium">Email (opcional)</label>
              <input {...register("email")} type="email" className="mt-1 w-full rounded border px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium">CPF/CNPJ (opcional)</label>
              <input {...register("document")} className="mt-1 w-full rounded border px-3 py-2" />
            </div>

            <div>
              <label className="block text-sm font-medium">Observações (opcional)</label>
              <textarea {...register("notes")} className="mt-1 w-full rounded border px-3 py-2" rows={3} />
            </div>

            <footer className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => { reset(); }} className="rounded border px-4 py-2">Limpar</button>
              <button type="submit" disabled={isSubmitting} className="rounded bg-green-600 px-4 py-2 text-white disabled:opacity-60">{isSubmitting ? "Adicionando..." : "Adicionar pessoa"}</button>
            </footer>
          </form>
        </section>
      </div>
    </div>
  );
};

export default LinkedPersonsDialog;
