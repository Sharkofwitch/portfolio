/**
 * @deprecated This component has been replaced with AnimatedImageGrid for better performance and functionality.
 * Please use AnimatedImageGrid instead.
 * 
 * Migration guide:
 * - Import AnimatedImageGrid instead of GalleryGrid
 * - Props interface is compatible, but AnimatedImageGrid has additional features:
 *   - Better error handling for missing images
 *   - Improved animations and performance
 *   - Search and filter capabilities
 *   - Responsive design optimizations
 * 
 * @see {@link ./AnimatedImageGrid.tsx} for the new implementation
 */

import AnimatedImageGrid from './AnimatedImageGrid';

// Re-export AnimatedImageGrid as GalleryGrid for backward compatibility
export default AnimatedImageGrid;

// Also export with the old name for gradual migration
export { default as GalleryGrid } from './AnimatedImageGrid';

// Note: This file will be removed in a future version.
// Please update your imports to use AnimatedImageGrid directly.