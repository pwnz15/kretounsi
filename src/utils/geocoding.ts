import { TUNISIA_CITIES } from '../config/constants';
import { cacheService } from '../services/CacheService';

type Coordinates = {
  lat: number;
  lng: number;
};

// Approximate coordinates for major Tunisian cities
const CITY_COORDINATES: Record<string, Coordinates> = {
  'Tunis': { lat: 36.8065, lng: 10.1815 },
  'Sfax': { lat: 34.7398, lng: 10.7600 },
  'Sousse': { lat: 35.8283, lng: 10.6400 },
  'Kairouan': { lat: 35.6781, lng: 10.0964 },
  // Add more cities as needed
};

export function getCityCoordinates(city: string): Coordinates | null {
  const cacheKey = `coordinates:${city}`;
  const cached = cacheService.get<Coordinates>(cacheKey);
  
  if (cached) {
    return cached;
  }

  const coordinates = CITY_COORDINATES[city];
  if (coordinates) {
    cacheService.set(cacheKey, coordinates, 86400); // Cache for 24 hours
    return coordinates;
  }

  return null;
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}