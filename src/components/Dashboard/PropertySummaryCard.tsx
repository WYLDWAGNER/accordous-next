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
                stroke="#e5e7eb"
                strokeWidth="20"
              />
              
              {/* Contracted segment (blue) */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="20"
                strokeDasharray={`${(contractedPercentage / 100) * 440} 440`}
                strokeDashoffset="0"
              />
              
              {/* Available segment (cyan) */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="20"
                strokeDasharray={`${(availablePercentage / 100) * 440} 440`}
                strokeDashoffset={`${-(contractedPercentage / 100) * 440}`}
              />
              
              {/* Unavailable segment (orange) */}
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#f97316"
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
              <div className="h-3 w-3 rounded-full bg-orange-500" />
              <span className="text-sm text-gray-600">Indisponíveis</span>
            </div>
            <span className="text-lg font-bold text-orange-500">{unavailable}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-blue-500" />
              <span className="text-sm text-gray-600">Contratados</span>
            </div>
            <span className="text-lg font-bold text-blue-500">{contracted}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-cyan-500" />
              <span className="text-sm text-gray-600">Disponíveis</span>
            </div>
            <span className="text-lg font-bold text-cyan-500">{available}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
