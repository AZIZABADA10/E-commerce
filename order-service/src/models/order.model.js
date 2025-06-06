const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending' 
  },
  customerInfo: {
    nom: String,
    prenom: String,
    telephone: String,
    email: String,
    adresse: String,
    ville: String,
    codePostal: String
  },
  totalAmount: Number
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
