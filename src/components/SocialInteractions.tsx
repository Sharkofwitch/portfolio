"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSpring, animated } from "@react-spring/web";
import {
  AiOutlineHeart,
  AiFillHeart,
  AiOutlineComment,
  AiOutlineShareAlt,
  AiOutlineClose,
} from "react-icons/ai";
import LikeAnimation from "./LikeAnimation";
import { useToasts } from "./ToastProvider";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoId: string;
  photoTitle: string;
}

// Helper function to generate a browser fingerprint
async function generateBrowserFingerprint() {
  const components = [
    navigator.userAgent,
    navigator.language,
    new Date().getTimezoneOffset(),
    screen.width,
    screen.height,
    screen.colorDepth,
  ].join("|");

  // Use a hash function to create a consistent identifier
  const encoder = new TextEncoder();
  const data = encoder.encode(components);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Social data hooks with server-side persistence
const useSocialData = () => {
  const [socialData, setSocialData] = useState<
    Record<
      string,
      {
        likes: number;
        isLiked: boolean;
        comments: {
          id: string;
          userName: string;
          text: string;
          createdAt: string;
        }[];
      }
    >
  >({});

  const fetchPhotoData = async (photoId: string) => {
    try {
      const response = await fetch(`/api/social/${photoId}`);
      const data = await response.json();

      // Always update the state with the response data, even if it contains an error
      // This ensures we at least have the fallback values
      setSocialData((prev) => ({
        ...prev,
        [photoId]: {
          likes: data.likes ?? 0,
          isLiked: data.isLiked ?? false,
          comments: data.comments ?? [],
        },
      }));

      return data;
    } catch (error) {
      console.error("Error fetching social data:", error);
      // Return safe fallback data
      const fallback = { likes: 0, isLiked: false, comments: [] };
      setSocialData((prev) => ({
        ...prev,
        [photoId]: fallback,
      }));
      return fallback;
    }
  };

  const likePhoto = async (photoId: string) => {
    try {
      // Create a unique identifier for likes based on browser fingerprint
      const uniqueId = await generateBrowserFingerprint();

      // Check if this browser has already liked the photo
      const hasLiked = localStorage.getItem(`like-${photoId}`) === uniqueId;
      const method = hasLiked ? "DELETE" : "POST";

      const response = await fetch("/api/social/like", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, uniqueId }),
      });

      const data = await response.json();
      if (response.ok) {
        // Save or remove like state from localStorage
        if (method === "POST") {
          localStorage.setItem(`like-${photoId}`, uniqueId);
        } else {
          localStorage.removeItem(`like-${photoId}`);
        }

        setSocialData((prev) => ({
          ...prev,
          [photoId]: {
            ...prev[photoId],
            likes: data.likes,
            isLiked: method === "POST",
          },
        }));
        return true;
      }
      throw new Error(data.error || "Failed to process like");
    } catch (error) {
      console.error("Error processing like:", error);
      return false;
    }
  };

  const addComment = async (
    photoId: string,
    text: string,
    userName?: string,
  ) => {
    try {
      const response = await fetch("/api/social/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoId, text, userName }),
      });

      const data = await response.json();
      if (response.ok) {
        setSocialData((prev) => ({
          ...prev,
          [photoId]: {
            ...prev[photoId],
            comments: [data.comment, ...(prev[photoId]?.comments || [])],
          },
        }));
        return true;
      }
      throw new Error(data.error || "Failed to add comment");
    } catch (error) {
      console.error("Error adding comment:", error);
      return false;
    }
  };

  const getPhotoData = (photoId: string) => {
    const data = socialData[photoId];
    if (!data) {
      // Fetch if we don't have the data
      fetchPhotoData(photoId);
      return { likes: 0, isLiked: false, comments: [] };
    }
    return data;
  };

  return { likePhoto, addComment, getPhotoData };
};

// Share Modal Component
const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  photoId,
  photoTitle,
}) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToasts();

  // Create a direct link to the photo with proper slug format
  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/gallery/${encodeURIComponent(photoTitle.toLowerCase().replace(/\s+/g, "-"))}-${photoId}`
      : "";

  const animation = useSpring({
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? "translateY(0)" : "translateY(40px)",
    config: { mass: 0.5, tension: 280, friction: 20 },
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    showToast("Link copied to clipboard!", "success", 2000);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    let url = "";
    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=Check out this amazing photo: ${encodeURIComponent(photoTitle)}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case "email":
        url = `mailto:?subject=Check out this amazing photo&body=${encodeURIComponent(photoTitle)}: ${encodeURIComponent(shareUrl)}`;
        break;
    }

    window.open(url, "_blank");
    showToast(`Shared on ${platform}!`, "info");
  };

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <animated.div
          style={animation}
          className="bg-white dark:bg-gray-900 rounded-xl p-5 max-w-md w-full shadow-2xl relative"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Share this photo</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <AiOutlineClose size={24} />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Share &quot;{photoTitle || "Photo"}&quot;
            </p>
            <div className="flex space-x-4 justify-center py-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.97 }}
                className="social-share-button"
                onClick={() => handleShare("twitter")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.97 }}
                className="social-share-button"
                onClick={() => handleShare("facebook")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
                </svg>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.97 }}
                className="social-share-button"
                onClick={() => handleShare("linkedin")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6.94 5a2 2 0 1 1-4-.002 2 2 0 0 1 4 .002zM7 8.48H3V21h4V8.48zm6.32 0H9.34V21h3.94v-6.57c0-3.66 4.77-4 4.77 0V21H22v-7.93c0-6.17-7.06-5.94-8.72-2.91l.04-1.68z" />
                </svg>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.97 }}
                className="social-share-button"
                onClick={() => handleShare("email")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                </svg>
              </motion.button>
            </div>
          </div>

          <div className="border dark:border-gray-700 rounded-lg overflow-hidden flex">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-grow p-3 bg-gray-50 dark:bg-gray-800 border-0 outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </animated.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Comment Section Component
interface CommentSectionProps {
  isOpen: boolean;
  onClose: () => void;
  photoId: string;
  photoTitle: string;
}

// Comment Section Component
const CommentSection: React.FC<CommentSectionProps> = ({
  isOpen,
  onClose,
  photoId,
}) => {
  const [comment, setComment] = useState("");
  const [userName, setUserName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addComment, getPhotoData } = useSocialData();
  const photoData = getPhotoData(photoId);
  const commentInputRef = React.useRef<HTMLInputElement>(null);
  const nameInputRef = React.useRef<HTMLInputElement>(null);
  const { showToast } = useToasts();

  // Load saved username from localStorage if available
  useEffect(() => {
    const savedName = localStorage.getItem("lastUserName");
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  const animation = useSpring({
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? "translateY(0)" : "translateY(40px)",
    config: { mass: 0.5, tension: 280, friction: 20 },
  });

  // Focus the comment input when modal opens
  useEffect(() => {
    if (isOpen && commentInputRef.current) {
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const generateRandomName = () => {
    const adjectives = [
      // Personality traits
      "Happy",
      "Curious",
      "Creative",
      "Gentle",
      "Bright",
      "Swift",
      "Kind",
      "Wise",
      // Nature-inspired
      "Misty",
      "Starlit",
      "Autumn",
      "Solar",
      "Lunar",
      "Twilight",
      "Forest",
      "Ocean",
      // Emotional states
      "Serene",
      "Whimsical",
      "Dreamy",
      "Mystic",
      "Radiant",
      "Ethereal",
      "Tranquil",
      "Vibrant",
      // Abstract concepts
      "Infinite",
      "Cosmic",
      "Silent",
      "Eternal",
      "Crystal",
      "Phantom",
      "Ancient",
      "Astral",
    ];
    const nouns = [
      // Travelers and seekers
      "Explorer",
      "Wanderer",
      "Artist",
      "Dreamer",
      "Traveler",
      "Observer",
      "Visitor",
      // Mystical beings
      "Spirit",
      "Phoenix",
      "Dragon",
      "Oracle",
      "Muse",
      "Guardian",
      "Sage",
      "Nomad",
      // Nature elements
      "Whisper",
      "Wave",
      "Storm",
      "Shadow",
      "Aurora",
      "Breeze",
      "Echo",
      "Galaxy",
      // Poetic objects
      "Compass",
      "Lantern",
      "Chronicle",
      "Prism",
      "Scroll",
      "Quill",
      "Relic",
      "Ember",
    ];
    const randomAdjective =
      adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdjective}${randomNoun}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      setIsSubmitting(true);

      // Use provided name or generate a random one
      const finalUserName = userName.trim() || generateRandomName();

      // Save username for future use
      localStorage.setItem("lastUserName", finalUserName);
      setUserName(finalUserName);

      // Simulate a small delay for better UX
      setTimeout(() => {
        addComment(photoId, comment, finalUserName);
        showToast("Comment added successfully!", "success");
        setComment("");
        setIsSubmitting(false);
      }, 300);
    }
  };

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins === 1 ? "" : "s"} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

    return date.toLocaleDateString();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <animated.div
          style={animation}
          className="bg-white dark:bg-gray-900 rounded-xl p-5 max-w-md w-full shadow-2xl max-h-[80vh] flex flex-col"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">Comments</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <AiOutlineClose size={24} />
            </button>
          </div>

          <div className="mb-4 overflow-auto flex-grow">
            {photoData.comments.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-gray-500 dark:text-gray-400 py-8 flex flex-col items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mb-3 opacity-60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p>No comments yet. Be the first to comment!</p>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {photoData.comments.map((comment, index) => (
                  <motion.div
                    key={comment.id}
                    className="border-b dark:border-gray-800 pb-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div className="flex items-center mb-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-2 text-white">
                        {comment.userName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{comment.userName}</span>
                      <motion.span
                        className="ml-auto text-xs text-gray-500"
                        title={new Date(comment.createdAt).toLocaleString()}
                      >
                        {formatDate(comment.createdAt)}
                      </motion.span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 pl-10">
                      {comment.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-auto space-y-3">
            <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
              <input
                ref={nameInputRef}
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border-0 border-b dark:border-gray-700 outline-none text-sm"
                disabled={isSubmitting}
              />
              <div className="flex">
                <input
                  ref={commentInputRef}
                  type="text"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-grow p-3 bg-gray-50 dark:bg-gray-800 border-0 outline-none"
                  disabled={isSubmitting}
                />
                <motion.button
                  type="submit"
                  disabled={!comment.trim() || isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center justify-center min-w-[80px]"
                  whileHover={{ backgroundColor: "#2563eb" }}
                  whileTap={{ scale: 0.97 }}
                >
                  {isSubmitting ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                      }}
                    >
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 4.75V6.25"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                        <path
                          d="M17.127 6.873L16.073 7.927"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                        <path
                          d="M19.25 12L17.75 12"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                        <path
                          d="M17.127 17.127L16.073 16.073"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                        <path
                          d="M12 19.25V17.75"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                        <path
                          d="M7.927 16.073L6.873 17.127"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                        <path
                          d="M6.25 12L4.75 12"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                        <path
                          d="M7.927 7.927L6.873 6.873"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </svg>
                    </motion.div>
                  ) : (
                    "Post"
                  )}
                </motion.button>
              </div>
            </div>
          </form>
        </animated.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main SocialActions Component
interface SocialActionsProps {
  photoId: string;
  photoTitle: string;
  className?: string;
  size?: number;
}

export const SocialActions: React.FC<SocialActionsProps> = ({
  photoId,
  photoTitle,
  className = "",
  size = 24,
}) => {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCommentSectionOpen, setIsCommentSectionOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { likePhoto, getPhotoData } = useSocialData();
  const photoData = getPhotoData(photoId);
  const { showToast } = useToasts();

  // Create more dynamic spring animation
  const likeSpring = useSpring({
    scale: photoData.isLiked ? (isAnimating ? 1.5 : 1.2) : 1,
    rotate: photoData.isLiked ? (isAnimating ? 20 : 0) : 0,
    config: {
      tension: 400,
      friction: 15,
      duration: isAnimating ? 600 : 200,
    },
  });

  const handleLikeClick = () => {
    likePhoto(photoId);

    if (!photoData.isLiked) {
      // Only animate when liking, not un-liking
      setIsAnimating(true);
      showToast(`You liked "${photoTitle || "this photo"}"!`, "success", 1500);
      setTimeout(() => setIsAnimating(false), 600);
    } else {
      showToast(`You unliked "${photoTitle || "this photo"}"`, "info", 1500);
    }
  };

  return (
    <>
      <div className={`flex items-center space-x-4 ${className}`}>
        <div className="flex items-center relative">
          <animated.button
            style={likeSpring}
            onClick={handleLikeClick}
            className="focus:outline-none mr-1"
            aria-label="Like"
          >
            {photoData.isLiked ? (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                whileTap={{ scale: 0.9 }}
              >
                <AiFillHeart size={size} className="text-red-500" />
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <AiOutlineHeart size={size} />
              </motion.div>
            )}
          </animated.button>

          {/* Heart animation particles effect */}
          <LikeAnimation isActive={isAnimating} size={size} />

          {photoData.likes > 0 && (
            <motion.span
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-medium ml-1"
              key={`likes-${photoId}-${photoData.likes}`} // Re-render animation when count changes with unique key
            >
              {photoData.likes}
            </motion.span>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCommentSectionOpen(true)}
          className="focus:outline-none relative"
          aria-label="Comments"
        >
          <AiOutlineComment size={size} />
          <AnimatePresence>
            {photoData.comments.length > 0 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full h-4 min-w-4 flex items-center justify-center px-1"
                key={`comments-${photoId}-${photoData.comments.length}`} // Re-render when comment count changes with unique key
              >
                {photoData.comments.length}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1, rotate: 15 }}
          whileTap={{ scale: 0.9, rotate: 0 }}
          onClick={() => {
            setIsShareModalOpen(true);
            showToast(`Sharing "${photoTitle || "this photo"}"!`, "info", 1500);
          }}
          className="focus:outline-none"
          aria-label="Share"
        >
          <AiOutlineShareAlt size={size} />
        </motion.button>
      </div>

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        photoId={photoId}
        photoTitle={photoTitle}
      />

      <CommentSection
        isOpen={isCommentSectionOpen}
        onClose={() => setIsCommentSectionOpen(false)}
        photoId={photoId}
        photoTitle={photoTitle}
      />
    </>
  );
};
