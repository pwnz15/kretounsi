import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  dernierMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  dateDernierMessage: {
    type: Date,
    default: Date.now,
  },
  nonLus: {
    type: Map,
    of: Number,
    default: new Map(),
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
  },
});

conversationSchema.index({ participants: 1 });
conversationSchema.index({ dateDernierMessage: -1 });

export const Conversation = mongoose.model('Conversation', conversationSchema);