import mongoose from 'mongoose'

const ProductSchema = new mongoose.Schema({
  name: String,
  price: Number,
  desc: String,
  img: [String],
})

export default mongoose.models.Product || mongoose.model('Product', ProductSchema)
