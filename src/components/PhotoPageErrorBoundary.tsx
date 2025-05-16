"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class PhotoPageErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("PhotoPage error caught:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <Image
                src="/images/error-photo.png"
                alt="Error"
                width={120}
                height={120}
                className="mx-auto"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">
              Photo Not Available
            </h1>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              We&apos;re sorry, but this photo couldn&apos;t be loaded. It may
              have been removed or there could be a temporary issue.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/gallery"
                className="px-5 py-2.5 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                Return to Gallery
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
