import mongoose from 'mongoose' 
 
const userBanSchema = new mongoose.Schema({ 
 
   userId: { 
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'User', 
     required: true, 
     unique: true 
   }, 
 
   bannedBy: { 
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'User', 
     required: true 
   }, 
 
   reason: { 
     type: String, 
     required: true, 
     maxlength: 500 
   }, 
 
   // null = permanent ban 
   expiresAt: { 
     type: Date, 
     default: null 
   }, 
 
   // Ban type 
   type: { 
     type: String, 
     enum: ['temporary', 'permanent'], 
     required: true 
   }, 
 
   isActive: { 
     type: Boolean, 
     default: true 
   }, 
 
   // When admin lifted the ban 
   liftedAt: { type: Date, default: null }, 
   liftedBy: { 
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'User', 
     default: null 
   } 
 
 }, { timestamps: true }) 
 
 // Auto-expire temporary bans 
 userBanSchema.index( 
   { expiresAt: 1 }, 
   { 
     expireAfterSeconds: 0, 
     partialFilterExpression: { 
       expiresAt: { $exists: true }, 
       isActive: true, 
       type: 'temporary' 
     } 
   } 
 ) 
 
 userBanSchema.index({ userId: 1, isActive: 1 }) 
 userBanSchema.index({ isActive: 1, createdAt: -1 }) 
 
 export default mongoose.models.UserBan || 
   mongoose.model('UserBan', userBanSchema) 
