import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  Receipt,
  BarChart3,
  CreditCard,
  Settings,
  UserCircle,
  ChevronDown,
  HelpCircle,
  LogOut,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  {
    icon: Building2,
    label: "Imóveis",
    submenu: [
      { label: "Listar imóveis", path: "/imoveis" },
      { label: "Listar anúncios", path: "/anuncios" },
      { label: "Cadastrar imóveis", path: "/imoveis/novo" },
    ],
  },
  { icon: FileText, label: "Documentos", path: "/documentos" },
  { icon: Calendar, label: "Visitas Agendadas", path: "/visitas" },
  { icon: Users, label: "CRM", path: "/crm" },
  { icon: Receipt, label: "Faturas", path: "/faturas" },
  { icon: BarChart3, label: "Relatórios", path: "/relatorios" },
  { icon: CreditCard, label: "Remessa Bancária", path: "/remessa" },
  { icon: Settings, label: "Configurações", path: "/configuracoes" },
  { icon: UserCircle, label: "Usuários", path: "/usuarios" },
];

export const Sidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const [openMenus, setOpenMenus] = useState<string[]>(["Imóveis"]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Building2 className="h-6 w-6 text-primary" />
        <span className="ml-2 text-lg font-semibold">Accordous</span>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            if (item.submenu) {
              const isOpen = openMenus.includes(item.label);
              return (
                <Collapsible key={item.label} open={isOpen} onOpenChange={() => toggleMenu(item.label)}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start font-normal",
                        "hover:bg-accent"
                      )}
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      <span className="flex-1 text-left">{item.label}</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isOpen && "rotate-180"
                        )}
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 pl-9 pt-1">
                    {item.submenu.map((subItem) => (
                      <Link key={subItem.path} to={subItem.path}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start font-normal text-sm",
                            location.pathname === subItem.path && "bg-accent"
                          )}
                        >
                          {subItem.label}
                        </Button>
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              );
            }

            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start font-normal",
                    isActive && "bg-accent"
                  )}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="border-t p-3">
        <Button
          variant="ghost"
          className="w-full justify-center mb-2"
          size="sm"
        >
          <HelpCircle className="mr-2 h-4 w-4" />
          Ajuda?
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={signOut}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
};
