import { supabase } from '../_lib/supabase.js';
import { cors } from '../_lib/cors.js';
import { requireAuth, isPublicEndpoint } from '../_lib/auth.js';

/**
 * Registrations endpoint
 * GET /api/registrations - Get all (PROTECTED)
 * GET /api/registrations?id=X - Get by ID
 * GET /api/registrations?stats=true - Get stats
 * POST /api/registrations - Create new (PROTECTED)
 * PATCH /api/registrations?id=X - Update status
 * DELETE /api/registrations?id=X - Delete
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;

  const { id, stats } = req.query;

  // Auth policy:
  // 1. GET all registrations -> PROTECTED
  // 2. GET by ID / stats -> PUBLIC
  // 3. POST (create new) -> PUBLIC (for public registration page)
  // 4. PATCH/DELETE -> PROTECTED
  const isProtectedMethod = ['PATCH', 'DELETE'].includes(req.method);
  const isProtectedListing = req.method === 'GET' && !id && !stats;
  
  if (isProtectedMethod || isProtectedListing) {
    const user = await requireAuth(req, res);
    if (!user) return; // Auth failed
  }

  try {
    if (req.method === 'GET') {
      // Get stats
      if (stats === 'true') {
        const { data, error } = await supabase
          .from('registrations')
          .select('status');

        if (error) throw error;

        const statsData = {
          total: data.length,
          pending: data.filter(r => r.status === 'Pending').length,
          verified: data.filter(r => r.status === 'Verified').length,
          rejected: data.filter(r => r.status === 'Rejected').length
        };

        return res.status(200).json({
          success: true,
          data: statsData
        });
      }

      // Get by ID
      if (id) {
        const { data, error } = await supabase
          .from('registrations')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (!data) {
          return res.status(404).json({
            success: false,
            message: 'Registration not found'
          });
        }

        return res.status(200).json({
          success: true,
          data
        });
      }

      // Get all registrations
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return res.status(200).json({
        success: true,
        data
      });
    }

    if (req.method === 'POST') {
      // Create registration
      const { schoolName, schoolAddress, whatsapp, level, gender, players, officials, logoFile } = req.body;

      let logoUrl = null;

      // Handle logo upload if provided
      if (logoFile) {
        try {
          const timestamp = Date.now();
          const fileName = `logo-${timestamp}.jpg`;
          const filePath = `logos/${fileName}`;

          // Convert base64 to buffer
          const base64Data = logoFile.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');

          // Upload to Supabase Storage
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('tournament-files')
            .upload(filePath, buffer, {
              contentType: 'image/jpeg',
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('tournament-files')
            .getPublicUrl(filePath);

          logoUrl = publicUrl;
        } catch (uploadError) {
          console.error('Logo upload failed:', uploadError);
          // Continue without logo if upload fails
        }
      }

      // Handle player card uploads
      const processedPlayers = [];
      for (let i = 0; i < players.length; i++) {
        const player = players[i];
        let cardUrl = null;

        if (player.cardFile) {
          try {
            const timestamp = Date.now();
            const fileName = `card-${timestamp}-${i}.jpg`;
            const filePath = `player-cards/${fileName}`;

            // Convert base64 to buffer
            const base64Data = player.cardFile.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');

            // Upload to Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('tournament-files')
              .upload(filePath, buffer, {
                contentType: 'image/jpeg',
                cacheControl: '3600',
                upsert: false
              });

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('tournament-files')
              .getPublicUrl(filePath);

            cardUrl = publicUrl;
          } catch (uploadError) {
            console.error(`Player card upload failed for player ${i}:`, uploadError);
            // Continue without card if upload fails
          }
        }

        processedPlayers.push({
          name: player.name,
          card_url: cardUrl
        });
      }

      const registrationData = {
        school_name: schoolName,
        school_address: schoolAddress,
        whatsapp,
        level,
        gender,
        logo_url: logoUrl,
        players: processedPlayers,
        officials,
        status: 'Pending'
      };

      const { data, error } = await supabase
        .from('registrations')
        .insert([registrationData])
        .select()
        .single();

      if (error) throw error;

      return res.status(201).json({
        success: true,
        message: 'Registration created successfully',
        data
      });
    }

    if (req.method === 'PATCH') {
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID is required'
        });
      }

      const { status } = req.body;

      const { data, error } = await supabase
        .from('registrations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'Status updated successfully',
        data
      });
    }

    if (req.method === 'DELETE') {
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID is required'
        });
      }

      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'Registration deleted successfully'
      });
    }

    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
}
