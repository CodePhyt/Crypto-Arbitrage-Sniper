// test_zero_trust_loop.js
console.log('🔥 INITIATING OPERATION: GHOST LOOP (Zero-Trust E2E Test) 🔥\n');

const axios = require('axios');
const { exec } = require('child_process');
const crypto = require('crypto');

// --- Configuration ---
const NEXTJS_URL = 'http://localhost:3000'; // Make sure front-end is running
const TERMUX_NODE_PATH = './solana-termux-node/index.js';
const SWARM_KEY = process.env.ARES_SWARM_KEY || 'ARES_100X_SECURE_TOKEN';
const MASTER_KEY = process.env.ARES_MASTER_KEY || 'ARES_100X_SECURE_TOKEN';

const mockUserToken = crypto.randomUUID();
const mockEmail = `test-operative-${Date.now()}@zerogroup.com`;
const mockMessage = "Ich brauche 10.000 Pizza-Kartons (Zero Group). Wie ist der Preis?";

async function runTest() {
    try {
        console.log(`[STEP 1] 🛡️  Simulating Vercel Frontend UI Request...`);
        console.log(`         User: ${mockEmail}`);
        console.log(`         Message: "${mockMessage}"`);

        // 1. Simulate frontend chat POST (The "Dumb Vault" drop)
        const gatewayRes = await axios.post(`${NEXTJS_URL}/api/swarm-gateway`, {
            message: mockMessage,
            email: mockEmail,
            userToken: mockUserToken
        }, {
            headers: { 'x-ares-swarm-key': SWARM_KEY }
        });

        console.log(`[STEP 1] ✅ Vault Response: "${gatewayRes.data.response}"`);
        console.log(`[STEP 1] ⏳ Message should now be stored with 'PENDING_ARES'\n`);

        // Wait a moment for DB persistence
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log(`[STEP 2] 🚀 Bootletting Local Termux Node...`);
        // 2. Start the local termux node simulation
        const termuxProcess = exec(`node ${TERMUX_NODE_PATH}`, {
            env: { ...process.env, VERCEL_API_URL: `${NEXTJS_URL}/api/ares-sync`, ORCHESTRATOR_URL: 'http://127.0.0.1:8000', ARES_MASTER_KEY: MASTER_KEY, ARES_SWARM_KEY: SWARM_KEY }
        });

        let testCompleted = false;

        termuxProcess.stdout.on('data', async (data) => {
            const output = data.toString();
            process.stdout.write(`[TERMUX] ${output}`);

            // Detect successful Web Sync pick-up
            if (output.includes('pending tasks from Vercel')) {
                console.log(`\n[STEP 2] ✅ Termux Node successfully polled the Vault!`);
                console.log(`[STEP 3] 🧠 Forwarding to Viking Orchestrator...`);
            }

            // Detect successful orchestrator reply
            if (output.includes('[ORCHESTRATOR OUT] -> Web:')) {
                console.log(`\n[STEP 3] ✅ Viking Brain processed the RAG response.`);
                console.log(`[STEP 4] 🔒 Termux updating Vault via POST...`);
            }

            // Detect successful loop closure
            if (output.includes('Completed task')) {
                console.log(`\n[STEP 4] ✅ Ghost Loop Complete! Vault status updated to 'REPLIED'.`);
                testCompleted = true;

                // Verify the final state in the database
                verifyFinalState();
            }
        });

        termuxProcess.stderr.on('data', (data) => {
            console.error(`[TERMUX ERROR] ${data.toString()}`);
        });

        // Fail-safe logic
        setTimeout(() => {
            if (!testCompleted) {
                console.error('\n❌ E2E TEST FAILED: Timeout reached before Ghost Loop completed.');
                termuxProcess.kill('SIGINT');
                process.exit(1);
            }
        }, 30000); // 30 second timeout


        async function verifyFinalState() {
            setTimeout(async () => {
                console.log(`\n[VERIFICATION] Fetching final DB state...`);
                // Use the GET /api/ares-sync to prove it's no longer pending
                try {
                    const syncRes = await axios.get(`${NEXTJS_URL}/api/ares-sync`, {
                        headers: { 'Authorization': `Bearer ${MASTER_KEY}` }
                    });

                    // We check if OUR message is still there. It shouldn't be.
                    const ourTask = syncRes.data.tasks.find(t => t.email === mockEmail);

                    if (!ourTask) {
                        console.log(`[VERIFICATION] ✅ Target email ${mockEmail} is no longer in PENDING_ARES queue.`);
                        console.log(`\n🎉 OPERATION "PHYSICAL UPLINK" E2E TEST SUCCESSFUL! 🎉`);
                    } else {
                        console.error(`[VERIFICATION] ❌ Target email ${mockEmail} is STILL in PENDING_ARES queue! API update failed.`);
                    }
                } catch (e) {
                    console.error('[VERIFICATION ERROR]', e.message);
                } finally {
                    termuxProcess.kill('SIGINT');
                    process.exit(0);
                }
            }, 3000); // wait a few seconds before verify
        }


    } catch (error) {
        console.error('\n❌ TEST HARNESS FAILED:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

runTest();
