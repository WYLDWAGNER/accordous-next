import { Bell, HelpCircle, User, Sun, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface HeaderProps {
  title: string;
}

export const Header = ({ title }: HeaderProps) => {
  return (
    <div className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <h1 className="text-xl md:text-2xl font-bold">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2 md:gap-3">
        <Select defaultValue="30">
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="365">Último ano</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="ghost" size="icon" className="relative">
          <HelpCircle className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-blue-500 text-[10px] font-medium text-white flex items-center justify-center">
            2
          </span>
        </Button>

        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon">
          <Sun className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
