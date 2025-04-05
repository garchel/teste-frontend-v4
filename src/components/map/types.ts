export type EquipmentPosition = [number, number] | null;
export type EquipmentState = { equipmentStateId?: string };

export interface EquipmentDataItem {
  id: string;
  model: string;
  position: EquipmentPosition;
  state: EquipmentState;
}

export type StateColor = 'green' | 'yellow' | 'red';
export type EquipmentType = 'truck' | 'excavator' | 'tractor';

export interface IconMap {
  [key: string]: {
    [key in StateColor]: string;
  };
}