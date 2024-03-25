'use strict'

const {Schema, model} = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = "Product"
const COLLECTION_NAME = "Products"

const productSchema = new Schema({
    product_name: {type: String, required: true},
    product_thumb: {type: String, required: true},
    product_description: String,
    product_price: {type: String, required: true},
    product_quantity: {type: String, required: true},
    product_type: {type: String, required: true, enum: ['Electronic', 'Clothing', 'Furniture']},
    product_shop: {type:Schema.Types.ObjectId, ref: 'Shop'},
    product_attributes: {type: Schema.Types.Mixed, required: true},
}, {
    collection: COLLECTION_NAME,
    timestamps: true
})

const clothingSchema = new Schema({
    brand: {type: String, require: true},
    size: String,
    material: String,
    product_shop: {type:Schema.Types.ObjectId, ref: 'Shop'},
    
}, {
    collection: 'Clothes',
    timestamps: true
})

const electronicSchema = new Schema({
    manufacturer: {type: String, require: true},
    model: String,
    color: String,
    product_shop: {type:Schema.Types.ObjectId, ref: 'Shop'},
}, {
    collection: 'Electronics',
    timestamps: true
})
const furnitureSchema = new Schema({
    brand: {type: String, require: true},
    size: String,
    material: String,
    product_shop: {type:Schema.Types.ObjectId, ref: 'Shop'},
}, {
    collection: 'Furnitures',
    timestamps: true
})
module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    electronic: model('Electronic', electronicSchema),
    clothing: model('Clothing', clothingSchema),
    furniture: model('Furniture', furnitureSchema)
}