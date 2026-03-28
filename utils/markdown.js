// Check if content contains markdown syntax
export function containsMarkdown(text) {
  if (!text || typeof text !== 'string') return false
  
  const mdPatterns = [
    /^#{1,6}\s/m,           // Headings
    /\*\*[^*]+\*\*/,        // Bold
    /\*[^*]+\*/,            // Italic (not inside **)
    /~~[^~]+~~/,            // Strikethrough
    /`[^`]+`/,              // Inline code
    /^\s*[-*+]\s/m,         // Unordered lists
    /^\s*\d+\.\s/m,         // Ordered lists
    /^\s*>/m,               // Blockquotes
    /\[([^\]]+)\]\(([^)]+)\)/, // Links
    /\|(.+)\|(.+)\|/,       // Tables
    /^---$/m,               // Horizontal rules
    /^```/m,                // Code blocks
  ]
  
  return mdPatterns.some(pattern => pattern.test(text))
}
