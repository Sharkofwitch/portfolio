"use client";

/**
 * Debounces a function call
 * @param fn The function to debounce
 * @param delay Delay in milliseconds
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };
}

/**
 * Throttles a function call
 * @param fn The function to throttle
 * @param limit Time limit in milliseconds
 * @returns A throttled version of the function
 */
export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  limit: number,
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastCall >= limit) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      lastCall = now;
      fn(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(
        () => {
          lastCall = Date.now();
          fn(...args);
          timeoutId = null;
        },
        limit - (now - lastCall),
      );
    }
  };
}

/**
 * Checks if the current environment is a browser with fully initialized document
 */
export function isBrowserReady(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof document !== "undefined" &&
    document.readyState === "complete"
  );
}

/**
 * Safe localStorage getter with error handling and optional default value
 */
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  // Early return if not in browser environment or document is not yet fully accessible
  if (typeof window === "undefined" || typeof document === "undefined") {
    return defaultValue;
  }

  try {
    // Check if localStorage is available (might be disabled in some browsers/modes)
    if (!window.localStorage) {
      return defaultValue;
    }

    const value = localStorage.getItem(key);
    if (value === null) return defaultValue;
    return JSON.parse(value) as T;
  } catch (error) {
    // More detailed error logging for debugging
    if (error instanceof SyntaxError) {
      console.error(`Invalid JSON in localStorage for key "${key}":`, error);
    } else {
      console.error(`Error accessing localStorage for key "${key}":`, error);
    }
    return defaultValue;
  }
}

/**
 * Safe localStorage setter with error handling
 */
export function setLocalStorage<T>(key: string, value: T): boolean {
  // Early return if not in browser environment or document is not yet fully accessible
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  try {
    // Check if localStorage is available (might be disabled in some browsers/modes)
    if (!window.localStorage) {
      return false;
    }

    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    // More detailed error handling
    if (
      error instanceof DOMException &&
      (error.name === "QuotaExceededError" ||
        error.name === "NS_ERROR_DOM_QUOTA_REACHED")
    ) {
      console.error(
        `localStorage quota exceeded when setting key "${key}":`,
        error,
      );
    } else {
      console.error(`Error setting key "${key}" in localStorage:`, error);
    }
    return false;
  }
}

/**
 * Ensures an image path is properly formatted for the application
 * @param src The original image source path or URL
 * @returns A properly formatted image path
 */
export function formatImagePath(src: string): string {
  if (!src) {
    return "/placeholder-image.svg";
  }

  // If it's already a complete URL or absolute path, return as is
  if (src.startsWith("http") || src.startsWith("data:")) {
    return src;
  }

  // Get the filename from the path
  const filename = src.split("/").pop();

  // Special handling for timestamp-based filenames (e.g., 1747175977747-playground-poise.jpeg)
  // These need to be handled consistently across the application
  if (filename && /^\d{13}-/.test(filename)) {
    // Always use the API route for timestamp-based filenames to ensure proper loading
    return `/api/photos/${filename}`;
  }

  // If it's already properly formatted with /api/photos/ prefix, return as is
  if (src.startsWith("/api/photos/")) {
    return src;
  }

  // If it's using /photos/ prefix, convert it to use the API route
  if (src.startsWith("/photos/")) {
    return src.replace("/photos/", "/api/photos/");
  }

  // If it's just a filename, add the proper API prefix
  if (!src.startsWith("/")) {
    return `/api/photos/${src}`;
  }

  // For any other format, use the API route with the filename
  return `/api/photos/${src.split("/").pop()}`;
}
