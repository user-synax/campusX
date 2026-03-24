import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'
import {
  applyDateFilter,
  getRangeDuration,
  getRangeStartDate,
  computeGrowth,
  buildTimeSeries,
} from '@/lib/analytics'

import User from '@/models/User'
import Post from '@/models/Post'
import Comment from '@/models/Comment'
import Wallet from '@/models/Wallet'
import CoinTransaction from '@/models/CoinTransaction'
import Resource from '@/models/Resource'
import GroupChat from '@/models/GroupChat'
import Event from '@/models/Event'
import UserBan from '@/models/UserBan'
import IPBan from '@/models/IPBan'
import AdminLog from '@/models/AdminLog'

const VALID_RANGES = ['7d', '30d', '90d', 'all']

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION: USERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function getUserAnalytics(range) {
  const dateFilter = applyDateFilter(range)
  const startDate = getRangeStartDate(range)
  const duration = getRangeDuration(range)
  const now = new Date()

  const prevStart = duration ? new Date(now - duration * 2) : null
  const prevEnd = startDate

  const [
    total,
    newInRange,
    newInPrev,
    banned,
    verified,
    dau,
    byCollegeRaw,
    timeSeriesRaw,
  ] = await Promise.all([
    User.countDocuments({ isDeleted: false }),
    startDate
      ? User.countDocuments({ isDeleted: false, createdAt: { $gte: startDate } })
      : User.countDocuments({ isDeleted: false }),
    prevStart && prevEnd
      ? User.countDocuments({ isDeleted: false, createdAt: { $gte: prevStart, $lt: prevEnd } })
      : Promise.resolve(0),
    User.countDocuments({ isBanned: true }),
    User.countDocuments({ isVerified: true }),
    User.countDocuments({ lastActiveDate: { $gte: new Date(now - 24 * 60 * 60 * 1000) } }),
    User.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$college', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, college: '$_id', count: 1 } },
    ]),
    startDate
      ? User.aggregate([
          { $match: { isDeleted: false, createdAt: { $gte: startDate } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
          { $project: { _id: 0, date: '$_id', count: 1 } },
        ])
      : Promise.resolve([]),
  ])

  return {
    total,
    newInRange,
    growth: computeGrowth(newInRange, newInPrev),
    banned,
    verified,
    dau,
    byCollege: byCollegeRaw,
    timeSeries: startDate ? buildTimeSeries(timeSeriesRaw, startDate, now) : timeSeriesRaw,
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION: CONTENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function getContentAnalytics(range) {
  const startDate = getRangeStartDate(range)
  const duration = getRangeDuration(range)
  const now = new Date()
  const prevStart = duration ? new Date(now - duration * 2) : null
  const prevEnd = startDate

  const rangeMatch = startDate ? { createdAt: { $gte: startDate } } : {}

  const [
    totalPosts,
    postsInRange,
    postsInPrev,
    commentsInRange,
    reactionsInRange,
    anonymousPosts,
    pollPosts,
    imagePosts,
    hiddenPosts,
    reportedPosts,
    topHashtagsRaw,
    timeSeriesRaw,
  ] = await Promise.all([
    Post.countDocuments({ isDeleted: false }),
    Post.countDocuments({ isDeleted: false, ...rangeMatch }),
    prevStart && prevEnd
      ? Post.countDocuments({ isDeleted: false, createdAt: { $gte: prevStart, $lt: prevEnd } })
      : Promise.resolve(0),
    Comment.countDocuments(rangeMatch),
    // reactions count via aggregation
    Post.aggregate([
      { $match: { isDeleted: false, ...rangeMatch } },
      { $project: { reactionCount: { $size: '$reactions' } } },
      { $group: { _id: null, total: { $sum: '$reactionCount' } } },
    ]),
    Post.countDocuments({ isAnonymous: true, isDeleted: false, ...rangeMatch }),
    Post.countDocuments({ 'poll.options.0': { $exists: true }, isDeleted: false, ...rangeMatch }),
    Post.countDocuments({ 'images.0': { $exists: true }, isDeleted: false, ...rangeMatch }),
    Post.countDocuments({ isHidden: true, isDeleted: false }),
    Post.countDocuments({ reportCount: { $gt: 0 }, isDeleted: false }),
    Post.aggregate([
      { $match: { isDeleted: false, ...rangeMatch, 'hashtags.0': { $exists: true } } },
      { $unwind: '$hashtags' },
      { $group: { _id: '$hashtags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, tag: '$_id', count: 1 } },
    ]),
    startDate
      ? Post.aggregate([
          { $match: { isDeleted: false, createdAt: { $gte: startDate } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
          { $project: { _id: 0, date: '$_id', count: 1 } },
        ])
      : Promise.resolve([]),
  ])

  const totalReactions = reactionsInRange[0]?.total ?? 0
  const engagementRate =
    postsInRange === 0
      ? 0
      : Math.round(((totalReactions + commentsInRange) / postsInRange) * 100 * 10) / 10

  return {
    totalPosts,
    postsInRange,
    postGrowth: computeGrowth(postsInRange, postsInPrev),
    commentsInRange,
    engagementRate,
    anonymousPosts,
    pollPosts,
    imagePosts,
    hiddenPosts,
    reportedPosts,
    topHashtags: topHashtagsRaw,
    timeSeries: startDate ? buildTimeSeries(timeSeriesRaw, startDate, now) : timeSeriesRaw,
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION: COINS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function getCoinAnalytics(range) {
  const startDate = getRangeStartDate(range)
  const now = new Date()
  const rangeMatch = startDate ? { createdAt: { $gte: startDate } } : {}

  const [
    walletTotals,
    volumeRaw,
    adminAdjustCount,
    byReasonRaw,
    topEarnersRaw,
    topSpendersRaw,
    timeSeriesRaw,
  ] = await Promise.all([
    Wallet.aggregate([
      { $group: { _id: null, circulation: { $sum: '$balance' }, earned: { $sum: '$totalEarned' }, spent: { $sum: '$totalSpent' } } },
    ]),
    CoinTransaction.aggregate([
      { $match: rangeMatch },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    CoinTransaction.countDocuments({ type: 'admin_adjust', ...rangeMatch }),
    CoinTransaction.aggregate([
      { $match: rangeMatch },
      { $group: { _id: '$reason', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $project: { _id: 0, reason: '$_id', total: 1 } },
    ]),
    Wallet.aggregate([
      { $sort: { totalEarned: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $project: { _id: 0, username: { $arrayElemAt: ['$user.username', 0] }, totalEarned: 1 } },
    ]),
    Wallet.aggregate([
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      { $project: { _id: 0, username: { $arrayElemAt: ['$user.username', 0] }, totalSpent: 1 } },
    ]),
    startDate
      ? CoinTransaction.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$amount' } } },
          { $sort: { _id: 1 } },
          { $project: { _id: 0, date: '$_id', total: 1 } },
        ])
      : Promise.resolve([]),
  ])

  const wt = walletTotals[0] ?? { circulation: 0, earned: 0, spent: 0 }

  // Normalize time series to { date, count } shape
  const tsNormalized = timeSeriesRaw.map(d => ({ date: d.date, count: d.total }))

  return {
    totalCirculation: wt.circulation,
    lifetimeEarned: wt.earned,
    lifetimeSpent: wt.spent,
    volumeInRange: volumeRaw[0]?.total ?? 0,
    adminAdjustCount,
    byReason: byReasonRaw,
    topEarners: topEarnersRaw,
    topSpenders: topSpendersRaw,
    timeSeries: startDate ? buildTimeSeries(tsNormalized, startDate, now) : tsNormalized,
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION: RESOURCES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function getResourceAnalytics(range) {
  const startDate = getRangeStartDate(range)
  const rangeMatch = startDate ? { createdAt: { $gte: startDate } } : {}

  const [
    approved,
    pending,
    rejected,
    uploadedInRange,
    engagementTotals,
    byCategory,
    topDownloaded,
    copyrightFlagged,
  ] = await Promise.all([
    Resource.countDocuments({ status: 'approved' }),
    Resource.countDocuments({ status: 'pending' }),
    Resource.countDocuments({ status: 'rejected' }),
    Resource.countDocuments(rangeMatch),
    Resource.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, downloads: { $sum: '$downloadCount' }, views: { $sum: '$viewCount' } } },
    ]),
    Resource.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, category: '$_id', count: 1 } },
    ]),
    Resource.find({ status: 'approved' })
      .sort({ downloadCount: -1 })
      .limit(5)
      .select('title category downloadCount')
      .lean(),
    Resource.countDocuments({ copyrightFlag: true, status: 'pending' }),
  ])

  const eng = engagementTotals[0] ?? { downloads: 0, views: 0 }

  return {
    approved,
    pending,
    rejected,
    uploadedInRange,
    totalDownloads: eng.downloads,
    totalViews: eng.views,
    byCategory,
    topDownloaded: topDownloaded.map(r => ({
      title: r.title,
      category: r.category,
      downloadCount: r.downloadCount,
    })),
    copyrightFlagged,
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION: CHATS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function getChatAnalytics(range) {
  const startDate = getRangeStartDate(range)
  const rangeMatch = startDate ? { createdAt: { $gte: startDate }, isActive: true } : { isActive: true }

  const [
    activeGroups,
    newInRange,
    messageTotals,
    avgMemberRaw,
    topGroups,
  ] = await Promise.all([
    GroupChat.countDocuments({ isActive: true }),
    GroupChat.countDocuments(rangeMatch),
    GroupChat.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, total: { $sum: '$messageCount' } } },
    ]),
    GroupChat.aggregate([
      { $match: { isActive: true } },
      { $project: { memberCount: { $size: '$members' } } },
      { $group: { _id: null, avg: { $avg: '$memberCount' } } },
    ]),
    GroupChat.find({ isActive: true })
      .sort({ messageCount: -1 })
      .limit(5)
      .select('name messageCount')
      .lean(),
  ])

  return {
    activeGroups,
    newInRange,
    totalMessages: messageTotals[0]?.total ?? 0,
    avgMemberCount: Math.round((avgMemberRaw[0]?.avg ?? 0) * 10) / 10,
    topGroups: topGroups.map(g => ({ name: g.name, messageCount: g.messageCount })),
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION: EVENTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function getEventAnalytics(range) {
  const startDate = getRangeStartDate(range)
  const now = new Date()
  const rangeMatch = startDate ? { createdAt: { $gte: startDate } } : {}

  const [
    active,
    upcoming,
    past,
    createdInRange,
    rsvpTotals,
    topEvents,
    byCollege,
  ] = await Promise.all([
    Event.countDocuments({ isActive: true }),
    Event.countDocuments({ isActive: true, eventDate: { $gt: now } }),
    Event.countDocuments({ isActive: true, eventDate: { $lte: now } }),
    Event.countDocuments({ isActive: true, ...rangeMatch }),
    Event.aggregate([
      { $match: { isActive: true } },
      { $project: { rsvpCount: { $size: '$rsvps' } } },
      { $group: { _id: null, total: { $sum: '$rsvpCount' } } },
    ]),
    Event.aggregate([
      { $match: { isActive: true } },
      { $project: { title: 1, college: 1, rsvpCount: { $size: '$rsvps' } } },
      { $sort: { rsvpCount: -1 } },
      { $limit: 5 },
    ]),
    Event.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$college', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, college: '$_id', count: 1 } },
    ]),
  ])

  return {
    active,
    upcoming,
    past,
    createdInRange,
    totalRsvps: rsvpTotals[0]?.total ?? 0,
    topEvents: topEvents.map(e => ({ title: e.title, college: e.college, rsvpCount: e.rsvpCount })),
    byCollege,
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SECTION: MODERATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function getModerationAnalytics(range) {
  const startDate = getRangeStartDate(range)
  const rangeMatch = startDate ? { createdAt: { $gte: startDate } } : {}

  const [
    activeUserBans,
    activeIpBans,
    actionsInRange,
    byAction,
    activeReports,
    flaggedResources,
    topAdmins,
  ] = await Promise.all([
    UserBan.countDocuments({ isActive: true }),
    IPBan.countDocuments({ isActive: true }),
    AdminLog.countDocuments(rangeMatch),
    AdminLog.aggregate([
      { $match: rangeMatch },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, action: '$_id', count: 1 } },
    ]),
    Post.countDocuments({ reportCount: { $gt: 0 }, isDeleted: false }),
    Resource.countDocuments({ copyrightFlag: true, status: 'pending' }),
    AdminLog.aggregate([
      { $match: rangeMatch },
      { $group: { _id: '$adminId', actionCount: { $sum: 1 } } },
      { $sort: { actionCount: -1 } },
      { $limit: 3 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $project: { _id: 0, username: { $arrayElemAt: ['$user.username', 0] }, actionCount: 1 } },
    ]),
  ])

  return {
    activeUserBans,
    activeIpBans,
    actionsInRange,
    byAction,
    activeReports,
    flaggedResources,
    topAdmins,
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN HANDLER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function GET(request) {
  try {
    // ── Auth guard ──
    const currentUser = await getCurrentUser(request)
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!isAdmin(currentUser)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectDB()

    // ── Validate range param ──
    const { searchParams } = new URL(request.url)
    const rawRange = searchParams.get('range') ?? '30d'
    const range = VALID_RANGES.includes(rawRange) ? rawRange : '30d'

    // ── Run all sections in parallel ──
    const [users, content, coins, resources, chats, events, moderation] = await Promise.all([
      getUserAnalytics(range),
      getContentAnalytics(range),
      getCoinAnalytics(range),
      getResourceAnalytics(range),
      getChatAnalytics(range),
      getEventAnalytics(range),
      getModerationAnalytics(range),
    ])

    return NextResponse.json({
      fetchedAt: new Date().toISOString(),
      range,
      users,
      content,
      coins,
      resources,
      chats,
      events,
      moderation,
    })
  } catch (err) {
    console.error('[Analytics API]', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
