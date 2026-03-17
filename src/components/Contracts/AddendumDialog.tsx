import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, FileSignature } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Addendum {
  id: string;
  date: string;
  reason: string;
  changes: {
    rental_value?: { from: number; to: number };
    end_date?: { from: string | null; to: string };
    payment_day?: { from: number; to: number };
  };
  created_at: string;
}

interface AddendumDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  currentRentalValue: number;
  currentEndDate: string | null;
  currentPaymentDay: number;
  existingAddendums: Addendum[];
  onUpdate: () => void;
}

const addendumSchema = z.object({
  reason: z.string().min(5, "Motivo deve ter pelo menos 5 caracteres").max(500, "Máximo 500 caracteres"),
  change_rental: z.boolean().default(false),
  new_rental_value: z.number().min(0).optional(),
  change_end_date: z.boolean().default(false),
  new_end_date: z.date().optional(),
  change_payment_day: z.boolean().default(false),
  new_payment_day: z.number().min(1).max(31).optional(),
}).refine((data) => {
  return data.change_rental || data.change_end_date || data.change_payment_day;
}, {
  message: "Selecione pelo menos uma alteração",
  path: ["change_rental"],
});

type AddendumFormData = z.infer<typeof addendumSchema>;

export function AddendumDialog({
  open,
  onOpenChange,
  contractId,
  currentRentalValue,
  currentEndDate,
  currentPaymentDay,
  existingAddendums,
  onUpdate,
}: AddendumDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddendumFormData>({
    resolver: zodResolver(addendumSchema),
    defaultValues: {
      reason: "",
      change_rental: false,
      new_rental_value: currentRentalValue,
      change_end_date: false,
      change_payment_day: false,
      new_payment_day: currentPaymentDay,
    },
  });

  const changeRental = form.watch("change_rental");
  const changeEndDate = form.watch("change_end_date");
  const changePaymentDay = form.watch("change_payment_day");

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const onSubmit = async (data: AddendumFormData) => {
    setIsSubmitting(true);
    try {
      const changes: Addendum["changes"] = {};
      const contractUpdates: Record<string, any> = {};

      if (data.change_rental && data.new_rental_value !== undefined) {
        changes.rental_value = { from: currentRentalValue, to: data.new_rental_value };
        contractUpdates.rental_value = data.new_rental_value;
      }
      if (data.change_end_date && data.new_end_date) {
        const newEnd = format(data.new_end_date, "yyyy-MM-dd");
        changes.end_date = { from: currentEndDate, to: newEnd };
        contractUpdates.end_date = newEnd;
      }
      if (data.change_payment_day && data.new_payment_day !== undefined) {
        changes.payment_day = { from: currentPaymentDay, to: data.new_payment_day };
        contractUpdates.payment_day = data.new_payment_day;
      }

      const newAddendum: Addendum = {
        id: crypto.randomUUID(),
        date: format(new Date(), "yyyy-MM-dd"),
        reason: data.reason,
        changes,
        created_at: new Date().toISOString(),
      };

      const updatedAddendums = [...existingAddendums, newAddendum];

      const { error } = await supabase
        .from("contracts")
        .update({
          ...contractUpdates,
          addendums: updatedAddendums as any,
        })
        .eq("id", contractId);

      if (error) throw error;

      toast.success("Aditamento registrado com sucesso!");
      form.reset();
      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao registrar aditamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="h-5 w-5" />
            Aditamento de Contrato
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Novo Aditamento</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motivo do Aditamento</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Reajuste anual pelo IGPM..."
                            rows={3}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Change rental */}
                  <FormField
                    control={form.control}
                    name="change_rental"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel>Alterar valor do aluguel (atual: {formatCurrency(currentRentalValue)})</FormLabel>
                      </FormItem>
                    )}
                  />
                  {changeRental && (
                    <FormField
                      control={form.control}
                      name="new_rental_value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Novo Valor (R$)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Change end date */}
                  <FormField
                    control={form.control}
                    name="change_end_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel>
                          Alterar data de término
                          {currentEndDate && ` (atual: ${format(new Date(currentEndDate), "dd/MM/yyyy")})`}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  {changeEndDate && (
                    <FormField
                      control={form.control}
                      name="new_end_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Nova Data de Término</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? format(field.value, "dd/MM/yyyy") : "Selecione a data"}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                locale={ptBR}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {/* Change payment day */}
                  <FormField
                    control={form.control}
                    name="change_payment_day"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel>Alterar dia de vencimento (atual: dia {currentPaymentDay})</FormLabel>
                      </FormItem>
                    )}
                  />
                  {changePaymentDay && (
                    <FormField
                      control={form.control}
                      name="new_payment_day"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Novo Dia de Vencimento</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              max="31"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {!changeRental && !changeEndDate && !changePaymentDay && (
                    <p className="text-sm text-destructive">Selecione pelo menos uma alteração acima</p>
                  )}

                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting ? "Registrando..." : "Registrar Aditamento"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* History */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Histórico de Aditamentos</h3>
            {existingAddendums.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Nenhum aditamento registrado</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {[...existingAddendums].reverse().map((addendum) => (
                  <Card key={addendum.id}>
                    <CardContent className="pt-4 pb-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">
                          {format(new Date(addendum.date), "dd/MM/yyyy")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{addendum.reason}</p>
                      <div className="space-y-1 text-sm">
                        {addendum.changes.rental_value && (
                          <p>
                            <span className="font-medium">Aluguel:</span>{" "}
                            {formatCurrency(addendum.changes.rental_value.from)} →{" "}
                            <span className="text-primary font-medium">
                              {formatCurrency(addendum.changes.rental_value.to)}
                            </span>
                          </p>
                        )}
                        {addendum.changes.end_date && (
                          <p>
                            <span className="font-medium">Término:</span>{" "}
                            {addendum.changes.end_date.from
                              ? format(new Date(addendum.changes.end_date.from), "dd/MM/yyyy")
                              : "Sem data"}{" "}
                            →{" "}
                            <span className="text-primary font-medium">
                              {format(new Date(addendum.changes.end_date.to), "dd/MM/yyyy")}
                            </span>
                          </p>
                        )}
                        {addendum.changes.payment_day && (
                          <p>
                            <span className="font-medium">Vencimento:</span> dia{" "}
                            {addendum.changes.payment_day.from} → dia{" "}
                            <span className="text-primary font-medium">
                              {addendum.changes.payment_day.to}
                            </span>
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
