# File Uploads

**Category 16 - File Uploads**

**5 policies** for handling file uploads securely.

## Policy 16.1: File Size Limits

**Level**: MUST

**Rule**: Enforce max file size (e.g., 5MB for images)

## Policy 16.2: Image Optimization

**Level**: MUST

**Rule**: Optimize images (Next.js Image, sharp, WebP format)

## Policy 16.3: Upload Progress Tracking

**Level**: SHOULD

**Rule**: Show progress bar for uploads >1MB

## Policy 16.4: Chunked Uploads

**Level**: SHOULD

**Use for**: Files >10MB, unreliable networks
**Libraries**: tus.js, uppy

## Policy 16.5: File Type Validation

**Level**: MUST

**Rule**: Validate file type server-side (check MIME type + magic bytes)

---

**Last Updated**: 2025-10-23
**Category**: 16 - File Uploads
**Total Policies**: 5
