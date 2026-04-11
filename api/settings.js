import { supabase } from './_lib/supabase.js';
import { cors } from './_lib/cors.js';
import { requireAuth } from './_lib/auth.js';

/**
 * Tournament settings
 * GET /api/settings - Get settings
 * POST /api/settings - Save settings
 */
export default async function handler(req, res) {
  if (cors(req, res)) return;

  try {
    // Check if authentication is required (only for mutations)
    const isMutation = ['POST', 'PATCH', 'DELETE'].includes(req.method);
    if (isMutation) {
      const user = await requireAuth(req, res);
      if (!user) return; // Auth failed, response already sent
    }

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        return res.status(200).json({
          success: true,
          data: {
            bank_name: 'Bank BCA',
            account_number: '123 456 7890',
            account_name: 'Panitia Championship',
            registration_fee: '350000',
            registration_fees: {
              sma_putra: '350000',
              sma_putri: '350000',
              smp_putra: '350000',
              smp_putri: '350000'
            },
            whatsapp_contact: ''
          }
        });
      }

      // Backward compatibility: construct registration_fees from registration_fee
      if (!data.registration_fees && data.registration_fee) {
        data.registration_fees = {
          sma_putra: data.registration_fee,
          sma_putri: data.registration_fee,
          smp_putra: data.registration_fee,
          smp_putri: data.registration_fee
        };
      }

      return res.status(200).json({
        success: true,
        data
      });
    }

    if (req.method === 'POST') {
      const { bankName, accountNumber, accountName, registrationFees, whatsappContact } = req.body;

      console.log('[Settings POST] req.body:', JSON.stringify(req.body));
      console.log('[Settings POST] registrationFees:', JSON.stringify(registrationFees));

      const settingsData = {
        bank_name: bankName,
        account_number: accountNumber,
        account_name: accountName,
        registration_fees: registrationFees,
        registration_fee: registrationFees?.sma_putra || '350000',
        whatsapp_contact: whatsappContact,
        updated_at: new Date().toISOString()
      };

      console.log('[Settings POST] settingsData:', JSON.stringify(settingsData));

      // Check if settings exist
      const { data: existing } = await supabase
        .from('settings')
        .select('id')
        .single();

      let data, error;

      if (existing) {
        // Update
        ({ data, error } = await supabase
          .from('settings')
          .update(settingsData)
          .eq('id', existing.id)
          .select()
          .single());
      } else {
        // Insert
        ({ data, error } = await supabase
          .from('settings')
          .insert([settingsData])
          .select()
          .single());
      }

      if (error) throw error;

      return res.status(200).json({
        success: true,
        message: 'Settings saved successfully',
        data
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
