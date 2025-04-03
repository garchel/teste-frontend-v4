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

const EquipmentContext = createContext<EquipmentContextType | null>(null)

// Função que carrega todos os dados e os armazena
// criando o contexto para a aplicação acessar os dados
export function EquipmentProvider({ children }: { children: React.ReactNode }) {
    const [equipment, setEquipment] = useState<Equipment[]>([])
    const [equipmentModels, setEquipmentModels] = useState<EquipmentModel[]>([])
    const [equipmentStates, setEquipmentStates] = useState<EquipmentState[]>([])
    const [stateHistory, setStateHistory] = useState<Record<string, StateHistoryItem[]>>({})
    const [positionHistory, setPositionHistory] = useState<Record<string, PositionHistoryItem[]>>({})
    const [equipmentNames, setEquipmentNames] = useState<Record<string, string>>({})
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
                
                // Generate friendly names for equipment
                const names: Record<string, string> = {}
                const modelCounts: Record<string, number> = {}
                
                equipmentData.forEach((eq: Equipment) => {
                    const model = modelsData.find((m: EquipmentModel) => m.id === eq.equipmentModelId)
                    if (model) {
                        // Initialize counter for this model if not exists
                        if (!modelCounts[model.name]) {
                            modelCounts[model.name] = 0
                        }
                        
                        // Increment counter
                        modelCounts[model.name]++
                        
                        // Create friendly name like "Trator 1", "Escavadora 2", etc.
                        names[eq.id] = `${model.name} ${modelCounts[model.name]}`
                    }
                })
                
                setEquipmentNames(names)
                
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

    // Helper function to get friendly name
    const getEquipmentName = (equipmentId: string) => {
        return equipmentNames[equipmentId] || 'Equipamento Desconhecido'
    }

    return (
        <EquipmentContext.Provider 
            value={{ 
                equipment, 
                equipmentModels, 
                equipmentStates, 
                stateHistory, 
                positionHistory,
                equipmentNames,
                getEquipmentName, 
                loading, 
                error 
            }}
        >
            {children}
        </EquipmentContext.Provider>
    )
}

export { EquipmentContext } // Exportação separada para evitar conflitos com Fast Refresh