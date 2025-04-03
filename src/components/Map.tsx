import { MapContainer, Marker, TileLayer, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEquipment } from '../hooks/useEquipment';
import { useEffect, useState, useMemo } from 'react';  

// Import equipment icons
import truckIconGreen from '../assets/icons/truck-green.png';
import truckIconYellow from '../assets/icons/truck-yellow.png';
import truckIconRed from '../assets/icons/truck-red.png';
import excavatorIconGreen from '../assets/icons/excavator-green.png';
import excavatorIconYellow from '../assets/icons/excavator-yellow.png';
import excavatorIconRed from '../assets/icons/excavator-red.png';
import tractorIconGreen from '../assets/icons/tractor-green.png';
import tractorIconYellow from '../assets/icons/tractor-yellow.png';
import tractorIconRed from '../assets/icons/tractor-red.png';

// Import equipment states
import equipmentStates from '../../data/equipmentState.json';

const Map = () => {
  const {
    filteredEquipment,
    equipmentModels,
    positionHistory,
    stateHistory,
    getEquipmentName,
    selectedDate,
    advanceTime,
    jumpToTime,
    getEquipmentStateAtDate,
    getEquipmentPositionAtDate,
    loading,
    error
  } = useEquipment();
  
  // Use state to store processed equipment data
  const [equipmentData, setEquipmentData] = useState<any[]>([]);

  // Formata a data para exibição
  const formatDate = (date: Date): string => {
    return date.toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Process equipment data once when loaded
  useEffect(() => {
    // Sempre atualize os dados, mesmo quando filteredEquipment estiver vazio
    if (!loading && !error) {
      const processedData = filteredEquipment.map(eq => {
        // Get equipment info
        const equipmentData = filteredEquipment.find(e => e.id === eq.id);
        const model = equipmentModels.find(m => m.id === equipmentData?.equipmentModelId);
        
        // Get latest position
        const positions = positionHistory[eq.id] || [];
        let position = null;
        
        if (positions.length > 0) {
          const sortedPositions = [...positions].sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          
          position = [sortedPositions[0].lat, sortedPositions[0].lon];
        }
        
        // Get latest state
        const states = stateHistory[eq.id] || [];
        const latestState = states.length > 0 ? states[states.length - 1] : null;
        
        return {
          id: eq.id,
          model: model?.name || 'unknown',
          position,
          state: latestState
        };
      }).filter(item => item.position !== null);
      
      setEquipmentData(processedData);
    }
  }, [loading, filteredEquipment, equipmentModels, positionHistory, stateHistory]);

  // Create icon based on model and state
  const getIcon = (modelName: string, stateId?: string) => {
    // Get state color
    let stateColor = 'green'; // Default to green
    
    if (stateId) {
      const stateInfo = equipmentStates.find(state => state.id === stateId);
      if (stateInfo) {
        if (stateInfo.name === 'Parado') {
          stateColor = 'yellow';
        } else if (stateInfo.name === 'Manutenção') {
          stateColor = 'red';
        }
      }
    }
    
    // Determine equipment type
    const model = modelName.toLowerCase();
    let equipmentType = 'truck'; // Default
    
    if (model.includes('caminhão')) {
      equipmentType = 'truck';
    } else if (model.includes('harvester')) {
      equipmentType = 'tractor';
    } else if (model.includes('garra')) {
      equipmentType = 'excavator';
    }
    
    // Select the appropriate icon based on equipment type and state
    let iconUrl;
    switch (equipmentType) {
      case 'truck':
        iconUrl = stateColor === 'green' ? truckIconGreen : 
                 stateColor === 'yellow' ? truckIconYellow : truckIconRed;
        break;
      case 'excavator':
        iconUrl = stateColor === 'green' ? excavatorIconGreen : 
                 stateColor === 'yellow' ? excavatorIconYellow : excavatorIconRed;
        break;
      case 'tractor':
        iconUrl = stateColor === 'green' ? tractorIconGreen : 
                 stateColor === 'yellow' ? tractorIconYellow : tractorIconRed;
        break;
    }
    
    return new L.Icon({
      iconUrl,
      iconSize: [80, 80],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16]
    });
  };

  // Helper function to get state name from ID
  const getStateName = (stateId?: string) => {
    if (!stateId) return 'Desconhecido';
    
    const stateInfo = equipmentStates.find(state => state.id === stateId);
    return stateInfo ? stateInfo.name : 'Desconhecido';
  };

  // Memoizar os dados de equipamento processados para evitar recálculos
  const processedEquipmentData = useMemo(() => {
    if (loading || error) return [];
    
    return filteredEquipment.map(eq => {
      // Get equipment info
      const model = equipmentModels.find(m => m.id === eq.equipmentModelId);
      
      // Get position at selected date
      const position = getEquipmentPositionAtDate(eq.id, selectedDate);
      
      // Get state at selected date
      const stateId = getEquipmentStateAtDate(eq.id, selectedDate);
      
      return {
        id: eq.id,
        model: model?.name || 'unknown',
        position,
        state: { equipmentStateId: stateId } // Ajuste para manter compatibilidade com o código existente
      };
    }).filter(item => item.position !== null);
  }, [filteredEquipment, equipmentModels, selectedDate, getEquipmentPositionAtDate, getEquipmentStateAtDate, loading, error]);
  
  // Substituir o useEffect e o estado local pelo dado memoizado
  useEffect(() => {
    setEquipmentData(processedEquipmentData);
  }, [processedEquipmentData]);

  return (
    <div className="relative h-full">
      <h2 className="text-lg font-semibold mb-3">Mapa de Rastreamento</h2>
      
      {/* Time Controls - Apple-inspired floating interface */}
      <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-[1000] flex items-center bg-white/90 backdrop-blur-md rounded-full px-3 py-2 shadow-lg border border-gray-200">
        <button 
          onClick={() => jumpToTime('start')}
          className="p-2 text-gray-600 hover:text-blue-800 transition-colors"
          title="Ir para o início (01/02/2021)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          onClick={() => advanceTime(-24)}
          className="px-3 py-1 text-gray-600 hover:text-blue-800 font-medium transition-colors"
          title="Voltar 1 dia"
        >
          -1d
        </button>
        
        <button 
          onClick={() => advanceTime(-6)}
          className="px-3 py-1 text-gray-600 hover:text-blue-800 font-medium transition-colors"
          title="Voltar 6 horas"
        >
          -6h
        </button>
        
        <button 
          onClick={() => advanceTime(-1)}
          className="px-3 py-1 text-gray-600 hover:text-blue-800 font-medium transition-colors"
          title="Voltar 1 hora"
        >
          -1h
        </button>
        
        <div className="mx-3 px-3 py-1 bg-gray-100 rounded-full text-lg font-medium text-gray-800">
          {formatDate(selectedDate)}
        </div>
        
        <button 
          onClick={() => advanceTime(1)}
          className="px-3 py-1 text-gray-600 hover:text-blue-800 font-medium transition-colors"
          title="Avançar 1 hora"
        >
          +1h
        </button>
        
        <button 
          onClick={() => advanceTime(6)}
          className="px-3 py-1 text-gray-600 hover:text-blue-800 font-medium transition-colors"
          title="Avançar 6 horas"
        >
          +6h
        </button>
        
        <button 
          onClick={() => advanceTime(24)}
          className="px-3 py-1 text-gray-600 hover:text-blue-800 font-medium transition-colors"
          title="Avançar 1 dia"
        >
          +1d
        </button>
        
        <button 
          onClick={() => jumpToTime('end')}
          className="p-2 text-gray-600 hover:text-blue-800 transition-colors"
          title="Ir para o fim (28/02/2021)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      <MapContainer
        center={[-19.2, -46]} 
        zoom={12}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {equipmentData.map(item => (
          <Marker
            key={item.id}
            position={item.position}
            icon={getIcon(item.model, item.state?.equipmentStateId)}
          >
            <Tooltip direction="top" offset={[0, -32]} opacity={0.9} permanent={false} className="custom-tooltip">
              <div className="text-base p-2 min-w-[150px]">
                <p className="font-bold text-xl">{getEquipmentName(item.id)}</p>
                <p className="text-lg mt-1">
                  <strong>Modelo:</strong> {item.model}
                </p>
                <p className="text-lg mt-1">
                  <strong>Status:</strong> {getStateName(item.state?.equipmentStateId)}
                </p>
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map;