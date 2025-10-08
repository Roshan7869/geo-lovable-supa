import { useMapEvents } from 'react-leaflet';
import L from 'leaflet';

interface MapClickHandlerProps {
  onMapClick: (e: L.LeafletMouseEvent) => void;
}

export const MapClickHandler = ({ onMapClick }: MapClickHandlerProps) => {
  useMapEvents({
    click: onMapClick,
  });
  
  return null;
};
