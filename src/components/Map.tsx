import { MapContainer, Marker, TileLayer, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEquipment } from '../hooks/useEquipment';
import { useEffect, useState } from 'react';  

// Import equipment icons
import truckIcon from '../assets/icons/truck.png';
import excavatorIcon from '../assets/icons/excavator.png';
import tractorIcon from '../assets/icons/tractor.png';

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
  const getIcon = (modelName: string) => {
    // Create custom icons - pre-initialize them
    const customIcons = {
      truck: new L.Icon({
        iconUrl: truckIcon,
        iconSize: [64, 64],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      }),
      excavator: new L.Icon({
        iconUrl: excavatorIcon,
        iconSize: [64, 64],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      }),
      tractor: new L.Icon({
        iconUrl: tractorIcon,
        iconSize: [64, 64],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      })
    };
    
    // Match model name to icon (case insensitive)
    const model = modelName.toLowerCase();
    
    // Map actual model names to icon types
    if (model.includes('caminhão')) {
      return customIcons.truck;
    } else if (model.includes('harvester')) {
      return customIcons.tractor;
    } else if (model.includes('garra')) {
      return customIcons.excavator;
    } else {
      // Fallback to a default custom icon
      return customIcons.truck;
    }
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
            icon={getIcon(item.model)}
          >
            <Popup>
              <div>
                <p><strong>ID:</strong> {item.id}</p>
                <p><strong>Model:</strong> {item.model}</p>
                <p><strong>State:</strong> {item.state?.equipmentStateId || 'Unknown'}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </>
  );
};

export default Map;