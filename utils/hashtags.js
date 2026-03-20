/**
 * Extracts hashtags from a content string.
 * @param {string} content - The content to extract hashtags from.
 * @returns {string[]} An array of unique hashtag strings (without the # symbol).
 */
export function extractHashtags(content) {
  if (!content) return [];

  // Regex: # followed by alphanumeric characters or underscores (1 to 50 chars)
  const hashtagRegex = /#([a-zA-Z0-9_]{1,50})/g;
  const matches = content.matchAll(hashtagRegex);
  
  const hashtags = new Set();
  for (const match of matches) {
    const tag = match[1].toLowerCase();
    if (tag) {
      hashtags.add(tag);
    }
  }

  // Return max 10 unique hashtags as string array
  return Array.from(hashtags).slice(0, 10);
}

/**
 * Renders content with hashtag segments for clickable rendering.
 * @param {string} content - The raw content string.
 * @returns {Array<{type: 'text'|'hashtag', value: string}>} Array of segments.
 */
export function renderContentWithHashtags(content) {
  if (!content) return [];

  const hashtagRegex = /#([a-zA-Z0-9_]{1,50})/g;
  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = hashtagRegex.exec(content)) !== null) {
    // Add text before the hashtag
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        value: content.substring(lastIndex, match.index)
      });
    }

    // Add the hashtag segment
    segments.push({
      type: 'hashtag',
      value: match[1] // The tag without #
    });

    lastIndex = hashtagRegex.lastIndex;
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
