### 8. Speech to Text

Converts audio speech to text for use in conversations.

**Endpoint:** `POST /ai-advisor/speech-to-text`

**Request:**

- **Content-Type:** `multipart/form-data`
- **Form Field:** `file` - Binary audio file

**File Requirements:**

- **Formats:** Common audio formats (MP3, WAV, M4A, etc.)
- **Field Name:** `file`

**Example cURL Request:**

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/audio.mp3" \
  http://localhost:3000/api/v1/ai-advisor/speech-to-text
```

**Response:** `200 OK`

```typescript
interface SpeechToTextResponseDto {
  text: string; // Transcribed text from audio
}
```

**Example Response:**

```json
{
  "text": "How can I create a budget for this month?"
}
```

**Error Responses:**

- `400 Bad Request` - Invalid file type or processing error
- `401 Unauthorized` - User not authenticated
