Uploads an image for document analysis (receipts, statements, etc.).

**Endpoint:** `POST /ai-advisor/conversations/{id}/upload-image`

**Path Parameters:**

- `id` - Conversation UUID (required)

**Request:**

- **Content-Type:** `multipart/form-data`
- **Form Field:** `image` - Binary image file

**File Requirements:**

- **Formats:** JPEG, PNG, GIF, WebP
- **Max Size:** 10MB
- **Field Name:** `image`

**Example cURL Request:**

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/receipt.jpg" \
  http://localhost:3000/api/v1/ai-advisor/conversations/{id}/upload-image
```

**Response:** `201 Created`

```typescript
interface UploadImageResponseDto {
  fileName: string; // Stored file name
  filePath: string; // Storage path
  publicUrl: string; // Public access URL
  size: number; // File size in bytes
  mimeType: string; // MIME type
}
```

**Example Response:**

```json
{
  "fileName": "image_1234567890.jpg",
  "filePath": "conversations/conv_123/image_1234567890.jpg",
  "publicUrl": "https://storage.example.com/conversations/conv_123/image_1234567890.jpg",
  "size": 1024000,
  "mimeType": "image/jpeg"
}
```

**Error Responses:**

- `400 Bad Request` - Invalid file type or size exceeds limit
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Conversation not found
