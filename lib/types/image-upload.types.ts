export interface UploadedImage {
  id: string;
  file?: File;
  url?: string;
  name: string;
  size: number;
  mimeType: string;
  status: "uploading" | "success" | "error";
  error?: string;
}

export interface ImageUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}