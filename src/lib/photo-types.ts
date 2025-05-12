export interface PhotoMetadata {
  id: string;
  src: string;
  title: string;
  alt: string;
  width: number;
  height: number;
  year?: string;
  location?: string;
  camera?: string;
  description?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface PhotoFormData {
  file?: FileList;
  title: string;
  alt: string;
  year?: string;
  location?: string;
  camera?: string;
  description?: string;
}

export interface UploadResponse {
  success: boolean;
  photo?: PhotoMetadata;
  error?: string;
}
