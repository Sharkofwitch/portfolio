"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { PhotoFormData, PhotoMetadata } from "@/lib/photo-types";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PhotoFormData>();
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<PhotoMetadata[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<PhotoMetadata | null>(null);

  // Watch file input for preview
  const fileWatch = watch("file");
  useEffect(() => {
    if (fileWatch?.[0]) {
      const url = URL.createObjectURL(fileWatch[0]);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [fileWatch]);

  // Authentication handling
  useEffect(() => {
    console.log("Auth status:", status);
    console.log("Session data:", session);

    const handleAuth = async () => {
      // Wait for authentication to complete
      if (status === "loading") {
        console.log("Authentication status is loading...");
        return;
      }

      if (status === "unauthenticated") {
        console.log("⚠️ Not authenticated, redirecting to login page");
        // Add a small delay to make sure the redirection is obvious and not quick-flashing
        setTimeout(() => {
          // Force page navigation
          window.location.href = "/admin/login";
        }, 200);
      } else if (status === "authenticated") {
        if (!session?.user?.role) {
          console.log(
            "⚠️ User has no role defined in session. Current session:",
            session,
          );
          // Try to refresh the session first
          try {
            const response = await fetch("/api/auth/session?update=true");
            if (response.ok) {
              // Wait for session to update before checking again
              setTimeout(() => {
                if (session?.user?.role === "admin") {
                  fetchPhotos();
                } else {
                  window.location.href = "/";
                }
              }, 500);
              return;
            }
          } catch (error) {
            console.error("Error refreshing session:", error);
          }
          window.location.href = "/";
        } else if (session.user.role !== "admin") {
          console.log(
            `⚠️ User does not have admin role (has ${session.user.role}), redirecting to home`,
          );
          window.location.href = "/";
        } else {
          console.log("✅ Admin authenticated with role:", session.user.role);
          console.log("Fetching photos for admin panel...");
          try {
            await fetchPhotos();
          } catch (error) {
            console.error("Error fetching photos:", error);
          }
        }
      }

      // Authentication process is complete
      setLoading(false);
    };

    handleAuth();
  }, [status, session, router]);

  const onSubmit = async (data: PhotoFormData) => {
    try {
      setUploading(true);
      console.log("Starting upload process with data:", data);

      const formData = new FormData();

      // Handle file upload for new photos
      if (data.file?.[0]) {
        const file = data.file[0];
        console.log("File selected:", file.name, file.size, "bytes", file.type);

        // Clone the file to ensure we're not using a potentially stale reference
        const fileBlob = new Blob([await file.arrayBuffer()], {
          type: file.type,
        });
        const freshFile = new File([fileBlob], file.name, { type: file.type });

        formData.append("file", freshFile);
        console.log("File appended to FormData");
      } else if (!editingPhoto) {
        console.error("No file selected for new photo upload");
        alert("Please select a file to upload");
        setUploading(false);
        return;
      }

      // Add all metadata fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "file" && value !== undefined && value !== "") {
          formData.append(key, value.toString());
          console.log(`Added form field: ${key}=${value.toString()}`);
        }
      });

      // Handle PUT for edit, POST for new upload
      const method = editingPhoto ? "PUT" : "POST";
      if (editingPhoto) {
        formData.append("id", editingPhoto.id);
        console.log(`Editing photo with ID: ${editingPhoto.id}`);
      } else {
        console.log("Creating new photo entry");
      }

      // Determine if we're in Vercel to use the optimized endpoint
      const isVercelEnv = process.env.NEXT_PUBLIC_VERCEL === "1";
      const endpoint =
        !editingPhoto && isVercelEnv ? "/api/vercel-upload" : "/api/photos";

      console.log(`Sending ${method} request to ${endpoint}`);
      console.log(`Environment: ${isVercelEnv ? "Vercel" : "Development"}`);

      let responseData = null;
      try {
        const response = await fetch(endpoint, {
          method,
          body: formData,
        });

        // Try to parse response JSON
        responseData = await response.json().catch((e) => {
          console.error("Failed to parse response JSON:", e);
          return null;
        });

        console.log("API response:", response.status, responseData);

        if (!response.ok) {
          const errorMessage = responseData?.error || "Failed to save photo";
          const errorDetails = responseData?.details
            ? `: ${responseData.details}`
            : "";
          throw new Error(`${errorMessage}${errorDetails}`);
        }

        console.log("Photo saved successfully");
        reset();
        setPreviewUrl(null);
        setEditingPhoto(null);

        // Delay fetch to give backend time to process
        setTimeout(() => {
          fetchPhotos();
        }, 500);
      } catch (apiError) {
        console.error("API error:", apiError);
        throw apiError;
      }
    } catch (error) {
      console.error("Error handling photo:", error);
      alert(
        `Failed to save photo: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setUploading(false);
    }
  };

  const fetchPhotos = async () => {
    try {
      console.log("Fetching photos for admin panel...");
      const response = await fetch("/api/photos");

      if (response.ok) {
        const data = await response.json();
        console.log("Admin: Photos data received:", data);

        if (Array.isArray(data)) {
          console.log(`Setting ${data.length} photos from array`);
          setPhotos(data);
        } else if (data.photos) {
          console.log(`Setting ${data.photos.length} photos from data.photos`);
          setPhotos(data.photos);
        } else if (data.success && data.photos) {
          console.log(
            `Setting ${data.photos.length} photos from data.success.photos`,
          );
          setPhotos(data.photos);
        } else {
          console.warn("Unexpected photos data format:", data);
        }
        return data;
      } else {
        console.error(
          "Failed to fetch photos:",
          response.status,
          response.statusText,
        );
        try {
          const errorData = await response.json();
          console.error("Error details:", errorData);
        } catch {
          // Ignore parse errors
        }
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
    }
    return null;
  };

  const deletePhoto = async (id: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return;

    try {
      const response = await fetch(`/api/photos?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchPhotos();
      } else {
        throw new Error("Failed to delete photo");
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Failed to delete photo. Please try again.");
    }
  };

  const startEditing = (photo: PhotoMetadata) => {
    setEditingPhoto(photo);
    setValue("title", photo.title);
    setValue("alt", photo.alt);
    setValue("year", photo.year || "");
    setValue("location", photo.location || "");
    setValue("camera", photo.camera || "");
    setValue("description", photo.description || "");
    setPreviewUrl(photo.src);
  };

  // If still loading auth status, show loading indicator
  if (loading || status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent border-[rgb(var(--foreground))] animate-spin mb-4"></div>
        <p className="text-[rgb(var(--foreground))] font-medium opacity-80">
          Loading admin panel...
        </p>
        <p className="text-[rgb(var(--foreground))] text-sm mt-2 opacity-70">
          {status === "loading"
            ? "Authenticating user..."
            : "Loading content..."}
        </p>
      </div>
    );
  }

  // Once loaded, if not authenticated or not admin, return null (redirection happens in useEffect)
  if (status !== "authenticated" || session?.user?.role !== "admin") {
    return null;
  }

  // Only render admin content if authenticated and admin
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-[rgb(var(--foreground))]">
        Photo Management
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-[rgb(var(--foreground))]">
            {editingPhoto ? "Edit Photo" : "Upload New Photo"}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!editingPhoto && (
              <div>
                <label className="block text-sm font-medium text-[rgb(var(--foreground))]">
                  Photo File
                </label>
                <input
                  type="file"
                  accept="image/*"
                  {...register("file", { required: !editingPhoto })}
                  className="mt-1 block w-full admin-input file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                />
                {errors.file && (
                  <span className="text-red-500 dark:text-red-400 font-medium">
                    Photo file is required
                  </span>
                )}
              </div>
            )}

            {previewUrl && (
              <div className="relative aspect-video">
                <Image
                  src={(() => {
                    if (!previewUrl) return "/placeholder-image.svg";

                    // Handle the preview URL format
                    if (previewUrl.startsWith("/photos/")) {
                      const filename = previewUrl.split("/").pop();
                      return `/api/photos/${filename}`;
                    } else if (previewUrl.startsWith("/api/photos/")) {
                      return previewUrl;
                    } else if (previewUrl.startsWith("blob:")) {
                      // Local blob preview from file upload
                      return previewUrl;
                    } else {
                      return previewUrl;
                    }
                  })()}
                  alt="Preview"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))]">
                Title
              </label>{" "}
              <input
                type="text"
                {...register("title", { required: true })}
                className="mt-1 block w-full admin-input shadow-sm"
              />
              {errors.title && (
                <span className="text-red-500 dark:text-red-400 font-medium">
                  Title is required
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))]">
                Alt Text
              </label>
              <input
                type="text"
                {...register("alt", { required: true })}
                className="mt-1 block w-full admin-input shadow-sm"
                placeholder="Descriptive text for accessibility"
              />
              {errors.alt && (
                <span className="text-red-500 dark:text-red-400 font-medium">
                  Alt text is required
                </span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))]">
                Year
              </label>
              <input
                type="text"
                {...register("year")}
                className="mt-1 block w-full admin-input shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))]">
                Location
              </label>
              <input
                type="text"
                {...register("location")}
                className="mt-1 block w-full admin-input shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))]">
                Camera
              </label>
              <input
                type="text"
                {...register("camera")}
                className="mt-1 block w-full admin-input shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))]">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="mt-1 block w-full admin-input shadow-sm"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={uploading}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-400 disabled:opacity-70 font-medium"
              >
                {uploading
                  ? "Saving..."
                  : editingPhoto
                    ? "Update Photo"
                    : "Upload Photo"}
              </button>

              {editingPhoto && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingPhoto(null);
                    setPreviewUrl(null);
                    reset();
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 font-medium"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4 text-[rgb(var(--foreground))]">
            Existing Photos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {photos.map((photo) => (
              <motion.div
                key={photo.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="relative group"
              >
                <Image
                  src={(() => {
                    // Handle different photo src formats
                    if (photo.src.startsWith("/photos/")) {
                      const filename = photo.src.split("/").pop();
                      return `/api/photos/${filename}`;
                    } else if (photo.src.startsWith("/api/photos/")) {
                      return photo.src;
                    } else {
                      // For any other format, try to extract the filename
                      const filename = photo.src.split("/").pop() || photo.src;
                      return `/api/photos/${filename}`;
                    }
                  })()}
                  alt={photo.alt}
                  width={300}
                  height={200}
                  className="rounded-lg object-cover w-full"
                />
                <div className="absolute inset-0 bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <button
                    onClick={() => startEditing(photo)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 font-medium"
                  >
                    Delete
                  </button>
                </div>
                <p className="mt-2 font-medium text-[rgb(var(--foreground))]">
                  {photo.title}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
