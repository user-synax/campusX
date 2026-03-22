/**
 * Renders content with hashtag and mention segments for clickable rendering.
 * @param {string} content - The raw content string.
 * @returns {Array<{type: 'text'|'hashtag'|'mention', value: string}>} Array of segments.
 */
export function renderContentWithMentions(content) {
  if (!content) return [];

  // Regex to match either #hashtags or @mentions
  // Group 1: #hashtag, Group 2: @mention
  const combinedRegex = /(?:#([a-zA-Z0-9_]{1,50}))|(?:@([a-zA-Z0-9_]{3,20}))/g;
  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = combinedRegex.exec(content)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        value: content.substring(lastIndex, match.index)
      });
    }

    if (match[1]) {
      // It's a hashtag
      segments.push({
        type: 'hashtag',
        value: match[1]
      });
    } else if (match[2]) {
      // It's a mention
      segments.push({
        type: 'mention',
        value: match[2]
      });
    }

    lastIndex = combinedRegex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    segments.push({
      type: 'text',
      value: content.substring(lastIndex)
    });
  }

  return segments;
}

/**
 * Legacy support for existing code that only needs hashtags.
 */
export function renderContentWithHashtags(content) {
  return renderContentWithMentions(content).filter(s => s.type !== 'mention');
}

/**
 * Extracts hashtags from a content string.
 * @param {string} content - The content to extract hashtags from.
 * @returns {string[]} An array of unique hashtag strings (without the # symbol).
 */
export function extractHashtags(content) {
  if (!content) return [];

  const hashtagRegex = /#([a-zA-Z0-9_]{1,50})/g;
  const matches = content.matchAll(hashtagRegex);
  
  const hashtags = new Set();
  for (const match of matches) {
    const tag = match[1].toLowerCase();
    if (tag) {
      hashtags.add(tag);
    }
  }

  return Array.from(hashtags).slice(0, 10);
}
