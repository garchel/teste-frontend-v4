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
    closeEquipmentHistory,
    getEquipmentName,
    stateHistory,
    positionHistory,
    equipmentStates,
    jumpToTime,
  } = useEquipment();

  const [groupedHistory, setGroupedHistory] = useState<GroupedHistory[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // Add effect to handle visibility with delay
  useEffect(() => {
    if (selectedEquipmentId) {
      // Small delay to allow table to fade out first
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [selectedEquipmentId]);

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
        const currentDiff = Math.abs(currentDate.getTime() - stateDate.getTime());
        const nearestDiff = nearest ? Math.abs(new Date(nearest.date).getTime() - stateDate.getTime()) : Infinity;
        
        return currentDiff < nearestDiff ? current : nearest;
      }, null as any);
      
      allEntries.push({
        date: stateDate,
        state: state.equipmentStateId,
        stateName: getStateName(state.equipmentStateId),
        position: nearestPosition ? [nearestPosition.lat, nearestPosition.lon] : null,
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
    const groupedArray = Object.entries(grouped).map(([date, entries]) => ({
      date,
      entries,
    }));

    setGroupedHistory(groupedArray);
  }, [selectedEquipmentId, stateHistory, positionHistory, equipmentStates]);

  // If no equipment selected, still render but with opacity 0
  if (!selectedEquipmentId) return null;

  // Apply fade animation classes
  const fadeClass = isVisible 
    ? "opacity-100 transition-opacity duration-300 ease-in" 
    : "opacity-0 transition-opacity duration-300 ease-out";

  return (
    <div className={`bg-white rounded-lg shadow-sm p-3 absolute top-0 left-0 right-0 z-10 ${fadeClass}`}>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-medium text-gray-600">
          Histórico: <span className="text-gray-800">{getEquipmentName(selectedEquipmentId)}</span>
        </h2>
        <button 
          onClick={closeEquipmentHistory}
          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {groupedHistory.length === 0 ? (
        <div className="text-center py-6 text-gray-500 text-sm">
          Nenhum histórico disponível para este equipamento.
        </div>
      ) : (
        <div className="overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="flex space-x-4 min-w-max">
            {groupedHistory.map(group => (
              <div key={group.date} className="w-[130px] bg-gradient-to-r from-gray-50 to-gray-100 rounded-md p-2 border border-gray-200 flex-shrink-0">
                <h3 className="text-sm font-medium text-gray-700 mb-2 pb-1 border-b border-gray-200">
                  {group.date}
                </h3>
                
                <div className="space-y-2">
                  {group.entries.map((entry, index) => (
                    <div 
                      key={index} 
                      className="bg-white p-2 rounded-md border-l-3 hover:shadow-sm transition-shadow cursor-pointer"
                      style={{ 
                        borderColor: entry.stateName === 'Operando' ? '#10B981' : 
                                    entry.stateName === 'Parado' ? '#F59E0B' : '#EF4444',
                        borderLeftWidth: '3px'
                      }}
                      onClick={() => {
                        jumpToTime('specific', entry.date);
                      }}
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-1.5 flex-shrink-0" 
                          style={{ 
                            backgroundColor: entry.stateName === 'Operando' ? '#10B981' : 
                                          entry.stateName === 'Parado' ? '#F59E0B' : '#EF4444'
                          }}
                        />
                        <p className="text-xs text-gray-500 font-medium whitespace-nowrap">{formatDate(entry.date)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentHistory;