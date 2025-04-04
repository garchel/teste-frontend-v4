import { createContext, useState, useEffect, useMemo, useCallback } from "react"
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

    // Adiciona os Estados dos Filtros
    const [typeFilters, setTypeFilters] = useState<FilterOption[]>([
        { id: 'truck', label: 'Caminhão', active: false },
        { id: 'harvester', label: 'Colheitadeira', active: false },
        { id: 'garra', label: 'Garra', active: false },
    ])

    const [stateFilters, setStateFilters] = useState<FilterOption[]>([
        { id: 'operating', label: 'Operando', active: false },
        { id: 'stopped', label: 'Parado', active: false },
        { id: 'maintenance', label: 'Manutenção', active: false },
    ])

    // Adiciona estado para a data selecionada
    const [selectedDate, setSelectedDate] = useState<Date>(() => {
        // Por padrão, usar a data mais recente disponível nos dados ou a data atual
        return new Date('2021-02-28T23:59:59.999Z'); // Data final dos dados históricos
    });

    // Adiciona o estado para o equip selecionado para o Histórico
    const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null)


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
                        
                        // Create friendly name with consistent naming
                        let friendlyName = model.name;
                        
                        // Standardize model names in friendly names
                        if (model.name.toLowerCase().includes('caminhão')) {
                            friendlyName = 'Caminhão';
                        } else if (model.name.toLowerCase().includes('harvester')) {
                            friendlyName = 'Colheitadeira';
                        } else if (model.name.toLowerCase().includes('garra')) {
                            friendlyName = 'Garra';
                        }
                        
                        names[eq.id] = `${friendlyName} ${modelCounts[model.name]}`;
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

    // Função para atualizar a data selecionada
    const updateSelectedDate = (date: Date) => {
        setSelectedDate(date);
    }

    // Avançar a data por um intervalo específico (em horas)
    const advanceTime = (hours: number) => {
        const newDate = new Date(selectedDate);
        newDate.setHours(newDate.getHours() + hours);
        
        // Garantir que não ultrapasse os limites dos dados
        const maxDate = new Date('2021-02-28T23:59:59.999Z');
        const minDate = new Date('2021-02-01T00:00:00.000Z');
        
        if (newDate > maxDate) {
            setSelectedDate(maxDate);
        } else if (newDate < minDate) {
            setSelectedDate(minDate);
        } else {
            setSelectedDate(newDate);
        }
    }

    // Pular para momentos específicos
    const jumpToTime = (timePoint: 'start' | 'end' | 'specific', specificDate?: Date) => {
        if (timePoint === 'start') {
            setSelectedDate(new Date('2021-02-01T00:00:00.000Z'));
        } else if (timePoint === 'end') {
            setSelectedDate(new Date('2021-02-28T23:59:59.999Z'));
        } else if (timePoint === 'specific' && specificDate) {
            setSelectedDate(specificDate);
        }
    }

    // Get equipment type based on model name
    const getEquipmentType = (modelName: string): string => {
        const model = modelName.toLowerCase()
        if (model.includes('caminhão')) return 'truck'
        if (model.includes('harvester')) return 'harvester'
        if (model.includes('garra')) return 'garra'
        return 'truck' // Default
    }

    // Obter o estado do equipamento na data selecionada
    const getEquipmentStateAtDate = useCallback((equipmentId: string, date: Date): string | undefined => {
        const states = stateHistory[equipmentId] || [];
        if (states.length === 0) return undefined;
        
        // Encontrar o estado mais recente antes da data selecionada
        const timestamp = date.getTime();
        let closestState = undefined;
        let closestTime = -Infinity;
        
        for (const state of states) {
          const stateTime = new Date(state.date).getTime();
          if (stateTime <= timestamp && stateTime > closestTime) {
            closestTime = stateTime;
            closestState = state.equipmentStateId;
          }
        }
        
        return closestState;
      }, [stateHistory]);

    // Obter a posição do equipamento na data selecionada
    const getEquipmentPositionAtDate = useCallback((equipmentId: string, date: Date): [number, number] | null => {
        const positions = positionHistory[equipmentId] || [];
        if (positions.length === 0) return null;
        
        // Encontrar a posição mais recente antes da data selecionada
        const timestamp = date.getTime();
        let closestPosition: [number, number] | null = null;
        let closestTime = -Infinity;
        
        for (const position of positions) {
          const posTime = new Date(position.date).getTime();
          if (posTime <= timestamp && posTime > closestTime) {
            closestTime = posTime;
            closestPosition = [position.lat, position.lon];
          }
        }
        
        return closestPosition;
      }, [positionHistory]);

    // Filter equipment based on active filters and selected date
    const filteredEquipment = useMemo(() => {
        if (loading || error) return [];
        
        return equipment.filter(eq => {
          // Filtrar por tipo de equipamento
          const model = equipmentModels.find(m => m.id === eq.equipmentModelId);
          if (!model) return false;
          
          const equipmentType = getEquipmentType(model.name);
          const typeFilterActive = typeFilters.some(f => f.active);
          
          // Se há filtros de tipo ativos, verificar se este equipamento corresponde
          if (typeFilterActive) {
            const matchesTypeFilter = typeFilters.some(
              filter => filter.active && filter.id === equipmentType
            );
            if (!matchesTypeFilter) return false;
          }
          
          // Filtrar por estado do equipamento na data selecionada
          const stateAtDate = getEquipmentStateAtDate(eq.id, selectedDate);
          if (!stateAtDate) return false; // Se não tiver estado na data, não mostrar
          
          const stateFilterActive = stateFilters.some(f => f.active);
          
          // Se há filtros de estado ativos, verificar se este equipamento corresponde
          if (stateFilterActive) {
            const stateInfo = equipmentStates.find(s => s.id === stateAtDate);
            if (!stateInfo) return false;
            
            let stateType = '';
            if (stateInfo.name === 'Operando') stateType = 'operating';
            else if (stateInfo.name === 'Parado') stateType = 'stopped';
            else if (stateInfo.name === 'Manutenção') stateType = 'maintenance';
            
            const matchesStateFilter = stateFilters.some(
              filter => filter.active && filter.id === stateType
            );
            if (!matchesStateFilter) return false;
          }
          
          // Verificar se tem posição na data selecionada
          const hasPositionAtDate = getEquipmentPositionAtDate(eq.id, selectedDate) !== null;
          return hasPositionAtDate;
        });
      }, [equipment, equipmentModels, typeFilters, stateFilters, selectedDate, loading, error]);

      // Função para abrir o histórico de um equip especifico
      const openEquipmentHistory = (equipmentId: string) => {
        setSelectedEquipmentId(equipmentId)
      }

      // Função para fechar o histórico de equipamentos
      const closeEquipmentHistory = () => {
        setSelectedEquipmentId(null)
      }

      const getEquipmentById = useCallback((equipmentId: string): Equipment | undefined => {
        return equipment.find(eq => eq.id === equipmentId);
      }, [equipment]);

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
                // Propriedades relacionadas aos Filtros
                typeFilters,
                stateFilters,
                toggleTypeFilter,
                toggleStateFilter,
                filteredEquipment,
                // Propriedades relacionadas às datas
                selectedDate,
                updateSelectedDate,
                getEquipmentStateAtDate,
                getEquipmentPositionAtDate,
                advanceTime,
                jumpToTime,
                // Propriedades relacionadas ao histórico
                selectedEquipmentId,
                openEquipmentHistory,
                closeEquipmentHistory,

                getEquipmentById,


                loading, 
                error 
            }}
        >
            {children}
        </EquipmentContext.Provider>
    )
}

export { EquipmentContext } // Exportação separada para evitar conflitos com Fast Refresh