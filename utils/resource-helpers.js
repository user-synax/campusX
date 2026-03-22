// ━━━ Category Config — single source of truth ━━━ 
export const CATEGORY_CONFIG = { 
  notes:     { emoji: '📝', label: 'Notes',     color: '#3b82f6', bgColor: '#3b82f610' }, 
  pyq:       { emoji: '📋', label: 'PYQ',       color: '#8b5cf6', bgColor: '#8b5cf610' }, 
  coding:    { emoji: '💻', label: 'Coding',    color: '#10b981', bgColor: '#10b98110' }, 
  formula:   { emoji: '🧮', label: 'Formula',   color: '#f59e0b', bgColor: '#f59e0b10' }, 
  lab:       { emoji: '🔬', label: 'Lab',       color: '#ec4899', bgColor: '#ec489910' }, 
  interview: { emoji: '🎯', label: 'Interview', color: '#ef4444', bgColor: '#ef444410' }, 
  project:   { emoji: '📊', label: 'Project',   color: '#6366f1', bgColor: '#6366f110' }, 
  other:     { emoji: '📌', label: 'Other',     color: '#737373', bgColor: '#73737310' } 
} 
 
export const CATEGORIES_LIST = [ 
  { id: 'all', emoji: '📚', label: 'All' }, 
  ...Object.entries(CATEGORY_CONFIG).map(([id, v]) => ({ 
    id, emoji: v.emoji, label: v.label 
  })) 
] 
 
// ━━━ File helpers ━━━ 
export function formatFileSize(bytes) { 
  if (!bytes || bytes === 0) return '0 B' 
  if (bytes < 1024) return `${bytes} B` 
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB` 
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB` 
} 
 
export function getFileTypeFromMime(mimeType) { 
  if (!mimeType) return null 
  if (mimeType === 'application/pdf') return 'pdf' 
  if (mimeType.startsWith('image/')) return 'image' 
  return null 
} 
 
// ━━━ Copyright risk detection ━━━ 
// These are common publisher names that suggest copyrighted content 
const COPYRIGHT_KEYWORDS = [ 
  'pearson', 'mcgraw-hill', 'mcgraw hill', 'wiley', 'springer', 
  'elsevier', 'oxford press', 'cambridge press', 'cengage', 
  'arihant publication', 'dc pandey', 'hc verma', 'irodov', 
  'griffiths', 'serway', 'halliday resnick', 'kiran prakashan', 
  'made easy', 'gate academy', 'r.s. aggarwal', 'rs aggarwal', 
  'rd sharma', 'ncert solution', 'full book', 'complete book' 
] 
 
export function detectCopyrightRisk(title, fileName) { 
  const combined = `${title || ''} ${fileName || ''}`.toLowerCase() 
  return COPYRIGHT_KEYWORDS.some(kw => combined.includes(kw)) 
} 
 
// ━━━ Tag processor ━━━ 
export function processTags(tagsInput) { 
  if (!tagsInput) return [] 
  const raw = Array.isArray(tagsInput) 
    ? tagsInput 
    : tagsInput.split(',') 
 
  return raw 
    .map(t => t.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '')) 
    .filter(t => t.length > 0 && t.length <= 30) 
    .slice(0, 5)  // max 5 tags 
} 
 
// ━━━ Semester validator ━━━ 
export function validateSemester(value) { 
  if (!value && value !== 0) return null 
  const num = parseInt(value) 
  if (isNaN(num)) return null 
  if (num < 1 || num > 12) return null 
  return num 
} 
