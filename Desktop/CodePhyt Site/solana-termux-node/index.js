require('dotenv').config();
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const isProd = process.env.NODE_ENV === 'production';
const VERCEL_API_URL = process.env.VERCEL_API_URL || (isProd ? 'https://codephyt.com/api/ares-sync' : 'http://localhost:3000/api/ares-sync');
const ARES_MASTER_KEY = process.env.ARES_MASTER_KEY || 'ARES_100X_SECURE_TOKEN';
const ORCHESTRATOR_URL = process.env.ORCHESTRATOR_URL || 'http://127.0.0.1:8000';
const SWARM_KEY = process.env.ARES_SWARM_KEY || 'ARES_100X_SECURE_TOKEN';
const POLL_INTERVAL_MS = 10000;

console.log('🚀 Initiating Solana Termux Node (Zero Trust Bridge)...');

// ─────────────────────────────────────────────────────────────────────────────
// WHATSAPP CLIENT
// ─────────────────────────────────────────────────────────────────────────────
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('[\u26A0\uFE0F ACTION REQUIRED] Scan this QR code to link Solana Termux WhatsApp Node:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WhatsApp Bridge Online. Routing active.');
    startVercelPolling();
});

// ─────────────────────────────────────────────────────────────────────────────
// WHATSAPP DIRECT MESSAGE HANDLER
// ─────────────────────────────────────────────────────────────────────────────
client.on('message', async (msg) => {
    // Ignore group messages for now unless mentioned
    const chat = await msg.getChat();
    if (chat.isGroup) return;

    console.log(`[WHATSAPP IN] ${msg.from}: ${msg.body}`);

    try {
        const response = await axios.post(`${ORCHESTRATOR_URL}/incoming-lead`, {
            message: msg.body,
            email: msg.from, // Use phone number as identifier
            intent: 'GENERAL' // Will be re-classified by Orchestrator
        }, {
            headers: { 'x-ares-swarm-key': SWARM_KEY }
        });

        const reply = response.data.reply;
        const mediaBase64 = response.data.media_base64;
        const mediaName = response.data.media_name;

        console.log(`[ORCHESTRATOR OUT] -> WhatsApp: ${reply}`);

        if (mediaBase64 && mediaName) {
            console.log(`[ORCHESTRATOR OUT] -> Media Attached: ${mediaName}`);
            const media = new MessageMedia('application/pdf', mediaBase64, mediaName);
            await client.sendMessage(msg.from, media, { caption: reply });
        } else {
            await client.sendMessage(msg.from, reply);
        }

    } catch (error) {
        console.error('[ROUTING ERROR] Failed to reach Orchestrator:', error.message);
        await client.sendMessage(msg.from, 'ARES Command is temporarily offline. I will respond to your query shortly.');
    }
});

client.initialize();


// ─────────────────────────────────────────────────────────────────────────────
// VERCEL POLLING (THE DUMB VAULT SYNC)
// ─────────────────────────────────────────────────────────────────────────────
async function startVercelPolling() {
    console.log(`⏱️ Starting Web Sync Polling every ${POLL_INTERVAL_MS / 1000}s...`);

    setInterval(async () => {
        try {
            // 1. Fetch pending tasks from Vercel
            const res = await axios.get(VERCEL_API_URL, {
                headers: { 'Authorization': `Bearer ${ARES_MASTER_KEY}` }
            });

            const tasks = res.data.tasks || [];

            if (tasks.length > 0) {
                console.log(`[WEB SYNC] Found ${tasks.length} pending tasks from Vercel Vault.`);
            }

            // 2. Process each task
            for (const task of tasks) {
                console.log(`[WEB SYNC] Processing task ${task.messageId}`);
                let replyContent = '';

                try {
                    // Route to local Python Orchestrator
                    const orchRes = await axios.post(`${ORCHESTRATOR_URL}/incoming-lead`, {
                        message: task.userText,
                        email: task.email,
                        intent: 'GENERAL'
                    }, {
                        headers: { 'x-ares-swarm-key': SWARM_KEY }
                    });

                    replyContent = orchRes.data.reply;
                    const mediaName = orchRes.data.media_name;
                    const mediaBase64 = orchRes.data.media_base64;
                    const requiresApproval = orchRes.data.requires_approval;

                    console.log(`[ORCHESTRATOR OUT] -> Web: ${replyContent}`);
                    if (mediaName) console.log(`[ORCHESTRATOR OUT] -> Media Generated: ${mediaName}`);

                } catch (orchErr) {
                    console.error('[ORCHESTRATOR ERROR]', orchErr.message);
                    replyContent = 'ARES Command is temporarily offline. Your inquiry is safe in the vault. We will respond soon.';
                }

                // 3. Post reply back to Vercel
                try {
                    await axios.post(VERCEL_API_URL, {
                        messageId: task.messageId,
                        replyContent,
                        mediaBase64: orchRes?.data?.media_base64,
                        mediaName: orchRes?.data?.media_name,
                        requiresApproval: orchRes?.data?.requires_approval
                    }, {
                        headers: { 'Authorization': `Bearer ${ARES_MASTER_KEY}` }
                    });
                    console.log(`[WEB SYNC] Completed task ${task.messageId}`);
                } catch (updateErr) {
                    console.error('[VERCEL UPDATE ERROR]', updateErr.message);
                }
            }

        } catch (error) {
            console.error('[WEB SYNC ERROR] Failed to poll Vercel:', error.message);
        }
    }, POLL_INTERVAL_MS);
}
