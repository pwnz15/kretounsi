import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  expediteur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  destinataire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  contenu: {
    type: String,
    required: true,
  },
  lu: {
    type: Boolean,
    default: false,
    index: true,
  },
  dateEnvoi: {
    type: Date,
    default: Date.now,
    index: true,
  },
  type: {
    type: String,
    enum: ['TEXT', 'IMAGE'],
    default: 'TEXT',
  },
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true,
  },
});

messageSchema.index({ contenu: 'text' });

export const Message = mongoose.model('Message', messageSchema);