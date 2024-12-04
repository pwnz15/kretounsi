import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  proprietaire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  titre: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  adresse: {
    rue: String,
    ville: {
      type: String,
      index: true,
    },
    codePostal: String,
    gouvernorat: {
      type: String,
      index: true,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
  },
  prix: {
    type: Number,
    required: true,
    index: true,
  },
  superficie: {
    type: Number,
    required: true,
    index: true,
  },
  chambres: {
    type: Number,
    required: true,
    index: true,
  },
  images: [{
    url: String,
    publicId: String,
  }],
  commodites: [{
    type: String,
    index: true,
  }],
  disponible: {
    type: Boolean,
    default: true,
    index: true,
  },
  datePublication: {
    type: Date,
    default: Date.now,
    index: true,
  },
  vues: {
    type: Number,
    default: 0,
  },
  favoris: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  typeLogement: {
    type: String,
    enum: ['APPARTEMENT', 'MAISON', 'STUDIO', 'CHAMBRE'],
    required: true,
    index: true,
  },
  etatLogement: {
    type: String,
    enum: ['NEUF', 'BON_ETAT', 'A_RENOVER'],
    required: true,
    index: true,
  },
});

propertySchema.index({ 'adresse.location': '2dsphere' });
propertySchema.index({ titre: 'text', description: 'text' });

export const Property = mongoose.model('Property', propertySchema);