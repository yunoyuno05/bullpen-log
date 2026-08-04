import { PitchVideo } from '../types';
import { supabase } from './supabase';

/**
 * Uploads a video blob/file/URL to Supabase Storage 'pitching video' bucket.
 */
export async function uploadVideoToServer(
  videoSource: Blob | File | string,
  videoMetadata: Omit<PitchVideo, 'id'>,
  userEmail?: string
): Promise<PitchVideo> {
  let fileBlob: Blob | null = null;
  let originalName = 'video';
  let mimeType = 'video/mp4';

  if (typeof videoSource === 'string' && videoSource.startsWith('data:')) {
    const match = videoSource.match(/^data:(video\/[a-zA-Z0-9]+);base64,(.*)$/);
    if (match) {
      mimeType = match[1];
      const byteCharacters = atob(match[2]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      fileBlob = new Blob([byteArray], { type: mimeType });
      originalName = `video_${Date.now()}`;
    }
  } else if (typeof videoSource !== 'string' && videoSource && 'size' in videoSource) {
    fileBlob = videoSource as Blob;
    mimeType = fileBlob.type || 'video/mp4';
    if ('name' in videoSource) {
      originalName = (videoSource as File).name.replace(/\.[^/.]+$/, "");
    } else {
      originalName = `video_${Date.now()}`;
    }
  } else if (typeof videoSource === 'string' && videoSource.startsWith('blob:')) {
    try {
      const res = await fetch(videoSource);
      fileBlob = await res.blob();
      mimeType = fileBlob.type || 'video/mp4';
      originalName = `video_${Date.now()}`;
    } catch (err) {
      console.warn('Could not read blob URL for upload:', err);
    }
  }

  // Upload to Supabase Storage if we got a valid Blob
  if (fileBlob) {
    try {
      let ext = 'mp4';
      if (mimeType.includes('webm')) ext = 'webm';
      if (mimeType.includes('quicktime') || mimeType.includes('mov')) ext = 'mov';
      
      const filename = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}_${originalName}.${ext}`;
      
      const { data, error } = await supabase.storage
        .from('pitching video')
        .upload(filename, fileBlob, {
          cacheControl: '3600',
          upsert: false,
          contentType: mimeType
        });
        
      if (error) {
        throw error;
      }
      
      const { data: publicUrlData } = supabase.storage
        .from('pitching video')
        .getPublicUrl(filename);
        
      return {
        ...videoMetadata,
        id: `vid_sb_${Date.now()}`,
        videoUrl: publicUrlData.publicUrl,
      };
      
    } catch (err) {
      console.error('Failed to upload video to Supabase:', err);
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
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': accountData?.user?.isAdmin ? 'Bearer admin-secret-token' : ''
      },
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
