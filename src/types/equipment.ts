export interface Equipment {
    id: number;
    equipmentModelId: number;
    name: string;
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