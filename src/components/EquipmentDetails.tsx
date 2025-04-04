import { useEffect, useState } from 'react';
import { useEquipment } from '../hooks/useEquipment';
import EquipmentHistory from './EquipmentHistory';

type ProductivityData = {
  currentDate: {
    percentage: number;
    operatingHours: number;
    totalHours: number;
  };
  totalPeriod: {
    percentage: number;
    operatingHours: number;
    totalHours: number;
  };
};

type EarningsData = {
  currentDate: number;
  totalPeriod: number;
  breakdown: {
    operating: number;
    stopped: number;
    maintenance: number;
  };
};

const EquipmentDetails = () => {
  const {
    selectedEquipmentId,
    closeEquipmentHistory,
    getEquipmentName,
    stateHistory,
    equipmentModels,
    equipmentStates,
    selectedDate,
    getEquipmentById,
  } = useEquipment();

  const [isVisible, setIsVisible] = useState(false);
  const [productivity, setProductivity] = useState<ProductivityData | null>(null);
  const [earnings, setEarnings] = useState<EarningsData | null>(null);

  // Efeito para controlar a visibilidade com delay
  useEffect(() => {
    if (selectedEquipmentId) {
      // Pequeno delay para permitir que a tabela desapareça primeiro
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [selectedEquipmentId]);

  // Calcular produtividade e ganhos
  useEffect(() => {
    if (!selectedEquipmentId) return;

    const equipment = getEquipmentById(selectedEquipmentId);
    if (!equipment) return;

    const model = equipmentModels.find(m => m.id === equipment.equipmentModelId);
    if (!model) return;

    const states = stateHistory[selectedEquipmentId] || [];
    if (states.length === 0) return;

    // Encontrar o ID do estado "Operando"
    const operatingStateId = equipmentStates.find(s => s.name === "Operando")?.id;
    if (!operatingStateId) return;

    // Ordenar estados por data
    const sortedStates = [...states].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calcular horas de operação até a data selecionada
    let operatingHoursCurrentDate = 0;
    let totalHoursCurrentDate = 0;
    
    // Calcular horas de operação para todo o período
    let operatingHoursTotal = 0;
    let totalHoursTotal = 0;

    // Para cálculo de ganhos
    let earningsCurrentDate = 0;
    let earningsTotal = 0;
    let operatingEarnings = 0;
    let stoppedEarnings = 0;
    let maintenanceEarnings = 0;

    // Mapeamento de estados para valores por hora
    const hourlyRates: Record<string, number> = {};
    model.hourlyEarnings.forEach(earning => {
      hourlyRates[earning.equipmentStateId] = earning.value;
    });

    // Processar cada estado
    for (let i = 0; i < sortedStates.length - 1; i++) {
      const currentState = sortedStates[i];
      const nextState = sortedStates[i + 1];
      
      const currentDate = new Date(currentState.date);
      const nextDate = new Date(nextState.date);
      
      // Calcular duração em horas
      const durationHours = (nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60);
      
      // Verificar se este período está dentro do intervalo até a data selecionada
      const isBeforeSelectedDate = nextDate <= selectedDate;
      
      // Acumular para todo o período
      totalHoursTotal += durationHours;
      
      if (currentState.equipmentStateId === operatingStateId) {
        operatingHoursTotal += durationHours;
      }
      
      // Acumular ganhos para todo o período
      const hourlyRate = hourlyRates[currentState.equipmentStateId] || 0;
      const stateEarnings = hourlyRate * durationHours;
      earningsTotal += stateEarnings;
      
      // Acumular ganhos por tipo de estado
      const stateName = equipmentStates.find(s => s.id === currentState.equipmentStateId)?.name;
      if (stateName === "Operando") {
        operatingEarnings += stateEarnings;
      } else if (stateName === "Parado") {
        stoppedEarnings += stateEarnings;
      } else if (stateName === "Manutenção") {
        maintenanceEarnings += stateEarnings;
      }
      
      // Se for antes da data selecionada, acumular para cálculos até a data atual
      if (isBeforeSelectedDate) {
        totalHoursCurrentDate += durationHours;
        
        if (currentState.equipmentStateId === operatingStateId) {
          operatingHoursCurrentDate += durationHours;
        }
        
        earningsCurrentDate += stateEarnings;
      }
    }
    
    // Calcular percentuais de produtividade
    const productivityCurrentDate = totalHoursCurrentDate > 0 
      ? (operatingHoursCurrentDate / totalHoursCurrentDate) * 100 
      : 0;
      
    const productivityTotal = totalHoursTotal > 0 
      ? (operatingHoursTotal / totalHoursTotal) * 100 
      : 0;
    
    // Atualizar estados
    setProductivity({
      currentDate: {
        percentage: productivityCurrentDate,
        operatingHours: operatingHoursCurrentDate,
        totalHours: totalHoursCurrentDate
      },
      totalPeriod: {
        percentage: productivityTotal,
        operatingHours: operatingHoursTotal,
        totalHours: totalHoursTotal
      }
    });
    
    setEarnings({
      currentDate: earningsCurrentDate,
      totalPeriod: earningsTotal,
      breakdown: {
        operating: operatingEarnings,
        stopped: stoppedEarnings,
        maintenance: maintenanceEarnings
      }
    });
    
  }, [selectedEquipmentId, equipmentModels, stateHistory, equipmentStates, selectedDate, getEquipmentById]);

  // Se nenhum equipamento selecionado, não renderizar
  if (!selectedEquipmentId) return null;

  // Aplicar classes para animação de fade
  const fadeClass = isVisible 
    ? "opacity-100 transition-opacity duration-300 ease-in" 
    : "opacity-0 transition-opacity duration-300 ease-out";

  // Formatar valor monetário
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar percentual
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm p-3 ${fadeClass}`}>
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-gray-800">
          {getEquipmentName(selectedEquipmentId)}
        </h2>
        <button 
          onClick={closeEquipmentHistory}
          className="p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Seção de Produtividade */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Produtividade</h3>
        
        {productivity && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Até a data atual:</p>
              <div className="flex items-end">
                <span className="text-2xl font-bold text-blue-600">
                  {formatPercentage(productivity.currentDate.percentage)}
                </span>
                <span className="text-xs text-gray-500 ml-2 mb-1">
                  ({productivity.currentDate.operatingHours.toFixed(1)}h / {productivity.currentDate.totalHours.toFixed(1)}h)
                </span>
              </div>
            </div>
            
            <div>
              <p className="text-xs text-gray-500 mb-1">Período total:</p>
              <div className="flex items-end">
                <span className="text-2xl font-bold text-indigo-600">
                  {formatPercentage(productivity.totalPeriod.percentage)}
                </span>
                <span className="text-xs text-gray-500 ml-2 mb-1">
                  ({productivity.totalPeriod.operatingHours.toFixed(1)}h / {productivity.totalPeriod.totalHours.toFixed(1)}h)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Seção de Ganhos */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Ganhos</h3>
        
        {earnings && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Até a data atual:</p>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(earnings.currentDate)}
                </span>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 mb-1">Período total:</p>
                <span className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(earnings.totalPeriod)}
                </span>
              </div>
            </div>
            
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Detalhamento:</p>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="p-2 bg-green-50 rounded border border-green-100">
                  <p className="text-xs text-gray-500">Operando</p>
                  <p className="font-medium text-green-600">{formatCurrency(earnings.breakdown.operating)}</p>
                </div>
                <div className="p-2 bg-yellow-50 rounded border border-yellow-100">
                  <p className="text-xs text-gray-500">Parado</p>
                  <p className="font-medium text-yellow-600">{formatCurrency(earnings.breakdown.stopped)}</p>
                </div>
                <div className="p-2 bg-red-50 rounded border border-red-100">
                  <p className="text-xs text-gray-500">Manutenção</p>
                  <p className="font-medium text-red-600">{formatCurrency(earnings.breakdown.maintenance)}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Histórico do Equipamento */}
      <EquipmentHistory />
    </div>
  );
};

export default EquipmentDetails;