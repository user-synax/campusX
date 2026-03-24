# Implementation Plan: Post Image Upload

## Overview

Implement image attachment support for the CampusX post composer. Work proceeds bottom-up: data models first, then the UploadThing endpoint, then the API route, then the UI components, and finally wiring everything together in PostComposer and PostCard.

## Tasks

- [x] 1. Update Mongoose models to support up to 6 images
  - In `models/Post.js`, change the `images` array validator from `<= 4` to `<= 6` and update the error message accordingly
  - In `models/AnonymousPost.js`, apply the same validator change
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ]* 1.1 Write property test for model image limit (Property 1)
    - **Property 1: Model rejects images arrays exceeding 6**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
    - Use `fc.array(fc.string(), { minLength: 7, maxLength: 20 })` to generate oversized arrays and assert `ValidationError` is thrown for both `Post` and `AnonymousPost`

- [x] 2. Add `postImageUploader` endpoint to UploadThing file router
  - In `app/api/uploadthing/core.js`, extract the JWT verification + DB lookup logic from `resourceUploader` into a shared `authenticateRequest(req)` helper
  - Add `postImageUploader` using `f({ image: { maxFileSize: "8MB", maxFileCount: 6 } })` with the shared middleware
  - `onUploadComplete` should return `{ url, key, uploadedBy }`
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 2.1 Write property test for unauthenticated upload rejection (Property 2)
    - **Property 2: UploadThing middleware rejects unauthenticated requests**
    - **Validates: Requirements 2.4**
    - Use `fc.oneof(fc.constant(null), fc.string({ minLength: 1 }))` to generate missing/garbage tokens and assert `UploadThingError` with code `UNAUTHORIZED`

- [x] 3. Update Post API to accept and persist image URLs
  - In `app/api/posts/create/route.js`, destructure `images` from the request body
  - Add validation: reject with 400 if `images` has more than 6 entries or contains any non-string / empty-string value
  - Pass `images: Array.isArray(images) ? images : []` into `postData` for both regular and anonymous posts
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 3.1 Write property test for API round-trip persistence (Property 9)
    - **Property 9: Post API persists image URLs round-trip**
    - **Validates: Requirements 5.1, 5.5**
    - Use `fc.array(fc.webUrl(), { minLength: 1, maxLength: 6 })` and `fc.boolean()` (isAnonymous) and assert `body.images` equals the submitted array with status 201

  - [ ]* 3.2 Write property test for API oversized array rejection (Property 10)
    - **Property 10: Post API rejects oversized images array**
    - **Validates: Requirements 5.2**
    - Use `fc.array(fc.webUrl(), { minLength: 7, maxLength: 20 })` and assert HTTP 400

  - [ ]* 3.3 Write property test for API invalid image entries rejection (Property 11)
    - **Property 11: Post API rejects invalid image entries**
    - **Validates: Requirements 5.3**
    - Use `fc.array(fc.oneof(fc.constant(''), fc.constant('  '), fc.integer()), { minLength: 1, maxLength: 6 })` and assert HTTP 400

- [ ] 4. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create `PostImageGrid` component
  - Create `components/post/PostImageGrid.js`
  - Accept `{ images: string[] }` prop (1–6 CDN URLs)
  - Layout logic:
    - n=1 → single full-width image, 16/9 aspect ratio container
    - n=2 → two equal columns, 1/1 aspect ratio
    - n≥3 → first image full-width (16/9), remaining in 2-column grid (1/1), capped at 6
  - Each image uses `<Image fill loading="lazy" sizes="..." className="object-cover" />` inside a `relative` sized container
  - Click handler: `window.open(url, '_blank')` on each image
  - Add `onError` handler to hide broken images gracefully
  - Render nothing when `images` is empty or undefined
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 7.4, 8.1, 8.2, 8.3_

  - [ ]* 5.1 Write property test for ImageGrid lazy loading and sizing (Property 12)
    - **Property 12: ImageGrid renders lazy-loaded images with explicit sizing**
    - **Validates: Requirements 6.2, 8.2, 8.3**
    - Use `fc.array(fc.webUrl(), { minLength: 1, maxLength: 6 })` and assert every rendered `<img>` has `loading="lazy"` and the count matches the input array length

- [x] 6. Wire `PostImageGrid` into `PostCard`
  - In `components/post/PostCard.js`, add a dynamic import for `PostImageGrid`
  - Render `<PostImageGrid images={post.images} />` after `<PostContent>` and before the poll, wrapped in a `stopPropagation` div
  - Only render when `post.images?.length > 0`
  - _Requirements: 6.1, 6.8_

- [x] 7. Add image selection and preview to `PostComposer`
  - Add state: `selectedImages` (File[]), `isUploading` (boolean)
  - Add a hidden `<input type="file" accept="image/*" multiple ref={fileInputRef} />` — `capture` attribute omitted so mobile users can choose camera or gallery (Req 7.2)
  - Add an image attachment button (camera icon from lucide-react) in the toolbar alongside Poll and Tag College
  - On file selection, enforce the 6-image cap: if `selectedImages.length + newFiles.length > 6`, reject excess and show `toast.error("Maximum 6 images allowed")`
  - Display count badge `"{n}/6"` next to the attachment button when `selectedImages.length > 0`
  - Render an `ImagePreviewStrip` inline sub-component: horizontal scroll container with `overflow-x-auto`, one thumbnail per selected image using `URL.createObjectURL`, and an `×` remove button on each thumbnail
  - On remove, filter the image out by index, preserving order of remaining images
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 7.1, 7.2, 7.3_

  - [ ]* 7.1 Write property test for thumbnail count matching selection (Property 3)
    - **Property 3: Composer thumbnail count matches selection**
    - **Validates: Requirements 3.3**
    - Use `fc.array(fc.record({ name: fc.string(), size: fc.nat() }), { minLength: 1, maxLength: 6 })` and assert rendered thumbnail count equals file count

  - [ ]* 7.2 Write property test for 6-image cap enforcement (Property 4)
    - **Property 4: Composer enforces 6-image cap**
    - **Validates: Requirements 3.4**
    - Use `fc.integer({ min: 1, max: 6 })` and `fc.integer({ min: 1, max: 10 })` for existing + adding counts; assert `selectedImages.length <= 6` and error toast shown when sum exceeds 6

  - [ ]* 7.3 Write property test for remove image preserving order (Property 5)
    - **Property 5: Remove image preserves remaining selection**
    - **Validates: Requirements 3.5**
    - Extract and unit-test the `removeImage(images, index)` pure helper; use `fc.array` + `fc.nat` and assert length, absence of removed item, and correct order

  - [ ]* 7.4 Write property test for count badge text (Property 6)
    - **Property 6: Count badge reflects selection size**
    - **Validates: Requirements 3.6**
    - Use `fc.integer({ min: 1, max: 6 })` and assert `screen.getByText(\`\${n}/6\`)` is in the document

- [x] 8. Implement upload-before-submit flow in `PostComposer`
  - Import `useUploadThing` from `@uploadthing/react` and call `useUploadThing("postImageUploader")`
  - In `handleSubmit`, if `selectedImages.length > 0`:
    1. Set `isUploading = true`, disable the Post button
    2. Call `startUpload(selectedImages)` and await the result
    3. On failure: show `toast.error("Image upload failed")`, set `isUploading = false`, and return without calling the Post API or clearing composer state
    4. On success: collect the returned CDN URLs and include `images: uploadedUrls` in the POST body
  - After successful post creation, clear `selectedImages` and reset `isUploading`
  - Show an upload progress indicator (spinner or progress text) while `isUploading` is true; keep textarea and other controls accessible during upload
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 3.7_

  - [ ]* 8.1 Write property test for composer reset on successful submit (Property 7)
    - **Property 7: Composer resets images on successful submit**
    - **Validates: Requirements 3.7**
    - Use `fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 6 })`, mock successful upload + API, and assert `selectedImages` is empty after submit

  - [ ]* 8.2 Write property test for composer content preserved on upload failure (Property 8)
    - **Property 8: Composer preserves content on upload failure**
    - **Validates: Requirements 4.4**
    - Use `fc.string({ minLength: 1, maxLength: 500 })`, mock upload failure, and assert `content` state is unchanged and Post API was not called

- [ ] 9. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check; tag each test with `// Feature: post-image-upload, Property N: ...`
- The `postImageUploader` endpoint must be registered in `app/api/uploadthing/route.js` (the Next.js route handler) — verify it exports the new router key
- `next/image` requires UploadThing's CDN domain to be added to `next.config.js` `images.remotePatterns` if not already present
