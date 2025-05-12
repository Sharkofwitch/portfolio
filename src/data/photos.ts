interface Photo {
  id: string;
  title: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  year?: string;
  location?: string;
  camera?: string;
  description?: string;
}

interface PhotoData {
  photos: Photo[];
}

import photoData from "./photos.json" assert { type: "json" };

export type { Photo, PhotoData };
export default photoData;
