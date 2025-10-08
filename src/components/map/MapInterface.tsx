import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { LatLngTuple } from 'leaflet';
import { MapClickHandler } from './MapClickHandler';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapInterfaceProps {
  selectedLocation: {
    latitude: number;
    longitude: number;
    address: string;
    formatted_address: string;
  } | null;
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address: string;
    formatted_address: string;
  }) => void;
}

// Component to handle map view changes
const MapViewController = ({ center, zoom }: { center: LatLngTuple; zoom: number }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

export const MapInterface = ({ selectedLocation, onLocationSelect }: MapInterfaceProps) => {
  const mapRef = useRef<L.Map | null>(null);
  
  // Default center (San Francisco)
  const defaultCenter: LatLngTuple = [37.7749, -122.4194];
  const defaultZoom = 13;

  // Current map center and zoom
  const center: LatLngTuple = selectedLocation 
    ? [selectedLocation.latitude, selectedLocation.longitude]
    : defaultCenter;
  const zoom = selectedLocation ? 15 : defaultZoom;

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    
    // Set the coordinates with basic info
    onLocationSelect({
      latitude: lat,
      longitude: lng,
      address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      formatted_address: `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
    });
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="w-full h-full z-0"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapViewController center={center} zoom={zoom} />
        <MapClickHandler onMapClick={handleMapClick} />
        
        {selectedLocation && (
          <Marker 
            position={[selectedLocation.latitude, selectedLocation.longitude]}
            icon={customIcon}
          >
            <Popup className="custom-popup">
              <div className="p-2">
                <h3 className="font-semibold text-sm mb-1">
                  {selectedLocation.address}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {selectedLocation.formatted_address}
                </p>
                <div className="text-xs space-y-1">
                  <div>
                    <strong>Latitude:</strong> {selectedLocation.latitude.toFixed(6)}
                  </div>
                  <div>
                    <strong>Longitude:</strong> {selectedLocation.longitude.toFixed(6)}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
      
      {/* Map overlay with info */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-card/90 backdrop-blur-sm rounded-lg p-3 shadow-medium border border-border/50">
          <p className="text-xs text-muted-foreground">
            Click anywhere on the map to get coordinates
          </p>
        </div>
      </div>
    </div>
  );
};