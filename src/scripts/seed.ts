import { faker } from '@faker-js/faker/locale/fr';
import mongoose from 'mongoose';
import { User, UserRole } from '../models/User';
import { Property } from '../models/Property';
import { env } from '../config/env';

async function seed() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create users
    const users = [];
    for (let i = 0; i < 10; i++) {
      const user = new User({
        email: faker.internet.email(),
        password: await bcrypt.hash('password123', 10),
        nom: faker.person.lastName(),
        prenom: faker.person.firstName(),
        telephone: faker.phone.number(),
        role: faker.helpers.arrayElement(Object.values(UserRole)),
      });
      users.push(await user.save());
    }

    // Create properties
    const properties = [];
    for (let i = 0; i < 20; i++) {
      const property = new Property({
        proprietaire: faker.helpers.arrayElement(users.filter(u => u.role === UserRole.PROPRIETAIRE))._id,
        titre: faker.lorem.words(3),
        description: faker.lorem.paragraph(),
        adresse: {
          rue: faker.location.street(),
          ville: faker.helpers.arrayElement(['Tunis', 'Sfax', 'Sousse', 'Kairouan']),
          codePostal: faker.location.zipCode(),
          gouvernorat: faker.helpers.arrayElement(['Tunis', 'Sfax', 'Sousse', 'Kairouan']),
          location: {
            type: 'Point',
            coordinates: [
              parseFloat(faker.location.longitude()),
              parseFloat(faker.location.latitude()),
            ],
          },
        },
        prix: faker.number.int({ min: 300, max: 1000 }),
        superficie: faker.number.int({ min: 30, max: 200 }),
        chambres: faker.number.int({ min: 1, max: 5 }),
        images: Array(3).fill(null).map(() => ({
          url: faker.image.urlLoremFlickr({ category: 'apartment' }),
          publicId: faker.string.uuid(),
        })),
        commodites: faker.helpers.arrayElements([
          'WiFi', 'Climatisation', 'Chauffage', 'Parking', 'Meublé',
          'Machine à laver', 'Sèche-linge', 'Cuisine équipée'
        ], { min: 3, max: 6 }),
        typeLogement: faker.helpers.arrayElement(['APPARTEMENT', 'MAISON', 'STUDIO', 'CHAMBRE']),
        etatLogement: faker.helpers.arrayElement(['NEUF', 'BON_ETAT', 'A_RENOVER']),
      });
      properties.push(await property.save());
    }

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();