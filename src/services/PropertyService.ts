import { Property } from '../models/Property';
import { cloudinary } from '../config/cloudinary';
import { cacheService } from './CacheService';
import { logger } from '../utils/logger';
import { propertySchema } from '../utils/validation';
import { getCityCoordinates, calculateDistance } from '../utils/geocoding';
import type { z } from 'zod';

type PropertyData = z.infer<typeof propertySchema>;

export class PropertyService {
  async createProperty(propertyData: PropertyData, images: any[]) {
    try {
      // Validate property data
      propertySchema.parse(propertyData);

      const uploadedImages = await Promise.all(
        images.map(async (image) => {
          const result = await cloudinary.uploader.upload(image, {
            folder: 'dartaleb/properties',
            quality: 'auto',
            fetch_format: 'auto',
            width: 1200,
            height: 800,
            crop: 'fill',
          });
          return {
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
          };
        })
      );

      const property = new Property({
        ...propertyData,
        images: uploadedImages,
      });

      await property.save();
      
      // Invalidate relevant caches
      cacheService.del('properties:recent');
      cacheService.del(`properties:ville:${property.adresse.ville}`);
      cacheService.del(`properties:type:${property.typeLogement}`);
      
      logger.info({ propertyId: property._id }, 'New property created');
      
      return property;
    } catch (error) {
      logger.error({ error, propertyData }, 'Error creating property');
      throw error;
    }
  }

  async searchProperties(query: {
    ville?: string;
    prixMin?: number;
    prixMax?: number;
    chambres?: number;
    typeLogement?: string;
    coordinates?: [number, number];
    distance?: number;
    commodites?: string[];
    page?: number;
    limit?: number;
  }) {
    try {
      const {
        page = 1,
        limit = 20,
        ville,
        coordinates,
        distance,
        ...restQuery
      } = query;

      const filter: any = { disponible: true };

      // Apply filters
      Object.entries(restQuery).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'prixMin') {
            filter.prix = { ...filter.prix, $gte: value };
          } else if (key === 'prixMax') {
            filter.prix = { ...filter.prix, $lte: value };
          } else if (key === 'commodites') {
            filter.commodites = { $all: value };
          } else {
            filter[key] = value;
          }
        }
      });

      // Handle location-based search
      if (ville && !coordinates) {
        const cityCoords = getCityCoordinates(ville);
        if (cityCoords) {
          filter['adresse.location'] = {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: [cityCoords.lng, cityCoords.lat],
              },
              $maxDistance: (distance || 5) * 1000, // Default 5km radius
            },
          };
        } else {
          filter['adresse.ville'] = ville;
        }
      } else if (coordinates) {
        filter['adresse.location'] = {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates,
            },
            $maxDistance: (distance || 5) * 1000,
          },
        };
      }

      const cacheKey = `properties:search:${JSON.stringify({ ...query, page })}`;
      const cachedResults = cacheService.get(cacheKey);
      
      if (cachedResults) {
        return cachedResults;
      }

      const [properties, total] = await Promise.all([
        Property.find(filter)
          .populate('proprietaire', 'nom prenom telephone avatar')
          .sort('-datePublication')
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        Property.countDocuments(filter),
      ]);

      const result = {
        properties,
        pagination: {
          total,
          page,
          totalPages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
      };

      cacheService.set(cacheKey, result, 300); // Cache for 5 minutes
      
      return result;
    } catch (error) {
      logger.error({ error, query }, 'Error searching properties');
      throw error;
    }
  }

  async toggleFavorite(propertyId: string, userId: string) {
    try {
      const property = await Property.findById(propertyId);
      
      if (!property) {
        throw new Error('Propriété non trouvée');
      }

      const isFavorite = property.favoris.includes(userId);
      
      if (isFavorite) {
        property.favoris = property.favoris.filter(id => id.toString() !== userId);
      } else {
        property.favoris.push(userId);
      }

      await property.save();
      
      // Invalidate relevant caches
      cacheService.del(`user:${userId}:favorites`);
      cacheService.del(`property:${propertyId}`);
      
      logger.info({ propertyId, userId, action: isFavorite ? 'remove' : 'add' }, 'Property favorite toggled');
      
      return { isFavorite: !isFavorite };
    } catch (error) {
      logger.error({ error, propertyId, userId }, 'Error toggling property favorite');
      throw error;
    }
  }

  async getPropertyStats(propertyId: string) {
    const cacheKey = `property:${propertyId}:stats`;
    const cachedStats = cacheService.get(cacheKey);
    
    if (cachedStats) {
      return cachedStats;
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      throw new Error('Propriété non trouvée');
    }

    const stats = {
      vues: property.vues,
      favoris: property.favoris.length,
      datePublication: property.datePublication,
      tempsEnLigne: Date.now() - property.datePublication.getTime(),
    };

    cacheService.set(cacheKey, stats, 3600); // Cache for 1 hour
    
    return stats;
  }
}