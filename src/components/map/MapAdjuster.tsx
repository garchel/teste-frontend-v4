import { useMap } from 'react-leaflet';
import { useEffect, FC } from 'react';

const MapAdjuster: FC = () => {
  const map = useMap();
  
  useEffect(() => {
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    handleResize(); // Execute once on mount
    
    return () => window.removeEventListener('resize', handleResize);
  }, [map]);
  
  return null;
};

export default MapAdjuster;