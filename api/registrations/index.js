import { supabase } from '../_lib/supabase.js';
import { cors } from '../_lib/cors.js';
import { requireAuth, isPublicEndpoint } from '../_lib/auth.js';

/**
 * Helper to extract storage path from Supabase public URL
 * Format: .../storage/v1/object/public/[bucket]/[path]
 */
function getStoragePath(url, bucket) {
  if (!url) return null;
  const searchStr = `/public/${bucket}/`;
  const index = url.indexOf(searchStr);
  if (index === -1) return null;
  return url.substring(index + searchStr.length);
}

/**
 * Helper to delete files for multiple registrations
 */
async function deleteRegistrationsFiles(registrations) {
  const allFiles = []; // All files are now in 'tournament-files' bucket

  for (const reg of registrations) {
    // 1. School Logo
    if (reg.logo_url) {
      const path = getStoragePath(reg.logo_url, 'tournament-files');
      if (path) allFiles.push(path);
    }
    
    // 2. Payment Proof (now in tournament-files/payment-image/)
    const paymentProofUrl = reg['payment - proofs'] || reg['payment-proofs'] || reg.payment_proofs;
    if (paymentProofUrl) {
      const path = getStoragePath(paymentProofUrl, 'tournament-files');
      if (path) allFiles.push(path);
    }

    // 3. Player Cards
    let players = reg.players;
    if (typeof players === 'string') {
      try { players = JSON.parse(players); } catch (e) { players = []; }
    }
    
    if (players && Array.isArray(players)) {
      for (const player of players) {
        if (player.card_url) {
          const path = getStoragePath(player.card_url, 'tournament-files');
          if (path) allFiles.push(path);
        }
      }
    }
  }

  // Batch delete from tournament-files
  if (allFiles.length > 0) {
    try {
      await supabase.storage.from('tournament-files').remove(allFiles);
    } catch (err) { 
      console.error('Remove storage files failed:', err); 
    }
  }
}

export default async function handler(req, res) {
  if (cors(req, res)) return;

  let { id, stats, verified, bulk } = req.query;
  if (id === 'null' || id === 'undefined') id = null;

  const isProtectedMethod = ['PATCH', 'DELETE'].includes(req.method);
  const isProtectedListing = req.method === 'GET' && !id && !stats && !verified;
  
  if (isProtectedMethod || isProtectedListing) {
    const user = await requireAuth(req, res);
    if (!user) return; 
  }

  try {
    if (req.method === 'GET') {
      if (verified === 'true') {
        const { data, error } = await supabase.from('registrations').select('*').eq('status', 'Verified').order('school_name', { ascending: true });
        if (error) throw error;
        return res.status(200).json({ success: true, data });
      }

      if (stats === 'true') {
        const { data, error } = await supabase.from('registrations').select('status');
        if (error) throw error;
        const statsData = {
          total: data.length,
          pending: data.filter(r => r.status === 'Pending').length,
          verified: data.filter(r => r.status === 'Verified').length,
          rejected: data.filter(r => r.status === 'Rejected').length
        };
        return res.status(200).json({ success: true, data: statsData });
      }

      if (id) {
        const { data, error } = await supabase.from('registrations').select('*').eq('id', id).single();
        if (error) throw error;
        return res.status(200).json({ success: true, data });
      }

      const { data, error } = await supabase.from('registrations').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }

    if (req.method === 'POST') {
      const { schoolName, schoolAddress, whatsapp, level, gender, players, officials, logoFile, paymentProofFile, status } = req.body;

      let logoUrl = null;
      let paymentProofUrl = null;

      // Logo handling -> tournament-files/logos/
      if (logoFile) {
        try {
          const timestamp = Date.now();
          const fileName = `logo-${timestamp}.jpg`;
          const filePath = `logos/${fileName}`;
          const base64Data = logoFile.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          await supabase.storage.from('tournament-files').upload(filePath, buffer, { contentType: 'image/jpeg' });
          const { data: { publicUrl } } = supabase.storage.from('tournament-files').getPublicUrl(filePath);
          logoUrl = publicUrl;
        } catch (e) { console.error('Logo upload failed:', e); }
      }

      // Payment Proof handling -> tournament-files/payment-image/
      if (paymentProofFile) {
        try {
          const timestamp = Date.now();
          const fileName = `proof-${timestamp}.jpg`;
          const filePath = `payment-image/${fileName}`; // Now a subfolder in tournament-files
          const base64Data = paymentProofFile.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          
          const { error: uploadError } = await supabase.storage
            .from('tournament-files')
            .upload(filePath, buffer, { contentType: 'image/jpeg', upsert: true });

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage.from('tournament-files').getPublicUrl(filePath);
          paymentProofUrl = publicUrl;
        } catch (e) { 
          console.error('Payment proof upload failed:', e); 
          throw new Error(`Storage error: ${e.message}`);
        }
      }

      // Player cards -> tournament-files/player-cards/
      const processedPlayers = [];
      for (let i = 0; i < players.length; i++) {
        const player = players[i];
        let cardUrl = null;
        if (player.cardFile) {
          try {
            const timestamp = Date.now();
            const fileName = `card-${timestamp}-${i}.jpg`;
            const filePath = `player-cards/${fileName}`;
            const base64Data = player.cardFile.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');
            await supabase.storage.from('tournament-files').upload(filePath, buffer, { contentType: 'image/jpeg' });
            const { data: { publicUrl } } = supabase.storage.from('tournament-files').getPublicUrl(filePath);
            cardUrl = publicUrl;
          } catch (e) { console.error(`Player card ${i} upload failed:`, e); }
        }
        processedPlayers.push({ name: player.name, card_url: cardUrl });
      }

      const finalStatus = status || 'Pending';

      const registrationData = {
        school_name: schoolName,
        school_address: schoolAddress,
        whatsapp,
        level,
        gender,
        logo_url: logoUrl,
        'payment-proofs': paymentProofUrl, 
        players: processedPlayers,
        officials,
        status: finalStatus
      };

      // 1. Initial Insert
      const { data, error } = await supabase.from('registrations').insert([registrationData]).select().single();
      if (error) throw error;

      // 2. Force Update status if requested status is NOT 'Pending' 
      if (status && status !== 'Pending' && data.status !== status) {
        const { data: updatedData } = await supabase
          .from('registrations')
          .update({ status })
          .eq('id', data.id)
          .select()
          .single();
        return res.status(201).json({ success: true, data: updatedData });
      }

      return res.status(201).json({ success: true, data });
    }

    if (req.method === 'PATCH') {
      const { status } = req.body;
      if (bulk === 'true' || bulk === true) {
        const { data, error } = await supabase.from('registrations').update({ status, updated_at: new Date().toISOString() }).eq('status', 'Pending').select();
        if (error) throw error;
        return res.status(200).json({ success: true, count: data?.length || 0 });
      }
      if (!id) return res.status(400).json({ success: false, message: 'ID is required' });
      const { data, error } = await supabase.from('registrations').update({ status, updated_at: new Date().toISOString() }).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }

    if (req.method === 'DELETE') {
      if (id) {
        const { data: reg } = await supabase.from('registrations').select('*').eq('id', id).single();
        if (reg) await deleteRegistrationsFiles([reg]);
        await supabase.from('registrations').delete().eq('id', id);
        return res.status(200).json({ success: true, message: 'Deleted' });
      } else {
        const { data: allRegs } = await supabase.from('registrations').select('*');
        if (allRegs) await deleteRegistrationsFiles(allRegs);
        await supabase.from('registrations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        return res.status(200).json({ success: true, message: 'All deleted' });
      }
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
