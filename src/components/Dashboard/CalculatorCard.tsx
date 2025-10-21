import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalculatorCardProps {
  icon: LucideIcon;
  title: string;
  onClick?: () => void;
}

export const CalculatorCard = ({ icon: Icon, title, onClick }: CalculatorCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="flex flex-col items-center justify-center p-6 space-y-3">
        <div className="rounded-lg bg-blue-50 p-4">
          <Icon className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-sm font-medium text-center text-gray-700">{title}</h3>
      </CardContent>
    </Card>
  );
};
