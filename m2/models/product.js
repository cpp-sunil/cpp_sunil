const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const productSchema = mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category",
        required: true
    },
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    quentity: {type: String ,required: true},
    image: {type: String },
    qr:{
        type: String 
    },
    status: {
        enum: ["Active", "Block", "Delete"],
        type: String,
        default: "Active"
    },
});
productSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('product', productSchema);
