import { MapContainer, Marker, TileLayer, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEquipment } from '../hooks/useEquipment';
import { useEffect, useState } from 'react';  

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
    equipment,
    equipmentModels,
    positionHistory,
    stateHistory,
    loading,
    error
  } = useEquipment();
  
  // Use state to store processed equipment data
  const [equipmentData, setEquipmentData] = useState<any[]>([]);

  // Process equipment data once when loaded
  useEffect(() => {
    if (!loading && !error && equipment.length > 0) {
      const processedData = equipment.map(eq => {
        // Get equipment info
        const equipmentData = equipment.find(e => e.id === eq.id);
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
  }, [loading, equipment, equipmentModels, positionHistory, stateHistory]);

  // Create icon based on model
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

  // Helper function to convert state IDs to readable labels
  // Helper function to get state name from ID
  const getStateName = (stateId?: string) => {
    if (!stateId) return 'Desconhecido';
    
    const stateInfo = equipmentStates.find(state => state.id === stateId);
    return stateInfo ? stateInfo.name : 'Desconhecido';
  };

  return (
    <>
      <h2 className="text-lg font-semibold mb-3">Mapa de Rastreamento</h2>
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
                <p className="font-bold text-xl">{item.model}</p>
                <p className="text-lg mt-1">
                  <strong>Status:</strong> {getStateName(item.state?.equipmentStateId)}
                </p>
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
};

export default Map;