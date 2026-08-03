import { PitchVideo } from '../types';

/**
 * Uploads a video blob/file/URL to the Express server.
 * The server saves the file to ./uploads/videos and returns a permanent URL (/api/videos/file/...).
 * Also links the video to the user's account on the server.
 */
export async function uploadVideoToServer(
  videoSource: Blob | File | string,
  videoMetadata: Omit<PitchVideo, 'id'>,
  userEmail?: string
): Promise<PitchVideo> {
  let fileData = '';

  if (typeof videoSource === 'string' && videoSource.startsWith('data:')) {
    fileData = videoSource;
  } else if (typeof videoSource !== 'string' && videoSource && 'size' in videoSource) {
    fileData = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(videoSource as Blob);
    });
  } else if (typeof videoSource === 'string' && videoSource.startsWith('blob:')) {
    try {
      const res = await fetch(videoSource);
      const blob = await res.blob();
      fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.warn('Could not read blob URL for upload:', err);
    }
  }

  // If we got fileData, send to Express server /api/videos/upload
  if (fileData) {
    try {
      const response = await fetch('/api/videos/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          video: videoMetadata,
          fileData,
        }),
      });

      const json = await response.json();
      if (json.success && json.video) {
        return json.video as PitchVideo;
      }
    } catch (err) {
      console.error('Failed to upload video to server:', err);
    }
  }

  // Fallback local video object if server upload is skipped/fails
  return {
    ...videoMetadata,
    id: `vid_loc_${Date.now()}`,
    videoUrl: typeof videoSource === 'string' ? videoSource : URL.createObjectURL(videoSource as Blob),
  };
}

/**
 * Syncs complete account state (sessions, videos, romRecords, etc.) to the Express server.
 */
export async function syncAccountToServer(email: string, accountData: any) {
  if (!email) return;
  try {
    const res = await fetch('/api/account/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, accountData }),
    });
    return await res.json();
  } catch (err) {
    console.error('Error syncing account to server:', err);
  }
}

/**
 * Fetches account state from the Express server for a given email address.
 */
export async function fetchAccountFromServer(email: string) {
  if (!email) return null;
  try {
    const res = await fetch(`/api/account/data/${encodeURIComponent(email)}`);
    const json = await res.json();
    if (json.success && json.accountData) {
      return json.accountData;
    }
  } catch (err) {
    console.error('Error fetching account from server:', err);
  }
  return null;
}
