import dbConnect from '../../../../lib/mongodb'
import Work from '../../../../models/Work'

export default async function handler(req, res) {
  await dbConnect()

  try {
    const works = await Work.find({})
    res.status(200).json(works)
  } catch (error) {
    res.status(500).json({ message: 'Xatolik', error })
  }
}
