export interface INextcloudPhoto {
  filename: string;
  publicUrl: string;
  metadata?: {
    size: number;
    lastmod: string;
    mime?: string;
  };
}

export interface INextcloudFileStat {
  basename?: string;
  filename: string;
  type: string;
  size: number;
  mime?: string;
  lastmod?: string;
  etag?: string;
}

// Helper type for WebDAV responses
export type WebDAVResponse<T> = T | { data: T };
