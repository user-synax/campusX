import { UTApi } from "uploadthing/server";

let utapi;
try {
  utapi = new UTApi();
} catch (err) {
  console.error("[UploadThing] UTApi initialization failed. Check your environment variables.", err.message);
  // Create a dummy object to prevent crashes elsewhere
  utapi = {
    deleteFiles: async () => {
      console.warn("[UploadThing] deleteFiles called but UTApi is not initialized.");
      return { success: false, error: "UTApi not initialized" };
    }
  };
}

export { utapi };
