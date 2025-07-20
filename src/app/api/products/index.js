import dbConnect from '../../../../lib/mongodb'
import Product from '../../../../models/Product'

export default async function handler(req, res) {
  await dbConnect()

  try {
    const products = await Product.find({})
    res.status(200).json(products)
  } catch (error) {
    res.status(500).json({ message: 'Xatolik', error })
  }
}
