import { z } from 'zod';
import { TUNISIA_CITIES, TUNISIA_GOVERNORATES, PROPERTY_TYPES, PROPERTY_STATES, AMENITIES } from '../config/constants';

export const propertySchema = z.object({
  titre: z.string().min(10).max(100),
  description: z.string().min(50).max(1000),
  adresse: z.object({
    rue: z.string().min(5).max(100),
    ville: z.enum(TUNISIA_CITIES),
    codePostal: z.string().regex(/^\d{4}$/, 'Code postal invalide'),
    gouvernorat: z.enum(TUNISIA_GOVERNORATES),
    location: z.object({
      type: z.literal('Point'),
      coordinates: z.tuple([
        z.number().min(9).max(12), // Longitude (Tunisia)
        z.number().min(30).max(38), // Latitude (Tunisia)
      ]),
    }),
  }),
  prix: z.number().min(100).max(10000),
  superficie: z.number().min(9).max(1000),
  chambres: z.number().min(1).max(10),
  commodites: z.array(z.enum(AMENITIES)).min(1),
  typeLogement: z.enum(Object.keys(PROPERTY_TYPES) as [keyof typeof PROPERTY_TYPES]),
  etatLogement: z.enum(Object.keys(PROPERTY_STATES) as [keyof typeof PROPERTY_STATES]),
});