export interface Equipment {
    id: string;
    name: string;
    equipmentModelId: string;
}

export interface EquipmentModel {
    id: string;
    name: string;
    hourlyEarnings: {
        equipmentStateId: string;
        value: number;
    }[];
}

export interface EquipmentState {
    id: string;
    name: string;
    color: string;
}

export interface StateHistory {
    date: string;
    equipmentStateId: string;
}

export interface Position {
    date: string;
    lat: number;
    lon: number;
}

export interface EquipmentContextType {
    equipment: Equipment[];
    equipmentModels: EquipmentModel[];
    equipmentStates: EquipmentState[];
    stateHistory: StateHistoryRecord;
    positionHistory: PositionHistoryRecord;
    equipmentNames: Record<string, string>;
    getEquipmentName: (equipmentId: string) => string;
    loading: boolean;
    error: string | null;
}

export interface StateHistoryEntry {
    date: string;
    equipmentStateId: string;
}

export interface PositionHistoryEntry {
    date: string;
    lat: number;
    lon: number;
}

export interface StateHistoryRecord {
    [equipmentId: string]: StateHistoryEntry[];
}

export interface PositionHistoryRecord {
    [equipmentId: string]: PositionHistoryEntry[];
}

export interface StateHistoryItem {
    date: string;
    equipmentStateId: string;
}

export interface PositionHistoryItem {
    date: string;
    lat: number;
    lon: number;
}

export interface HistoryData {
    equipmentId: string;
    states: StateHistoryItem[];
}

export interface PositionData {
    equipmentId: string;
    positions: PositionHistoryItem[];
}