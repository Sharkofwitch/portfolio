"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePhotoViewStats } from "@/lib/photo-view-stats";

interface PhotoData {
  id: string;
  title: string;
  path?: string;
  thumbnail?: string;
  description?: string;
  src?: string;
  [key: string]: unknown;
}

interface PhotoStatsProps {
  photoData?: Record<string, PhotoData>; // Optional photo data mapping id -> photo data
}

export const PhotoAnalytics: React.FC<PhotoStatsProps> = ({
  photoData = {},
}) => {
  const { getMostViewedPhotos, getRecentlyViewedPhotos, clearViewStats } =
    usePhotoViewStats();
  const [mostViewed, setMostViewed] = useState<
    Array<{ photoId: string; views: number; lastViewed: string }>
  >([]);
  const [recentlyViewed, setRecentlyViewed] = useState<
    Array<{ photoId: string; views: number; lastViewed: string }>
  >([]);
  const [tab, setTab] = useState<"popular" | "recent">("popular");

  useEffect(() => {
    // Update stats on mount
    const updateStats = () => {
      const popular = getMostViewedPhotos(10);
      const recent = getRecentlyViewedPhotos(10);

      setMostViewed(popular);
      setRecentlyViewed(recent);
    };

    updateStats();
    // Set up an interval to refresh stats periodically
    const intervalId = setInterval(updateStats, 10000); // every 10 seconds

    return () => clearInterval(intervalId);
  }, [getMostViewedPhotos, getRecentlyViewedPhotos]);

  // Helper to format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Helper to get photo info
  const getPhotoInfo = (photoId: string) => {
    return photoData[photoId] || { title: "Unknown Photo", src: "" };
  };

  // Function to safely get image URL with type checking
  const getPhotoUrl = (photo: PhotoData): string => {
    const photoSrc = photo?.src;
    if (!photoSrc || typeof photoSrc !== "string") return "";

    return photoSrc.startsWith("/")
      ? `/api/photos/${photoSrc.split("/").pop()}`
      : photoSrc;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Photo Analytics</h2>
        <button
          onClick={() => {
            if (
              confirm(
                "Are you sure you want to clear all photo view statistics?",
              )
            ) {
              clearViewStats();
              setMostViewed([]);
              setRecentlyViewed([]);
            }
          }}
          className="text-sm text-red-500 hover:text-red-700"
        >
          Clear Stats
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 font-medium ${tab === "popular" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
          onClick={() => setTab("popular")}
        >
          Most Viewed
        </button>
        <button
          className={`px-4 py-2 font-medium ${tab === "recent" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
          onClick={() => setTab("recent")}
        >
          Recently Viewed
        </button>
      </div>

      {/* Stats Content */}
      <div className="overflow-hidden">
        <AnimatePresence mode="wait">
          {tab === "popular" ? (
            <motion.div
              key="popular"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {mostViewed.length === 0 ? (
                <p className="text-gray-500 text-center py-6">
                  No view data available yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {mostViewed.map((stat, index) => {
                    const photo = getPhotoInfo(stat.photoId);
                    const imageUrl = getPhotoUrl(photo);

                    return (
                      <div
                        key={stat.photoId}
                        className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="mr-3 font-bold text-xl text-gray-400">
                          {index + 1}
                        </div>
                        <div className="h-12 w-12 relative mr-3 flex-shrink-0">
                          {imageUrl && (
                            <Image
                              src={imageUrl}
                              alt={(photo.title as string) || "Photo"}
                              fill
                              className="object-cover rounded"
                              sizes="48px"
                            />
                          )}
                        </div>
                        <div className="flex-grow">
                          <Link
                            href={`/gallery/${stat.photoId}`}
                            className="font-medium hover:underline"
                          >
                            {photo.title || stat.photoId}
                          </Link>
                          <div className="text-sm text-gray-500">
                            {stat.views} {stat.views === 1 ? "view" : "views"} •
                            Last view: {formatDate(stat.lastViewed)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="recent"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {recentlyViewed.length === 0 ? (
                <p className="text-gray-500 text-center py-6">
                  No recent view data available.
                </p>
              ) : (
                <div className="space-y-4">
                  {recentlyViewed.map((stat) => {
                    const photo = getPhotoInfo(stat.photoId);
                    const imageUrl = getPhotoUrl(photo);

                    return (
                      <div
                        key={stat.photoId}
                        className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="h-12 w-12 relative mr-3 flex-shrink-0">
                          {imageUrl && (
                            <Image
                              src={imageUrl}
                              alt={(photo.title as string) || "Photo"}
                              fill
                              className="object-cover rounded"
                              sizes="48px"
                            />
                          )}
                        </div>
                        <div className="flex-grow">
                          <Link
                            href={`/gallery/${stat.photoId}`}
                            className="font-medium hover:underline"
                          >
                            {photo.title || stat.photoId}
                          </Link>
                          <div className="text-sm text-gray-500">
                            Viewed {formatDate(stat.lastViewed)}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                          {stat.views} {stat.views === 1 ? "view" : "views"}{" "}
                          total
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PhotoAnalytics;
