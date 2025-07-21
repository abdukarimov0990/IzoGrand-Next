import dbConnect from '@/lib/mongodb'
import Product from '../../../../models/Product'

export async function GET() {
  await dbConnect()
  try {
    const products = await Product.find({})
    return new Response(JSON.stringify(products), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Xatolik', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
