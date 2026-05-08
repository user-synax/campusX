"use client";

import { useState, useEffect, useCallback } from "react";

const RECENT_EMOJIS_KEY = "campuszen_recent_emojis";
const FAVORITE_EMOJIS_KEY = "campuszen_favorite_emojis";
const MAX_RECENT = 20;
const MAX_FAVORITES = 30;

export function useRecentEmojis() {
  const [recentEmojis, setRecentEmojis] = useState([]);
  const [favoriteEmojis, setFavoriteEmojis] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRecent = localStorage.getItem(RECENT_EMOJIS_KEY);
      const savedFavorites = localStorage.getItem(FAVORITE_EMOJIS_KEY);
      
      if (savedRecent) {
        try {
          setRecentEmojis(JSON.parse(savedRecent));
        } catch (e) {
          console.error("Error parsing recent emojis:", e);
        }
      }
      
      if (savedFavorites) {
        try {
          setFavoriteEmojis(JSON.parse(savedFavorites));
        } catch (e) {
          console.error("Error parsing favorite emojis:", e);
        }
      }
      
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage
  const saveToStorage = useCallback((key, data) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(data));
    }
  }, []);

  // Add emoji to recent
  const addRecentEmoji = useCallback((emoji) => {
    setRecentEmojis(prev => {
      const filtered = prev.filter(e => e !== emoji);
      const updated = [emoji, ...filtered].slice(0, MAX_RECENT);
      saveToStorage(RECENT_EMOJIS_KEY, updated);
      return updated;
    });
  }, [saveToStorage]);

  // Toggle favorite emoji
  const toggleFavoriteEmoji = useCallback((emoji) => {
    setFavoriteEmojis(prev => {
      const exists = prev.includes(emoji);
      let updated;
      if (exists) {
        updated = prev.filter(e => e !== emoji);
      } else {
        updated = [emoji, ...prev].slice(0, MAX_FAVORITES);
      }
      saveToStorage(FAVORITE_EMOJIS_KEY, updated);
      return updated;
    });
  }, [saveToStorage]);

  // Check if emoji is favorite
  const isFavorite = useCallback((emoji) => {
    return favoriteEmojis.includes(emoji);
  }, [favoriteEmojis]);

  // Clear recent emojis
  const clearRecentEmojis = useCallback(() => {
    setRecentEmojis([]);
    saveToStorage(RECENT_EMOJIS_KEY, []);
  }, [saveToStorage]);

  // Clear favorite emojis
  const clearFavoriteEmojis = useCallback(() => {
    setFavoriteEmojis([]);
    saveToStorage(FAVORITE_EMOJIS_KEY, []);
  }, [saveToStorage]);

  return {
    recentEmojis,
    favoriteEmojis,
    isLoaded,
    addRecentEmoji,
    toggleFavoriteEmoji,
    isFavorite,
    clearRecentEmojis,
    clearFavoriteEmojis
  };
}
