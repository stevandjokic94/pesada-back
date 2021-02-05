const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { ObjectId } = mongoose.Schema;
 
const CartItemSchema = new mongoose.Schema(
  {
    product: { type: ObjectId, ref: "Product" },
    name: String,
    priceWithDiscount: Number,
    count: Number,
    weight: Number
  },
  { timestamps: true }
);
 
const CartItem = mongoose.model("CartItem", CartItemSchema);
 
const OrderSchema = new mongoose.Schema(
  {
    products: [CartItemSchema],
    // transaction_id: {},
    status: {
      type: String,
      default: "Nije obradjeno",
      enum: ["Nije obradjeno", "Obradjeno"] // enum means string objects
    },
    updated: Date,
    // user: { type: ObjectId, ref: "User" }
    name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32
    },
    surname: {
      type: String,
      trim: true,
      maxlength: 32
    },
    phone: {
      type: String,
      trim: true,
      required: true,
      maxlength: 15
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique:false
    },
    street: {
      type: String,
      trim: true,
      required: true,
      maxlength: 64
    },
    homeNumber: {
      type: String,
      trim: true,
      required: true,
      maxlength: 50
    },
    postalCode: {
      type: String,
      trim: true,
      required: true,
      maxlength: 16
    },
    city: {
      type: String,
      trim: true,
      required: true,
      maxlength: 32
    },
    contactPerson: {
      type: String,
      trim: true,
      maxlength: 32
    },
    company: {
      type: String,
      trim: true,
      maxlength: 32
    },  
    pib: {
      type: String,
      trim: true,
      maxlength: 32
    },
    paymentMethod: {
      type: String
    },
    note: {
      type: String
    }
  },
    { timestamps: true }
);
 
const Order = mongoose.model("Order", OrderSchema);
 
module.exports = { Order, CartItem };