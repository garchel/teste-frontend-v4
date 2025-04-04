import { useEffect, useState } from 'react';
import { useEquipment } from '../hooks/useEquipment';

type HistoryEntry = {
  date: Date;
  state: string;
  stateName: string;
  position: [number, number] | null;
};

type GroupedHistory = {
  date: string; // Data formatada (dia/mês)
  entries: HistoryEntry[];
};

const EquipmentHistory = () => {
  const {
    selectedEquipmentId,
    stateHistory,
    positionHistory,
    equipmentStates,
    jumpToTime,
  } = useEquipment();

  const [groupedHistory, setGroupedHistory] = useState<GroupedHistory[]>([]);

  // Formatar data para exibição
  const formatDate = (date: Date, format: 'full' | 'day' = 'full'): string => {
    if (format === 'day') {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    }
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Obter nome do estado a partir do ID
  const getStateName = (stateId: string): string => {
    const state = equipmentStates.find(s => s.id === stateId);
    return state ? state.name : 'Desconhecido';
  };

  // Processar histórico do equipamento
  useEffect(() => {
    if (!selectedEquipmentId) return;

    // Obter histórico de estados
    const states = stateHistory[selectedEquipmentId] || [];
    const positions = positionHistory[selectedEquipmentId] || [];

    // Combinar estados e posições
    const allEntries: HistoryEntry[] = [];

    // Adicionar estados
    states.forEach(state => {
      const stateDate = new Date(state.date);
      
      // Encontrar posição mais próxima
      const nearestPosition = positions.reduce((nearest, current) => {
        const currentDate = new Date(current.date);
        const nearestDate = nearest ? new Date(nearest.date) : null;
        
        if (!nearestDate) return current;
        
        const currentDiff = Math.abs(currentDate.getTime() - stateDate.getTime());
        const nearestDiff = Math.abs(nearestDate.getTime() - stateDate.getTime());
        
        return currentDiff < nearestDiff ? current : nearest;
      }, null as any);
      
      allEntries.push({
        date: stateDate,
        state: state.equipmentStateId,
        stateName: getStateName(state.equipmentStateId),
        position: nearestPosition ? [nearestPosition.lat, nearestPosition.lon] : null
      });
    });
    
    // Ordenar por data (mais recente primeiro)
    allEntries.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    // Agrupar por dia
    const grouped: Record<string, HistoryEntry[]> = {};
    
    allEntries.forEach(entry => {
      const dayKey = formatDate(entry.date, 'day');
      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey].push(entry);
    });
    
    // Converter para array
    const groupedArray: GroupedHistory[] = Object.keys(grouped).map(date => ({
      date,
      entries: grouped[date]
    }));
    
    setGroupedHistory(groupedArray);
  }, [selectedEquipmentId, stateHistory, positionHistory, equipmentStates]);

  if (!selectedEquipmentId) return null;

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-2">Histórico de Estados</h3>
      
      <div className="overflow-y-auto max-h-[300px] pr-1">
        {groupedHistory.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-3">
            <h4 className="text-xs font-medium text-gray-500 mb-1 sticky top-0 bg-white py-1">
              {group.date}
            </h4>
            
            <div className="space-y-2">
              {group.entries.map((entry, entryIndex) => {
                // Determinar cor do estado
                let stateColor = 'bg-gray-100';
                let textColor = 'text-gray-700';
                
                if (entry.stateName === 'Operando') {
                  stateColor = 'bg-green-100';
                  textColor = 'text-green-700';
                } else if (entry.stateName === 'Parado') {
                  stateColor = 'bg-yellow-100';
                  textColor = 'text-yellow-700';
                } else if (entry.stateName === 'Manutenção') {
                  stateColor = 'bg-red-100';
                  textColor = 'text-red-700';
                }
                
                return (
                  <div 
                    key={entryIndex} 
                    className={`p-2 rounded-md ${stateColor} cursor-pointer hover:opacity-90 transition-opacity`}
                    onClick={() => jumpToTime(entry.date)}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-medium ${textColor}`}>
                        {entry.stateName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(entry.date)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EquipmentHistory;