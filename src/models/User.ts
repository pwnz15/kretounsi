import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export enum UserRole {
  PROPRIETAIRE = 'PROPRIETAIRE',
  ETUDIANT = 'ETUDIANT',
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  password: {
    type: String,
    required: true,
  },
  nom: {
    type: String,
    required: true,
    index: true,
  },
  prenom: {
    type: String,
    required: true,
    index: true,
  },
  telephone: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    required: true,
    index: true,
  },
  avatar: {
    url: String,
    publicId: String,
  },
  dateCreation: {
    type: Date,
    default: Date.now,
    index: true,
  },
  derniereMiseAJour: {
    type: Date,
    default: Date.now,
  },
  estEnLigne: {
    type: Boolean,
    default: false,
  },
  notifications: [{
    type: {
      type: String,
      enum: ['MESSAGE', 'PROPERTY_INTEREST', 'ROOMMATE_REQUEST'],
      required: true,
    },
    message: String,
    lu: {
      type: Boolean,
      default: false,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    lienAction: String,
  }],
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  this.derniereMiseAJour = new Date();
  next();
});

userSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

userSchema.index({ nom: 'text', prenom: 'text' });

export const User = mongoose.model('User', userSchema);