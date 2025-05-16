// This file is used to declare the CSS module for social-interactions.css
// It allows TypeScript to understand the module imports and suppresses warnings

// For global stylesheets (imported with plain import)
declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

// For specific styled elements
export const socialShareButton: string;
export const likeAnimation: string;
export const commentNew: string;
export const modalOverlay: string;
export const notificationToast: string;
export const heartParticle: string;
