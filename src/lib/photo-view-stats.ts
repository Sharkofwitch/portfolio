"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getLocalStorage, setLocalStorage } from "./utils";

type ViewStats = Record<
  string,
  {
    views: number;
    lastViewed: string;
    history: { timestamp: string; referrer?: string }[];
  }
>;

const STATS_STORAGE_KEY = "portfolioViewStats";
const VIEW_COOLDOWN_MS = 30000; // 30 seconds

// A safe browser environment detection utility
const isBrowser = () => {
  return (
    typeof window !== "undefined" &&
    typeof document !== "undefined" &&
    document.readyState !== "loading"
  );
};

export const usePhotoViewStats = () => {
  // Using a ref to track if we've initialized from localStorage
  const hasHydratedRef = useRef(false);
  // Track component mount state
  const isMountedRef = useRef(false);
  // Track if browser is ready
  const isBrowserReadyRef = useRef(false);
  // Track active views to prevent double-counting
  const activeViewsRef = useRef<Record<string, number>>({});

  const [viewStats, setViewStats] = useState<ViewStats>({});

  // Check if the browser is ready for localStorage operations
  useEffect(() => {
    // Using RAF to ensure we're in a browser paint cycle
    if (isBrowser()) {
      // requestAnimationFrame only runs in browser context after hydration
      requestAnimationFrame(() => {
        isBrowserReadyRef.current = true;
        // Now it's safe to load from localStorage
        if (!hasHydratedRef.current) {
          try {
            const savedStats = getLocalStorage<ViewStats>(
              STATS_STORAGE_KEY,
              {},
            );
            setViewStats(savedStats);
          } catch (err) {
            console.error("Failed to load view stats:", err);
            // Fallback to empty stats if localStorage access fails
            setViewStats({});
          } finally {
            hasHydratedRef.current = true;
          }
        }
        isMountedRef.current = true;
      });
    }

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Save to localStorage when data changes, but not on initial load
  useEffect(() => {
    // Only save if we've already loaded from localStorage
    if (
      hasHydratedRef.current &&
      isMountedRef.current &&
      isBrowserReadyRef.current
    ) {
      // We debounce this to avoid excessive writes
      const timeoutId = setTimeout(() => {
        setLocalStorage(STATS_STORAGE_KEY, viewStats);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [viewStats]);

  // Safe record view function that won't cause hydration mismatches
  const recordView = useCallback((photoId: string, referrer?: string) => {
    // Enhanced defense against SSR and invalid data
    if (!photoId || !isBrowserReadyRef.current || !isMountedRef.current) {
      return;
    }

    // Using requestAnimationFrame to ensure we're in a browser paint cycle
    requestAnimationFrame(() => {
      try {
        // Prevent recording multiple views of the same photo within cooldown period
        const now = Date.now();
        const lastViewTime = activeViewsRef.current[photoId] || 0;

        if (now - lastViewTime < VIEW_COOLDOWN_MS) {
          return; // Still in cooldown period
        }

        // Update the last view timestamp
        activeViewsRef.current[photoId] = now;
        const timestamp = new Date().toISOString();

        // Only update if component is still mounted
        if (isMountedRef.current) {
          setViewStats((prev) => {
            const current = prev[photoId] || {
              views: 0,
              lastViewed: "",
              history: [],
            };

            return {
              ...prev,
              [photoId]: {
                views: current.views + 1,
                lastViewed: timestamp,
                history: [
                  ...current.history.slice(-9), // Keep last 10 entries max
                  { timestamp, referrer },
                ],
              },
            };
          });
        }
      } catch (error) {
        console.error("Error recording photo view:", error);
      }
    });
  }, []);

  const getPhotoViewStats = useCallback(
    (photoId: string) => {
      return viewStats[photoId] || { views: 0, lastViewed: "", history: [] };
    },
    [viewStats],
  );

  const getMostViewedPhotos = useCallback(
    (limit = 5) => {
      return Object.entries(viewStats)
        .map(([photoId, stats]) => ({ photoId, ...stats }))
        .sort((a, b) => b.views - a.views)
        .slice(0, limit);
    },
    [viewStats],
  );

  const getRecentlyViewedPhotos = useCallback(
    (limit = 5) => {
      return Object.entries(viewStats)
        .map(([photoId, stats]) => ({ photoId, ...stats }))
        .sort(
          (a, b) =>
            new Date(b.lastViewed).getTime() - new Date(a.lastViewed).getTime(),
        )
        .slice(0, limit);
    },
    [viewStats],
  );

  const clearViewStats = useCallback(() => {
    setViewStats({});
    activeViewsRef.current = {};
  }, []);

  return {
    recordView,
    getPhotoViewStats,
    getMostViewedPhotos,
    getRecentlyViewedPhotos,
    clearViewStats,
  };
};
