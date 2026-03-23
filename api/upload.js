import { supabase } from './_lib/supabase.js';
import { cors } from './_lib/cors.js';

/**
 * File upload endpoint
 * POST /api/upload - Upload file to Supabase Storage
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;

  try {
    if (req.method !== 'POST') {
      return res.status(405).json({
        success: false,
        message: 'Method not allowed'
      });
    }

    const { file, fileName, folder = 'uploads' } = req.body;

    if (!file || !fileName) {
      return res.status(400).json({
        success: false,
        message: 'File and fileName are required'
      });
    }

    // Convert base64 to buffer
    const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFileName = `${timestamp}-${fileName}`;
    const filePath = `${folder}/${uniqueFileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('tournament-files')
      .upload(filePath, buffer, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('tournament-files')
      .getPublicUrl(filePath);

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        path: data.path,
        url: publicUrl
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Upload failed'
    });
  }
}