"use client";

import { motion } from "framer-motion";
import { PhotoMetadata } from "@/lib/photo-types";

export type SortOption = "newest" | "oldest" | "title";

interface GalleryFilterBarProps {
  photos: PhotoMetadata[];
  activeCamera: string;
  activeSort: SortOption;
  onCameraChange: (camera: string) => void;
  onSortChange: (sort: SortOption) => void;
  filteredCount: number;
}

/**
 * GalleryFilterBar – displays camera-based filter chips and a sort selector
 * above the gallery grid. Cameras are derived from photo metadata.
 */
export default function GalleryFilterBar({
  photos,
  activeCamera,
  activeSort,
  onCameraChange,
  onSortChange,
  filteredCount,
}: GalleryFilterBarProps) {
  // Derive unique camera names from the photos list
  const cameras = Array.from(
    new Set(
      photos
        .map((p) => p.camera?.trim())
        .filter((c): c is string => Boolean(c)),
    ),
  );

  const sortLabels: Record<SortOption, string> = {
    newest: "Newest",
    oldest: "Oldest",
    title: "Title A–Z",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8 px-1"
    >
      {/* Camera filter chips */}
      <div className="flex flex-wrap gap-2 flex-1">
        <FilterChip
          label="All"
          active={activeCamera === "all"}
          onClick={() => onCameraChange("all")}
        />
        {cameras.map((cam) => (
          <FilterChip
            key={cam}
            label={cam}
            active={activeCamera === cam}
            onClick={() => onCameraChange(cam)}
          />
        ))}
      </div>

      {/* Sort + count */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="font-mono text-xs text-white/40">
          {filteredCount} photos
        </span>

        <div className="relative">
          <select
            value={activeSort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="appearance-none bg-white/5 border border-white/10 text-white/70 text-xs font-mono pl-3 pr-7 py-1.5 rounded-full focus:outline-none focus:border-white/30 transition-colors cursor-pointer hover:bg-white/10"
          >
            {(Object.keys(sortLabels) as SortOption[]).map((s) => (
              <option key={s} value={s} className="bg-gray-900 text-white">
                {sortLabels[s]}
              </option>
            ))}
          </select>
          {/* chevron */}
          <svg
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              d="M2 4l4 4 4-4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-mono border transition-all duration-200 ${
        active
          ? "bg-white text-black border-white shadow-sm"
          : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white/80"
      }`}
    >
      {label}
    </motion.button>
  );
}
