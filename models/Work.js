import mongoose from 'mongoose'

const WorkSchema = new mongoose.Schema({
  name: String,
  desc: String,
  img: [String],
})

export default mongoose.models.Work || mongoose.model('Work', WorkSchema)
