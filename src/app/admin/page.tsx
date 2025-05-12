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
          } catch (e) {
            console.error("Error refreshing session:", e);
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

      const formData = new FormData();
      if (data.file?.[0]) {
        formData.append("file", data.file[0]);
      }

      // Add all metadata fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "file" && value !== undefined && value !== "") {
          formData.append(key, value.toString());
        }
      });

      // Handle PUT for edit, POST for new upload
      const method = editingPhoto ? "PUT" : "POST";
      if (editingPhoto) {
        formData.append("id", editingPhoto.id);
      }

      const response = await fetch("/api/photos", {
        method,
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to save photo");
      }

      reset();
      setPreviewUrl(null);
      setEditingPhoto(null);
      fetchPhotos();
    } catch (error) {
      console.error("Error handling photo:", error);
      alert("Failed to save photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const fetchPhotos = async () => {
    try {
      const response = await fetch("/api/photos");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPhotos(data.photos);
        }
        return data;
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
        <div className="w-12 h-12 rounded-full border-4 border-t-transparent border-gray-700 animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Loading admin panel...</p>
        <p className="text-gray-400 text-sm mt-2">
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
      <h1 className="text-3xl font-bold mb-8">Photo Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {editingPhoto ? "Edit Photo" : "Upload New Photo"}
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!editingPhoto && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Photo File
                </label>
                <input
                  type="file"
                  accept="image/*"
                  {...register("file", { required: !editingPhoto })}
                  className="mt-1 block w-full"
                />
                {errors.file && (
                  <span className="text-red-500">Photo file is required</span>
                )}
              </div>
            )}

            {previewUrl && (
              <div className="relative aspect-video">
                <Image
                  src={
                    previewUrl?.startsWith("/photos/")
                      ? previewUrl.replace("/photos/", "/api/photos/")
                      : previewUrl
                  }
                  alt="Preview"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                {...register("title", { required: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
              {errors.title && (
                <span className="text-red-500">Title is required</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Alt Text
              </label>
              <input
                type="text"
                {...register("alt", { required: true })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="Descriptive text for accessibility"
              />
              {errors.alt && (
                <span className="text-red-500">Alt text is required</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Year
              </label>
              <input
                type="text"
                {...register("year")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                {...register("location")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Camera
              </label>
              <input
                type="text"
                {...register("camera")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={uploading}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
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
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Existing Photos</h2>
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
                  src={
                    photo.src.startsWith("/photos/")
                      ? photo.src.replace("/photos/", "/api/photos/")
                      : photo.src
                  }
                  alt={photo.alt}
                  width={300}
                  height={200}
                  className="rounded-lg object-cover w-full"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <button
                    onClick={() => startEditing(photo)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
                <p className="mt-2 font-medium">{photo.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
