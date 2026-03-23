import mongoose from 'mongoose' 
 
const ipBanSchema = new mongoose.Schema({ 
   ip: { type: String, required: true, unique: true }, 
   bannedBy: { 
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'User' 
   }, 
   reason: { type: String, maxlength: 300 }, 
   expiresAt: { type: Date, default: null },  // null = permanent 
   isActive: { type: Boolean, default: true } 
 }, { timestamps: true }) 
 
 ipBanSchema.index({ ip: 1, isActive: 1 }) 
 ipBanSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, sparse: true }) 
 
 export default mongoose.models.IPBan || 
   mongoose.model('IPBan', ipBanSchema) 
