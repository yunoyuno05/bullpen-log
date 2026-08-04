import sys

with open('src/lib/serverSync.ts', 'r') as f:
    content = f.read()

old_upload = """  // Upload to Supabase Storage if we got a valid Blob
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
  }"""

new_upload = """  // Upload via FormData to local server using Multer
  if (fileBlob) {
    try {
      const formData = new FormData();
      let ext = 'mp4';
      if (mimeType.includes('webm')) ext = 'webm';
      if (mimeType.includes('quicktime') || mimeType.includes('mov')) ext = 'mov';
      
      const filename = `${originalName}.${ext}`;
      formData.append('videoFile', fileBlob, filename);
      formData.append('email', userEmail || '');
      
      const res = await fetch('/api/videos/upload', {
        method: 'POST',
        body: formData,
      });
      
      const json = await res.json();
      if (json.success && json.publicUrl) {
        return {
          ...videoMetadata,
          id: `vid_sb_${Date.now()}`,
          videoUrl: json.publicUrl,
        };
      } else {
        throw new Error(json.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Failed to upload video to local server:', err);
    }
  }"""

content = content.replace(old_upload, new_upload)

with open('src/lib/serverSync.ts', 'w') as f:
    f.write(content)
