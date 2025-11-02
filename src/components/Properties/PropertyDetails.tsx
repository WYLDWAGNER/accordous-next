import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../lib/supabaseClient";
import ScheduleVisitDialog from "./ScheduleVisitDialog";
import LinkedPersonsDialog from "./LinkedPersonsDialog";

export const PropertyDetails: React.FC<{ id: string }> = ({ id }) => {
  const [visitDialogOpen, setVisitDialogOpen] = useState(false);
  const [personsDialogOpen, setPersonsDialogOpen] = useState(false);

  const { data: property, isLoading, error } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*, linked_persons")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  return (
    <div>
      {/* ... restante do layout da página ... */}

      <div className="mt-4 flex gap-2">
        <button onClick={() => setVisitDialogOpen(true)} className="rounded bg-blue-600 px-4 py-2 text-white">Agendar Visita</button>

        <button onClick={() => setPersonsDialogOpen(true)} className="rounded border px-4 py-2">Pessoas vinculadas</button>
      </div>

      <ScheduleVisitDialog propertyId={id} open={visitDialogOpen} onOpenChange={setVisitDialogOpen} />

      <LinkedPersonsDialog
        propertyId={id}
        open={personsDialogOpen}
        onOpenChange={setPersonsDialogOpen}
        initialLinkedPersons={property?.linked_persons ?? []}
      />

      {/* ... restante do layout da página ... */}
    </div>
  );
};

export default PropertyDetails;
