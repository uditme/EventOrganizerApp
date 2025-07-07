'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

interface MapPickerProps {
  onPlaceSelect: (location: string) => void;
}

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

export default function MapPicker({ onPlaceSelect }: MapPickerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedCoords, setSelectedCoords] = useState<[number, number] | null>(null);

  // Debounce search
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm.length > 2) {
        searchPlaces(searchTerm);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const searchPlaces = async (query: string) => {
    setLoading(true);
    try {
      // Using Nominatim (OpenStreetMap) API - completely free!
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'EventOrganizer/1.0',
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Search results:', data); // Debug log
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching places:', error);
      // Fallback: still allow manual input
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    
    setSearchTerm(suggestion.display_name);
    setSelectedLocation(suggestion.display_name);
    setSelectedCoords([lat, lon]);
    onPlaceSelect(suggestion.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleManualInput = () => {
    if (searchTerm.trim()) {
      setSelectedLocation(searchTerm.trim());
      onPlaceSelect(searchTerm.trim());
      setShowSuggestions(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          
          setSelectedCoords([lat, lon]);

          // Reverse geocode to get address
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
              {
                headers: {
                  'User-Agent': 'EventOrganizer/1.0',
                },
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              console.log('Current location result:', data);
              if (data.display_name) {
                setSelectedLocation(data.display_name);
                setSearchTerm(data.display_name);
                onPlaceSelect(data.display_name);
              }
            } else {
              throw new Error('Reverse geocoding failed');
            }
          } catch (error) {
            console.error('Error reverse geocoding:', error);
            const locationStr = `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
            setSelectedLocation(locationStr);
            setSearchTerm(locationStr);
            onPlaceSelect(locationStr);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Could not get your current location. Please search manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const openInMaps = () => {
    if (selectedCoords) {
      const [lat, lon] = selectedCoords;
      const mapsUrl = `https://www.google.com/maps?q=${lat},${lon}`;
      window.open(mapsUrl, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleManualInput()}
          placeholder="Search for a location or enter manually"
          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
        />
        <div className="absolute right-3 top-3 flex space-x-1">
          {loading && (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          )}
          {!loading && (
            <button
              onClick={getCurrentLocation}
              className="text-blue-500 hover:text-blue-700"
              title="Use my current location"
            >
              <Navigation className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="relative z-10">
          <div className="absolute w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-start space-x-3"
              >
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.display_name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Map using iframe */}
      <div className="w-full h-80 rounded-lg border-2 border-gray-300 shadow-sm overflow-hidden bg-gray-100">
        {selectedCoords ? (
          <div className="h-full flex flex-col">
            <iframe
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${selectedCoords[1]-0.01},${selectedCoords[0]-0.01},${selectedCoords[1]+0.01},${selectedCoords[0]+0.01}&layer=mapnik&marker=${selectedCoords[0]},${selectedCoords[1]}`}
              className="w-full flex-1 border-0"
              title="Location Map"
            />
            <div className="p-2 bg-white border-t">
              <button
                onClick={openInMaps}
                className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>View in Google Maps</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 font-medium">No location selected</p>
              <p className="text-gray-500 text-sm">Search for a location or use your current location</p>
            </div>
          </div>
        )}
      </div>

      {/* Selected Location Display */}
      {selectedLocation && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800 font-medium">Selected location:</span>
          </div>
          <p className="text-sm text-green-700 mt-1">{selectedLocation}</p>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Search for a location in the search box above</p>
        <p>• Click the navigation icon to use your current location</p>
        <p>• Press Enter to use manual location input</p>
        <p>• Selected location will show on the map below</p>
      </div>
    </div>
  );
}

