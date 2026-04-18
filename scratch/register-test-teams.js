import fs from 'fs';
import path from 'path';

// Backend URL where dev-server-simple.js is running
const BACKEND_URL = 'http://localhost:3000/api';

// Directory where generated images are stored
const ASSETS_DIR = '/Users/rafif/.gemini/antigravity/brain/566f0a0d-7296-4150-9f02-a1d4538d7e8f';

// Image filenames from previous steps
const ASSETS = {
    LOGO_1: 'team_garuda_logo_1776538534528.png',
    LOGO_2: 'team_elang_logo_1776538553868.png',
    ID_CARD: 'student_id_card_template_1776538579390.png'
};

/**
 * Converts a local file to Base64 string for API submission
 */
async function fileToBase64(filename) {
    const filePath = path.join(ASSETS_DIR, filename);
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }
    const buffer = fs.readFileSync(filePath);
    return `data:image/png;base64,${buffer.toString('base64')}`;
}

/**
 * Registers a team by hitting the backend API
 */
async function registerTeam(name, logoFile, players) {
    try {
        console.log(`\n🚀 Preparing registration for: ${name}...`);
        
        const logoBase64 = await fileToBase64(logoFile);
        const idCardBase64 = await fileToBase64(ASSETS.ID_CARD);

        const payload = {
            schoolName: `${name} College`,
            schoolAddress: `Jl. Prestasi No. ${Math.floor(Math.random() * 50) + 1}, Jakarta Selatan`,
            whatsapp: `812${Math.floor(10000000 + Math.random() * 90000000)}`,
            level: 'SMA',
            gender: 'Putra',
            logoFile: logoBase64,
            players: players.map(pName => ({
                name: pName,
                cardFile: idCardBase64 // Using the same high-quality template for all
            })),
            officials: [`Coach ${pName()} `, `Manager ${pName()}`]
        };

        const response = await fetch(`${BACKEND_URL}/registrations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const text = await response.text();
        console.log(`📡 Status: ${response.status} ${response.statusText}`);
        if (!response.ok || !text.startsWith('{')) {
            console.error(`📡 Response text (first 100 chars): ${text.substring(0, 100)}...`);
        }
        
        const result = JSON.parse(text);
        if (result.success) {
            console.log(`✅ Success! ${name} registered.`);
            console.log(`   Registration ID: ${result.data.id}`);
            console.log(`   Logo URL: ${result.data.logo_url}`);
            return result.data;
        } else {
            console.error(`❌ API Error for ${name}:`, result.message);
            return null;
        }
    } catch (error) {
        console.error(`❌ System Error for ${name}:`, error.message);
        return null;
    }
}

// Random name helper for coaches
function pName() {
    const names = ['Sudirman', 'Bambang', 'Agus', 'Pratama', 'Wibowo', 'Sari', 'Indah'];
    return names[Math.floor(Math.random() * names.length)];
}

async function run() {
    console.log("=== STARTING TEST REGISTRATION ===");
    
    // Team 1
    const t1 = await registerTeam('GARUDA STUBS', ASSETS.LOGO_1, [
        'Budi Santoso', 'Andi Wijaya', 'Sandi Putra', 'Reza Pratama', 'Dimas Setiawan'
    ]);

    // Team 2
    const t2 = await registerTeam('ELANG MUDA', ASSETS.LOGO_2, [
        'Fajar Shodik', 'Guruh Soekarno', 'Hadi Mulya', 'Irfan Bachdim', 'Joko Susilo'
    ]);

    console.log("\n=== TEST REGISTRATION COMPLETE ===");
}

run();
