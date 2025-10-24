import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";

const userSchema = z.object({
  full_name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  email: z.string().email("E-mail inválido").max(255),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(100).optional(),
  role: z.enum(["admin", "full", "agenda", "cadastro_leads", "financeiro", "moderator", "user"]),
  is_active: z.boolean(),
});

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: any;
  onSuccess: () => void;
}

const UserFormDialog = ({ open, onOpenChange, user, onSuccess }: UserFormDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "user" as const,
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        password: "",
        role: user.role || "user",
        is_active: user.is_active ?? true,
      });
    } else {
      setFormData({
        full_name: "",
        email: "",
        password: "",
        role: "user",
        is_active: true,
      });
    }
    setErrors({});
  }, [user, open]);

  const validateForm = () => {
    try {
      const validationSchema = user
        ? userSchema.omit({ password: true }).extend({
            password: z.string().max(100).optional(),
          })
        : userSchema;

      validationSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (user) {
        // Update existing user
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            full_name: formData.full_name.trim(),
            is_active: formData.is_active,
          })
          .eq("id", user.id);

        if (profileError) throw profileError;

        // Update role
        const { error: roleDeleteError } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", user.id);

        if (roleDeleteError) throw roleDeleteError;

        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: user.id, role: formData.role } as any);

        if (roleError) throw roleError;

        // Update password if provided
        if (formData.password) {
          const { error: passwordError } = await supabase.auth.admin.updateUserById(user.id, {
            password: formData.password,
          });

          if (passwordError) throw passwordError;
        }

        toast({
          title: "Usuário atualizado",
          description: "As informações do usuário foram atualizadas com sucesso.",
        });
      } else {
        // Create new user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: formData.email.trim(),
          password: formData.password,
          email_confirm: true,
          user_metadata: {
            full_name: formData.full_name.trim(),
          },
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Falha ao criar usuário");

        // Create profile
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          full_name: formData.full_name.trim(),
          is_active: formData.is_active,
        });

        if (profileError) throw profileError;

        // Assign role
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({ user_id: authData.user.id, role: formData.role } as any);

        if (roleError) throw roleError;

        toast({
          title: "Usuário criado",
          description: "O novo usuário foi criado com sucesso.",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error saving user:", error);
      
      let errorMessage = "Não foi possível salvar o usuário.";
      
      if (error.message?.includes("duplicate key") || error.message?.includes("already exists")) {
        errorMessage = "Este e-mail já está cadastrado.";
      }

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuário" : "Adicionar Novo Usuário"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Atualize as informações do usuário abaixo."
              : "Preencha os dados para criar um novo usuário."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Nome Completo *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Digite o nome completo"
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="usuario@exemplo.com"
              disabled={!!user}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            {user && (
              <p className="text-xs text-muted-foreground">
                O e-mail não pode ser alterado após a criação
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Senha {user ? "(deixe em branco para não alterar)" : "*"}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={user ? "Nova senha" : "Mínimo 6 caracteres"}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Nível de Acesso *</Label>
            <Select
              value={formData.role}
              onValueChange={(value: any) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="full">Full</SelectItem>
                <SelectItem value="agenda">Agenda</SelectItem>
                <SelectItem value="cadastro_leads">Cadastro/Gestão de Leads</SelectItem>
                <SelectItem value="financeiro">Financeiro</SelectItem>
                <SelectItem value="moderator">Moderador</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Status</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {formData.is_active ? "Ativo" : "Inativo"}
              </span>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : user ? "Atualizar" : "Criar Usuário"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;