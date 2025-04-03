import { createContext, useState, useEffect, useMemo } from "react"
import { 
    Equipment, 
    EquipmentModel, 
    EquipmentState, 
    EquipmentContextType,
    HistoryData,
    PositionData,
    StateHistoryItem,
    PositionHistoryItem,
    FilterOption
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

    // Add filter states
    const [typeFilters, setTypeFilters] = useState<FilterOption[]>([
        { id: 'truck', label: 'Caminhão', active: false },
        { id: 'tractor', label: 'Trator', active: false },
        { id: 'excavator', label: 'Escavadeira', active: false },
    ])

    const [stateFilters, setStateFilters] = useState<FilterOption[]>([
        { id: 'operating', label: 'Operando', active: false },
        { id: 'stopped', label: 'Parado', active: false },
        { id: 'maintenance', label: 'Manutenção', active: false },
    ])

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

    // Toggle type filter
    const toggleTypeFilter = (id: string) => {
        setTypeFilters(prev => 
            prev.map(filter => filter.id === id ? { ...filter, active: !filter.active } : filter)
        )
    }

    // Toggle state filter
    const toggleStateFilter = (id: string) => {
        setStateFilters(prev => 
            prev.map(filter => filter.id === id ? { ...filter, active: !filter.active } : filter)
        )
    }

    // Get equipment type based on model name
    const getEquipmentType = (modelName: string): string => {
        const model = modelName.toLowerCase()
        if (model.includes('caminhão')) return 'truck'
        if (model.includes('harvester')) return 'tractor'
        if (model.includes('garra')) return 'excavator'
        return 'truck' // Default
    }

    // Get equipment state category
    const getEquipmentStateCategory = (stateId?: string): string => {
        if (!stateId) return 'unknown'
        
        const stateInfo = equipmentStates.find(state => state.id === stateId)
        if (!stateInfo) return 'unknown'
        
        if (stateInfo.name === 'Operando') return 'operating'
        if (stateInfo.name === 'Parado') return 'stopped'
        if (stateInfo.name === 'Manutenção') return 'maintenance'
        
        return 'unknown'
    }

    // Get current state ID for an equipment
    const getCurrentStateId = (equipmentId: string): string | undefined => {
        const states = stateHistory[equipmentId] || []
        if (states.length === 0) return undefined
        return states[states.length - 1].equipmentStateId
    }

    // Filter equipment based on active filters
    const filteredEquipment = useMemo(() => {
        // If no filters are active, return all equipment
        const activeTypeFilters = typeFilters.filter(f => f.active)
        const activeStateFilters = stateFilters.filter(f => f.active)
        
        if (activeTypeFilters.length === 0 && activeStateFilters.length === 0) {
            return equipment
        }
        
        return equipment.filter(eq => {
            // Check type filter
            if (activeTypeFilters.length > 0) {
                const model = equipmentModels.find(m => m.id === eq.equipmentModelId)
                if (!model) return false
                
                const equipmentType = getEquipmentType(model.name)
                const matchesType = activeTypeFilters.some(f => f.id === equipmentType)
                
                if (!matchesType) return false
            }
            
            // Check state filter
            if (activeStateFilters.length > 0) {
                const currentStateId = getCurrentStateId(eq.id)
                const stateCategory = getEquipmentStateCategory(currentStateId)
                const matchesState = activeStateFilters.some(f => f.id === stateCategory)
                
                if (!matchesState) return false
            }
            
            return true
        })
    }, [equipment, equipmentModels, stateHistory, typeFilters, stateFilters])

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
                // Add filter-related values
                typeFilters,
                stateFilters,
                toggleTypeFilter,
                toggleStateFilter,
                filteredEquipment,
                loading, 
                error 
            }}
        >
            {children}
        </EquipmentContext.Provider>
    )
}

export { EquipmentContext } // Exportação separada para evitar conflitos com Fast Refresh