/**
 * One-time seed script: creates the global CampusX group and
 * backfills all existing users as members.
 *
 * Run once:
 *   node -r dotenv/config scripts/seed-global-group.js
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

// ── Inline minimal models (avoid Next.js module resolution) ──
const memberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  joinedAt: { type: Date, default: Date.now },
  lastReadAt: { type: Date, default: null },
  isMuted: { type: Boolean, default: false },
}, { _id: false })

const groupChatSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  avatar: { type: String, default: '' },
  college: { type: String, trim: true, default: '' },
  members: { type: [memberSchema], default: [] },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messageCount: { type: Number, default: 0 },
  lastMessage: { content: String, senderName: String, sentAt: Date, type: { type: String, default: 'text' } },
  isActive: { type: Boolean, default: true },
  isGlobal: { type: Boolean, default: false },
}, { timestamps: true })

const groupMessageSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'GroupChat', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, trim: true, maxlength: 2000, default: '' },
  type: { type: String, enum: ['text', 'image', 'system'], default: 'text' },
  imageUrl: { type: String, default: '' },
  reactions: { type: [], default: [] },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
}, { timestamps: true })

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
}, { timestamps: true })

const GroupChat = mongoose.models.GroupChat || mongoose.model('GroupChat', groupChatSchema)
const GroupMessage = mongoose.models.GroupMessage || mongoose.model('GroupMessage', groupMessageSchema)
const User = mongoose.models.User || mongoose.model('User', userSchema)

async function main() {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI not set in .env')

  await mongoose.connect(uri)
  console.log('✅ Connected to MongoDB')

  const founderUsername = process.env.NEXT_PUBLIC_FOUNDER_USERNAME
  if (!founderUsername) throw new Error('NEXT_PUBLIC_FOUNDER_USERNAME not set in .env')

  const founder = await User.findOne({ username: founderUsername }).lean()
  if (!founder) throw new Error(`Founder user "${founderUsername}" not found in DB`)

  // ── 1. Create or find the global group ──
  let group = await GroupChat.findOne({ isGlobal: true }).lean()

  if (!group) {
    group = await GroupChat.create({
      name: 'CampusX',
      description: 'The official CampusX community — everyone is here 🎓',
      avatar: '',
      college: '',
      isGlobal: true,
      isActive: true,
      createdBy: founder._id,
      members: [{ userId: founder._id, role: 'admin', joinedAt: new Date() }],
      lastMessage: {
        content: 'Welcome to CampusX! 🎉',
        senderName: 'System',
        sentAt: new Date(),
        type: 'system',
      },
    })

    await GroupMessage.create({
      groupId: group._id,
      sender: founder._id,
      content: 'Welcome to CampusX! 🎉 This is the official community group — say hi!',
      type: 'system',
    })

    console.log(`✅ Created global group: ${group._id}`)
  } else {
    console.log(`ℹ️  Global group already exists: ${group._id}`)
  }

  // ── 2. Backfill all existing users ──
  const allUsers = await User.find({}).select('_id').lean()
  const existingMemberIds = new Set(
    (await GroupChat.findById(group._id).select('members').lean())
      .members.map(m => m.userId.toString())
  )

  const toAdd = allUsers.filter(u => !existingMemberIds.has(u._id.toString()))

  if (toAdd.length === 0) {
    console.log('ℹ️  All users already members — nothing to backfill')
  } else {
    const newMembers = toAdd.map(u => ({
      userId: u._id,
      role: 'member',
      joinedAt: new Date(),
    }))

    await GroupChat.updateOne(
      { _id: group._id },
      { $push: { members: { $each: newMembers } } }
    )

    console.log(`✅ Backfilled ${toAdd.length} existing users into the global group`)
  }

  await mongoose.disconnect()
  console.log('✅ Done')
}

main().catch(err => {
  console.error('❌ Seed failed:', err.message)
  process.exit(1)
})
