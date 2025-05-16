// Global type declarations to fix Buffer type compatibility issues

// Extend NodeJS namespace for Buffer compatibility
declare global {
  // Make Buffer type more flexible for our use cases
  interface Buffer extends Uint8Array {
    // Define a property to make this interface not empty for ESLint
    __bufferBrand: "nodejs-buffer";
  }
}

// This ensures TypeScript recognizes this as a module
export {};
