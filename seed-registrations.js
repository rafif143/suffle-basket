import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function seed() {
    console.log('Starting seed process...');
    
    const levels = ['SMA', 'SMP'];
    const genders = ['Putra', 'Putri'];
    const registrations = [];

    // Create 16 schools
    for (let i = 1; i <= 16; i++) {
        const schoolName = `Yadika ${i}`;
        
        for (const level of levels) {
            for (const gender of genders) {
                registrations.push({
                    school_name: schoolName,
                    school_address: `Jl. Raya Yadika No. ${i}, Jakarta`,
                    level: level,
                    gender: gender,
                    whatsapp: `812345678${String(i).padStart(2, '0')}`,
                    logo_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${schoolName}`,
                    status: 'Verified',
                    players: [
                        { name: `Player ${i}A`, birth_date: '2008-01-01', phone: '08123', email: 'p@mail.com' },
                        { name: `Player ${i}B`, birth_date: '2008-01-01', phone: '08124', email: 'p2@mail.com' }
                    ],
                    officials: [
                        { name: `Coach ${i}`, role: 'Coach', phone: '08111', email: 'c@mail.com' }
                    ]
                });
            }
        }
    }

    console.log(`Prepared ${registrations.length} registrations. Inserting...`);

    const { error } = await supabase
        .from('registrations')
        .insert(registrations);

    if (error) {
        console.error('Error seeding data:', error);
    } else {
        console.log('✅ Successfully seeded 64 registrations!');
    }
}

seed();
