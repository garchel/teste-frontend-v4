import { createContext, useState, useEffect } from "react"
import { 
    Equipment, 
    EquipmentModel, 
    EquipmentState, 
    EquipmentContextType,
    HistoryData,
    PositionData,
    StateHistoryItem,
    PositionHistoryItem
} from "../types/equipment"

export const EquipmentContext = createContext<EquipmentContextType | null>(null)

export function EquipmentProvider({ children }: { children: React.ReactNode }) {
    const [equipment, setEquipment] = useState<Equipment[]>([])
    const [equipmentModels, setEquipmentModels] = useState<EquipmentModel[]>([])
    const [equipmentStates, setEquipmentStates] = useState<EquipmentState[]>([])
    const [stateHistory, setStateHistory] = useState<Record<string, StateHistoryItem[]>>({})
    const [positionHistory, setPositionHistory] = useState<Record<string, PositionHistoryItem[]>>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadAllData = async () => {
            try {
                const [
                    equipmentData,
                    modelsData,
                    statesData,
                    stateHistoryData,
                    positionHistoryData
                ] = await Promise.all([
                    fetch('/data/equipment.json').then(res => res.json()),
                    fetch('/data/equipmentModel.json').then(res => res.json()),
                    fetch('/data/equipmentState.json').then(res => res.json()),
                    fetch('/data/equipmentStateHistory.json').then(res => res.json()),
                    fetch('/data/equipmentPositionHistory.json').then(res => res.json())
                ])

                setEquipment(equipmentData)
                setEquipmentModels(modelsData)
                setEquipmentStates(statesData)
                
                const stateHistoryRecord = (stateHistoryData as HistoryData[]).reduce((acc, item) => {
                    acc[item.equipmentId] = item.states
                    return acc
                }, {} as Record<string, StateHistoryItem[]>)
                setStateHistory(stateHistoryRecord)

                const positionHistoryRecord = (positionHistoryData as PositionData[]).reduce((acc, item) => {
                    acc[item.equipmentId] = item.positions
                    return acc
                }, {} as Record<string, PositionHistoryItem[]>)
                setPositionHistory(positionHistoryRecord)

            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to load equipment data'
                setError(errorMessage)
            } finally {
                setLoading(false)
            }
        }

        loadAllData()
    }, [])

    return (
        <EquipmentContext.Provider 
            value={{ 
                equipment, 
                equipmentModels, 
                equipmentStates, 
                stateHistory, 
                positionHistory, 
                loading, 
                error 
            }}
        >
            {children}
        </EquipmentContext.Provider>
    )
}
