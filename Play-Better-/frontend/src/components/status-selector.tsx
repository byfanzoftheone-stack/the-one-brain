import { GlassmorphicCard } from "@/components/ui/glassmorphic-card";
import { Player } from "@/types/game";

interface StatusSelectorProps {
  status: Player['status'];
  onStatusChange: (status: Player['status']) => void;
}

export function StatusSelector({ status, onStatusChange }: StatusSelectorProps) {
  const statusOptions: { value: Player['status']; label: string; color: string }[] = [
    { value: 'available', label: 'Available', color: 'bg-green-500' },
    { value: 'busy', label: 'Busy', color: 'bg-yellow-500' },
    { value: 'offline', label: 'Offline', color: 'bg-gray-500' },
  ];

  return (
    <GlassmorphicCard>
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
          <i className="fas fa-signal text-white"></i>
        </div>
        <div>
          <h3 className="font-space font-bold text-lg">Your Status</h3>
          <p className="text-gray-400 text-sm">Set your availability</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {statusOptions.map((option) => (
          <label key={option.value} className="flex items-center space-x-3 cursor-pointer group">
            <input
              type="radio"
              name="status"
              value={option.value}
              checked={status === option.value}
              onChange={() => onStatusChange(option.value)}
              className="sr-only"
              data-testid={`status-${option.value}`}
            />
            <div className={`w-4 h-4 ${option.color} rounded-full group-hover:scale-110 transition-transform`}></div>
            <span className={`font-medium ${
              status === option.value 
                ? option.value === 'available' 
                  ? 'text-green-400' 
                  : option.value === 'busy'
                  ? 'text-yellow-400'
                  : 'text-gray-400'
                : 'text-gray-400'
            }`}>
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </GlassmorphicCard>
  );
}
