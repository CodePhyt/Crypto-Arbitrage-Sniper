require('dotenv').config();
const axios = require('axios');

const VERCEL_API_URL = 'http://localhost:3000/api/ares-sync';
const ORCHESTRATOR_URL = 'http://127.0.0.1:8008';
const SWARM_KEY = 'ares_sk_prod_9988776655';
const ARES_MASTER_KEY = 'ares_sk_prod_9988776655';

async function forcePoll() {
    console.log(`⏱️ Starting Web Sync Polling (FORCED)...`);

    try {
        const res = await axios.get(VERCEL_API_URL, {
            headers: { 'Authorization': `Bearer ${ARES_MASTER_KEY}` }
        });

        const tasks = res.data.tasks || [];

        if (tasks.length > 0) {
            console.log(`[WEB SYNC] Found ${tasks.length} pending tasks from Vercel Vault.`);
        } else {
            console.log(`[WEB SYNC] No pending tasks found.`);
            return;
        }

        for (const task of tasks) {
            console.log(`[WEB SYNC] Processing task ${task.messageId}`);
            let replyContent = '';

            try {
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

                await axios.post(VERCEL_API_URL, {
                    messageId: task.messageId,
                    replyContent,
                    mediaBase64: orchRes?.data?.media_base64,
                    mediaName: orchRes?.data?.media_name,
                    requiresApproval: orchRes?.data?.requires_approval
                }, {
                    headers: { 'Authorization': `Bearer ${ARES_MASTER_KEY}` }
                });
                console.log(`[WEB SYNC] Completed task ${task.messageId} - requiresApproval: ${requiresApproval}`);
            } catch (orchErr) {
                console.error('[ERROR]', orchErr.message);
            }
        }

    } catch (error) {
        console.error('[WEB SYNC ERROR] Failed to poll Vercel:', error.message);
    }
}

forcePoll();
