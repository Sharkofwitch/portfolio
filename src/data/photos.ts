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

const photoData: PhotoData = require('./photos.json');

export type { Photo, PhotoData };
export default photoData;
