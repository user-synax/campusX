import mongoose from 'mongoose' 
 
const adminLogSchema = new mongoose.Schema({ 
 
   // Who did the action 
   adminId: { 
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'User', 
     required: true 
   }, 
 
   // What action was performed 
   action: { 
     type: String, 
     required: true, 
     enum: [ 
       // User actions 
       'user_ban', 
       'user_unban', 
       'user_verify', 
       'user_unverify', 
       'user_delete', 
       'user_make_admin', 
       'user_remove_admin', 
       'user_force_logout', 
       'user_award_coins', 
       'user_reset_password', 
       // Content actions 
       'post_delete', 
       'post_hide', 
       'post_unhide', 
       'post_feature', 
       'post_unfeature', 
       'post_clear_reports', 
       'comment_delete', 
       'confession_reveal', 
       // Resource actions 
       'resource_approve', 
       'resource_reject', 
       // Shop actions 
       'shop_item_add', 
       'shop_item_edit', 
       'shop_item_disable', 
       // Security actions 
       'ip_ban', 
       'ip_unban', 
       'login_attempts_clear', 
       // Platform actions 
       'announcement_create', 
       'coins_adjust' 
     ] 
   }, 
 
   // Who/what was affected 
   targetType: { 
     type: String, 
     enum: ['user', 'post', 'comment', 'resource', 
            'shop_item', 'ip', 'announcement'], 
     required: true 
   }, 
   targetId: { 
     type: String,  // String — works for IPs too 
     required: true 
   }, 
 
   // Human-readable summary 
   summary: { 
     type: String, 
     maxlength: 500, 
     required: true 
   }, 
 
   // Optional reason admin gave 
   reason: { 
     type: String, 
     maxlength: 500, 
     default: '' 
   }, 
 
   // Additional metadata 
   meta: { 
     type: mongoose.Schema.Types.Mixed, 
     default: null 
   } 
 
 }, { 
   timestamps: true 
 }) 
 
 // Immutable — no updates allowed 
 adminLogSchema.pre('findOneAndUpdate', function() { 
   throw new Error('AdminLogs are immutable') 
 }) 
 
 adminLogSchema.index({ adminId: 1, createdAt: -1 }) 
 adminLogSchema.index({ targetType: 1, targetId: 1 }) 
 adminLogSchema.index({ action: 1, createdAt: -1 }) 
 adminLogSchema.index({ createdAt: -1 }) 
 
 export default mongoose.models.AdminLog || 
   mongoose.model('AdminLog', adminLogSchema) 
