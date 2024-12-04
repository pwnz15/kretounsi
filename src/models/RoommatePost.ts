import mongoose from 'mongoose';

const roommatePostSchema = new mongoose.Schema({
  etudiant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  titre: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  budgetMax: {
    type: Number,
    required: true,
  },
  quartiersSouhaites: [{
    type: String,
  }],
  dateEmmenagement: {
    type: Date,
    required: true,
  },
  nombreColocataires: {
    type: Number,
    required: true,
  },
  actif: {
    type: Boolean,
    default: true,
  },
  datePublication: {
    type: Date,
    default: Date.now,
  },
});

export const RoommatePost = mongoose.model('RoommatePost', roommatePostSchema);