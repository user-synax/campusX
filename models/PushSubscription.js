import mongoose from 'mongoose' 
 
const pushSubscriptionSchema = new mongoose.Schema({ 
 
   // Which user this subscription belongs to 
   userId: { 
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'User', 
     required: true 
   }, 
 
   // The subscription object from browser 
   // Contains: endpoint, keys.p256dh, keys.auth 
   endpoint: { 
     type: String, 
     required: true, 
     unique: true  // each device has unique endpoint 
   }, 
   p256dh: { 
     type: String, 
     required: true   // encryption key 
   }, 
   auth: { 
     type: String, 
     required: true   // auth secret 
   }, 
 
   // Device info — for display in settings 
   userAgent: { 
     type: String, 
     default: '' 
   }, 
   deviceName: { 
     type: String, 
     default: 'Unknown Device'   // "Chrome on Android", "Firefox on Windows" 
   }, 
 
   // Is this subscription still valid? 
   // Set to false when push returns 410 Gone 
   isActive: { 
     type: Boolean, 
     default: true 
   }, 
 
   // Last time push was sent to this subscription 
   lastUsedAt: { 
     type: Date, 
     default: Date.now 
   } 
 
 }, { timestamps: true }) 
 
 // Indexes 
 pushSubscriptionSchema.index({ userId: 1, isActive: 1 }) 
 pushSubscriptionSchema.index({ endpoint: 1 }, { unique: true }) 
 // Auto-delete inactive subscriptions after 90 days 
 pushSubscriptionSchema.index( 
   { lastUsedAt: 1 }, 
   { 
     expireAfterSeconds: 90 * 24 * 60 * 60, 
     partialFilterExpression: { isActive: false } 
   } 
 ) 
 
 export default mongoose.models.PushSubscription || 
   mongoose.model('PushSubscription', pushSubscriptionSchema) 
