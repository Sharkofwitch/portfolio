"use client";

import React from "react";
import PhotoPage from "./page";
import PhotoPageErrorBoundary from "@/components/PhotoPageErrorBoundary";

export default function PhotoPageWrapper({
  params,
}: {
  params: { slug: string };
}) {
  return (
    <PhotoPageErrorBoundary>
      <PhotoPage params={params} />
    </PhotoPageErrorBoundary>
  );
}
