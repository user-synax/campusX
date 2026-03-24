# Requirements Document

## Introduction

This feature adds image upload support to the CampusX post composer. Users can attach up to 6 images per post (regular or anonymous), preview and remove images before submitting, and view images in the post feed. Images are uploaded via UploadThing (already integrated), delivered with compression and responsive sizing, and displayed with lazy loading to avoid layout shift. The feature applies to both the `Post` and `AnonymousPost` models, and the existing 4-image limit on both models must be raised to 6.

## Glossary

- **Post_Composer**: The `PostComposer` React component where users write and submit posts.
- **Post_Card**: The `PostCard` React component that renders a post in the feed.
- **Image_Uploader**: The new UploadThing file router endpoint (`postImageUploader`) added to `core.js`.
- **Image_Preview**: The in-composer UI showing selected images before submission, with per-image removal.
- **Image_Grid**: The responsive image layout rendered inside `Post_Card` after a post is saved.
- **Post_API**: The Next.js route at `/api/posts/create/route.js` that persists posts.
- **Post_Model**: The Mongoose `Post` schema in `models/Post.js`.
- **AnonymousPost_Model**: The Mongoose `AnonymousPost` schema in `models/AnonymousPost.js`.
- **UploadThing**: The third-party file upload service already installed (`uploadthing`, `@uploadthing/react`).

---

## Requirements

### Requirement 1: Raise Image Limit on Data Models

**User Story:** As a developer, I want both post models to support up to 6 images, so that the new upload limit is enforced consistently at the database layer.

#### Acceptance Criteria

1. THE Post_Model SHALL validate that the `images` array contains no more than 6 elements.
2. THE AnonymousPost_Model SHALL validate that the `images` array contains no more than 6 elements.
3. WHEN a post is saved with more than 6 images, THE Post_Model SHALL reject the document with a validation error.
4. WHEN a post is saved with more than 6 images, THE AnonymousPost_Model SHALL reject the document with a validation error.

---

### Requirement 2: UploadThing Post Image Endpoint

**User Story:** As a developer, I want a dedicated UploadThing endpoint for post images, so that image uploads are authenticated, size-limited, and separate from the existing resource uploader.

#### Acceptance Criteria

1. THE Image_Uploader SHALL accept image files only (JPEG, PNG, WebP, GIF).
2. THE Image_Uploader SHALL enforce a maximum file size of 8 MB per image.
3. THE Image_Uploader SHALL enforce a maximum of 6 files per upload request.
4. WHEN a request reaches the Image_Uploader without a valid session token, THE Image_Uploader SHALL reject the request with an UNAUTHORIZED error.
5. WHEN a valid session token is present, THE Image_Uploader SHALL return the uploaded file URL and key to the client.
6. THE Image_Uploader SHALL reuse the existing JWT verification and database connection logic from `resourceUploader`.

---

### Requirement 3: Image Selection and Preview in Post Composer

**User Story:** As a user, I want to select images and preview them before posting, so that I can review and remove images without submitting the post first.

#### Acceptance Criteria

1. THE Post_Composer SHALL display an image attachment button in the toolbar alongside the existing Poll and Tag College buttons.
2. WHEN the image attachment button is clicked, THE Post_Composer SHALL open a file picker restricted to image file types.
3. WHEN images are selected, THE Post_Composer SHALL display a thumbnail preview for each selected image below the text area.
4. WHEN the total number of selected images would exceed 6, THE Post_Composer SHALL reject the excess files and display an error message stating the 6-image limit.
5. WHEN a user clicks the remove button on a thumbnail, THE Post_Composer SHALL remove that image from the selection without affecting other selected images.
6. WHILE images are selected, THE Post_Composer SHALL display the current image count (e.g., "2/6") near the attachment button.
7. WHEN the post is submitted successfully, THE Post_Composer SHALL clear all image previews and reset the image selection state.

---

### Requirement 4: Non-Blocking Image Upload Flow

**User Story:** As a user, I want image uploads to complete before my post is submitted, so that all images are attached to the post without blocking the composer UI unnecessarily.

#### Acceptance Criteria

1. WHEN the Post button is clicked and images are selected, THE Post_Composer SHALL upload all images to UploadThing before calling the Post_API.
2. WHILE images are uploading, THE Post_Composer SHALL display an upload progress indicator and disable the Post button.
3. WHILE images are uploading, THE Post_Composer SHALL keep the text area and other controls accessible.
4. IF an image upload fails, THEN THE Post_Composer SHALL display an error toast and abort post submission without clearing the composer content.
5. WHEN all images have uploaded successfully, THE Post_Composer SHALL include the returned image URLs in the Post_API request payload.

---

### Requirement 5: Post API Accepts and Persists Images

**User Story:** As a developer, I want the post creation API to accept image URLs and save them to the database, so that images are permanently associated with a post.

#### Acceptance Criteria

1. WHEN the Post_API receives a request body containing an `images` array of URLs, THE Post_API SHALL include those URLs in the created post document.
2. THE Post_API SHALL validate that the `images` array contains no more than 6 entries; IF more than 6 are provided, THEN THE Post_API SHALL return a 400 error.
3. THE Post_API SHALL validate that each entry in the `images` array is a non-empty string URL; IF an invalid entry is found, THEN THE Post_API SHALL return a 400 error.
4. WHEN no `images` field is provided in the request body, THE Post_API SHALL create the post with an empty images array.
5. THE Post_API SHALL apply the same images handling for both regular and anonymous posts.

---

### Requirement 6: Image Display in Post Card

**User Story:** As a user, I want to see images attached to a post displayed in the feed, so that I can view post images without navigating away.

#### Acceptance Criteria

1. WHEN a post has one or more images, THE Post_Card SHALL render an Image_Grid below the post text content.
2. THE Image_Grid SHALL display images using lazy loading to prevent layout shift on scroll.
3. THE Image_Grid SHALL apply responsive sizing so images do not overflow their container on any viewport width.
4. WHEN a post has exactly 1 image, THE Image_Grid SHALL display it in a single full-width layout.
5. WHEN a post has exactly 2 images, THE Image_Grid SHALL display them side by side in a 2-column layout.
6. WHEN a post has 3 or more images, THE Image_Grid SHALL display the first image full-width and the remaining images in a 2-column grid below, up to a maximum of 6 images.
7. WHEN a user clicks an image in the Image_Grid, THE Post_Card SHALL open the image in a full-screen lightbox or new tab without navigating away from the feed.
8. WHEN a post has no images, THE Post_Card SHALL render no Image_Grid and no empty placeholder space.

---

### Requirement 7: Mobile-Friendly Upload Experience

**User Story:** As a mobile user, I want to attach images from my phone's camera or gallery, so that I can post photos from my device without friction.

#### Acceptance Criteria

1. THE Post_Composer image attachment button SHALL be reachable and tappable on viewports as narrow as 320px.
2. WHEN the file picker is opened on a mobile device, THE Post_Composer SHALL allow the user to choose between the camera and the photo gallery.
3. THE Image_Preview thumbnails SHALL be scrollable horizontally on small viewports when more than 2 images are selected.
4. THE Image_Grid in Post_Card SHALL maintain readable image proportions on viewports as narrow as 320px without horizontal overflow.

---

### Requirement 8: Optimized Image Delivery

**User Story:** As a user, I want post images to load quickly and not consume excessive bandwidth, so that the feed remains fast on mobile connections.

#### Acceptance Criteria

1. THE Image_Grid SHALL render images using the Next.js `Image` component to enable automatic format optimization and responsive `srcSet` generation.
2. THE Image_Grid SHALL set the `loading="lazy"` attribute on all images to defer off-screen loading.
3. THE Image_Grid SHALL specify explicit `width` and `height` (or `fill` with a sized container) on each image to prevent cumulative layout shift.
4. WHERE UploadThing provides image transformation parameters, THE Image_Uploader SHALL configure images to be delivered at a maximum width of 1200px.
