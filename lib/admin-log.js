import connectDB from './db.js' 
 import AdminLog from '../models/AdminLog.js' 
 
 export async function logAdminAction({ 
   adminId, 
   action, 
   targetType, 
   targetId, 
   summary, 
   reason = '', 
   meta = null 
 }) { 
   try { 
     await connectDB() 
     await AdminLog.create({ 
       adminId, 
       action, 
       targetType, 
       targetId: targetId.toString(), 
       summary, 
       reason, 
       meta 
     }) 
   } catch (err) { 
     // Never block admin action if logging fails 
     console.error('[AdminLog] Failed to log action:', err.message) 
   } 
 } 
