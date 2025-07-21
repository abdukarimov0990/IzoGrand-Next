import dbConnect from '@/lib/mongodb'
import work from '../../../../models/Work'

export async function GET() {
  await dbConnect()
  try {
    const works = await work.find({})
    return new Response(JSON.stringify(works), {
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
