import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PropertySummaryCardProps {
  unavailable: number;
  contracted: number;
  available: number;
}

export const PropertySummaryCard = ({ unavailable, contracted, available }: PropertySummaryCardProps) => {
  const total = unavailable + contracted + available;
  const contractedPercentage = (contracted / total) * 100;
  const availablePercentage = (available / total) * 100;
  const unavailablePercentage = (unavailable / total) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Total de Imóveis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center">
          <div className="relative h-40 w-40">
            <svg className="h-40 w-40 -rotate-90" viewBox="0 0 160 160">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="20"
              />
              
              {/* Contracted segment (info) */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="hsl(var(--info))"
                strokeWidth="20"
                strokeDasharray={`${(contractedPercentage / 100) * 440} 440`}
                strokeDashoffset="0"
              />
              
              {/* Available segment (success) */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="hsl(var(--success))"
                strokeWidth="20"
                strokeDasharray={`${(availablePercentage / 100) * 440} 440`}
                strokeDashoffset={`${-(contractedPercentage / 100) * 440}`}
              />
              
              {/* Unavailable segment (warning) */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="hsl(var(--warning))"
                strokeWidth="20"
                strokeDasharray={`${(unavailablePercentage / 100) * 440} 440`}
                strokeDashoffset={`${-((contractedPercentage + availablePercentage) / 100) * 440}`}
              />
            </svg>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-warning" />
              <span className="text-sm text-muted-foreground">Indisponíveis</span>
            </div>
            <span className="text-lg font-bold text-warning">{unavailable}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-info" />
              <span className="text-sm text-muted-foreground">Contratados</span>
            </div>
            <span className="text-lg font-bold text-info">{contracted}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-success" />
              <span className="text-sm text-muted-foreground">Disponíveis</span>
            </div>
            <span className="text-lg font-bold text-success">{available}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
