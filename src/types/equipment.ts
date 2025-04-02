export interface Equipment {
  id: number;
  name: string;
  equipmentModelId: number;
  currentState: 'operating' | 'stopped' | 'maintenance';
  lastUpdate: string;
  position: {
    lat: number;
    lon: number;
  };
}

export interface EquipmentContextType {
  equipment: Equipment[];
  loading: boolean;
  error: string | null;
}

export interface EquipmentModel {
    id: number;
    name: string;
    hourlyEarnings: number;
    manufacturingYear: number;
}

export interface EquipmentPosition {
    id: number;
    equipmentId: number;
    date: string;
    lat: number;
    long: number;
}

export interface EquipmentState {
    id: number;
    equipmentId: number;
    equipmentStateId: number;
    date: string;
}