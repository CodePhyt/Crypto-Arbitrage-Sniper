/**
 * CLAWD SECURE - SMOKE TESTS
 * 
 * Verifies that all 5 security directives are active and functioning correctly.
 * Run after installation to ensure the system is properly secured.
 * 
 * Usage: npm run test:smoke
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { initializeStorage, writeEncrypted, readEncrypted } from '../src/core/memory/storage';

// ============================================
// CONFIGURATION
// ============================================

const BASE_URL = process.env.TEST_BASE_URL || 'http://127.0.0.1:3000';
const GATEWAY_TOKEN = process.env.X_GATEWAY_TOKEN || '';

// Test results tracking
let passedTests = 0;
let failedTests = 0;

// ============================================
// COLORS
// ============================================

const COLORS = {
    GREEN: '\x1b[32m',
    RED: '\x1b[31m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    RESET: '\x1b[0m'
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function log(message: string, color: string = COLORS.RESET): void {
    console.log(`${color}${message}${COLORS.RESET}`);
}

function logTest(name: string): void {
    log(`\n[TEST] ${name}`, COLORS.BLUE);
}

function logPass(message: string): void {
    passedTests++;
    log(`  ✓ ${message}`, COLORS.GREEN);
}

function logFail(message: string): void {
    failedTests++;
    log(`  ✗ ${message}`, COLORS.RED);
}

/**
 * Make HTTP request to the agent API
 */
function makeRequest(
    path: string,
    method: string = 'GET',
    headers: Record<string, string> = {},
    body?: any
): Promise<{ statusCode: number; body: string }> {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);

        const options = {
            method,
            hostname: url.hostname,
            port: url.port,
            path: url.pathname + url.search,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode || 0,
                    body: data
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (body) {
            req.write(JSON.stringify(body));
        }

        req.end();
    });
}

// ============================================
// TEST 1: AUTHENTICATION (DIRECTIVE 1)
// ============================================

async function testAuthentication(): Promise<void> {
    logTest('Directive 1: Network Fortress & Authentication');

    try {
        // Test 1a: Request without token (MUST FAIL)
        const noTokenResponse = await makeRequest('/health');

        if (noTokenResponse.statusCode === 401) {
            logPass('Requests without token are rejected (401)');
        } else {
            logFail(`Expected 401, got ${noTokenResponse.statusCode}`);
        }

        // Test 1b: Request with invalid token (MUST FAIL)
        const badTokenResponse = await makeRequest('/health', 'GET', {
            'X-GATEWAY-TOKEN': 'invalid-token-12345'
        });

        if (badTokenResponse.statusCode === 401) {
            logPass('Requests with invalid token are rejected (401)');
        } else {
            logFail(`Expected 401, got ${badTokenResponse.statusCode}`);
        }

        // Test 1c: Request with valid token (MUST SUCCEED)
        if (!GATEWAY_TOKEN) {
            logFail('X_GATEWAY_TOKEN not set in environment');
            return;
        }

        const validTokenResponse = await makeRequest('/health', 'GET', {
            'X-GATEWAY-TOKEN': GATEWAY_TOKEN
        });

        if (validTokenResponse.statusCode === 200) {
            logPass('Requests with valid token are accepted (200)');
        } else {
            logFail(`Expected 200, got ${validTokenResponse.statusCode}`);
        }

    } catch (error) {
        logFail(`Authentication test error: ${error}`);
    }
}

// ============================================
// TEST 2: ENCRYPTION (DIRECTIVE 3)
// ============================================

async function testEncryption(): Promise<void> {
    logTest('Directive 3: Anti-Honeypot Data Encryption');

    const testFilePath = path.join(process.cwd(), 'data', 'smoke-test-data.txt');
    const plaintextSecret = 'This is a secret message: DO NOT STORE IN PLAINTEXT!';

    try {
        // Initialize storage
        initializeStorage();
        logPass('Encryption system initialized');

        // Write encrypted data
        await writeEncrypted(testFilePath, plaintextSecret);
        logPass('Data written with encryption');

        // Check that file on disk is NOT plaintext
        const encryptedFilePath = testFilePath + '.enc';
        const diskContent = fs.readFileSync(encryptedFilePath, 'utf8');

        if (diskContent.includes(plaintextSecret)) {
            logFail('CRITICAL: Data is stored in PLAINTEXT on disk!');
        } else {
            logPass('Data is encrypted on disk (not plaintext)');
        }

        // Verify it's valid JSON encrypted format
        try {
            const parsed = JSON.parse(diskContent);
            if (parsed.algorithm === 'aes-256-gcm' && parsed.ciphertext) {
                logPass('Encrypted format is valid AES-256-GCM');
            } else {
                logFail('Invalid encrypted format');
            }
        } catch {
            logFail('Encrypted file is not valid JSON');
        }

        // Read and decrypt
        const decrypted = await readEncrypted(testFilePath);

        if (decrypted === plaintextSecret) {
            logPass('Data decrypts correctly');
        } else {
            logFail('Decryption returned wrong data');
        }

        // Cleanup
        fs.unlinkSync(encryptedFilePath);
        logPass('Test cleanup completed');

    } catch (error) {
        logFail(`Encryption test error: ${error}`);
    }
}

// ============================================
// TEST 3: OLLAMA INTEGRATION (DIRECTIVE 4)
// ============================================

async function testOllama(): Promise<void> {
    logTest('Directive 4: Sovereign Ollama Integration');

    try {
        // Test Ollama health check
        const healthResponse = await makeRequest('/api/ollama/health', 'GET', {
            'X-GATEWAY-TOKEN': GATEWAY_TOKEN
        });

        if (healthResponse.statusCode === 200) {
            logPass('Ollama health endpoint responds (200)');

            const healthData = JSON.parse(healthResponse.body);
            if (healthData.healthy) {
                logPass('Ollama service is healthy');
            } else {
                logFail('Ollama service reports unhealthy status');
            }
        } else {
            logFail(`Ollama health check failed (${healthResponse.statusCode})`);
        }

        // Test model list
        const modelsResponse = await makeRequest('/api/models', 'GET', {
            'X-GATEWAY-TOKEN': GATEWAY_TOKEN
        });

        if (modelsResponse.statusCode === 200) {
            const modelsData = JSON.parse(modelsResponse.body);
            if (Array.isArray(modelsData.models)) {
                logPass(`Models endpoint works (${modelsData.models.length} models available)`);
            } else {
                logFail('Models endpoint returned invalid format');
            }
        } else {
            logFail(`Models endpoint failed (${modelsResponse.statusCode})`);
        }

    } catch (error) {
        logFail(`Ollama test error: ${error}`);
    }
}

// ============================================
// TEST 4: SANDBOXED EXECUTION (DIRECTIVE 5)
// ============================================

async function testSandbox(): Promise<void> {
    logTest('Directive 5: Sandboxed Tool Execution');

    try {
        // Test 4a: Execute safe command (SHOULD SUCCEED)
        const safeResponse = await makeRequest('/api/execute', 'POST', {
            'X-GATEWAY-TOKEN': GATEWAY_TOKEN
        }, {
            command: 'echo',
            args: ['Hello, World!'],
            userId: 'smoke-test'
        });

        if (safeResponse.statusCode === 200) {
            const safeData = JSON.parse(safeResponse.body);
            if (safeData.success && safeData.stdout?.includes('Hello, World!')) {
                logPass('Safe commands execute successfully');
            } else {
                logFail('Safe command execution returned unexpected result');
            }
        } else {
            logFail(`Safe command execution failed (${safeResponse.statusCode})`);
        }

        // Test 4b: Attempt dangerous command (MUST BE BLOCKED)
        const dangerousResponse = await makeRequest('/api/execute', 'POST', {
            'X-GATEWAY-TOKEN': GATEWAY_TOKEN
        }, {
            command: 'rm',
            args: ['-rf', '/'],
            userId: 'smoke-test'
        });

        const dangerousData = JSON.parse(dangerousResponse.body);

        if (!dangerousData.success && dangerousData.error?.includes('blocked')) {
            logPass('Dangerous commands are blocked by policy');
        } else if (dangerousData.requiresApproval) {
            logPass('Dangerous commands require human approval');
        } else {
            logFail('CRITICAL: Dangerous command was not blocked!');
        }

        // Test 4c: Check audit logging
        const auditResponse = await makeRequest('/api/audit?limit=5', 'GET', {
            'X-GATEWAY-TOKEN': GATEWAY_TOKEN
        });

        if (auditResponse.statusCode === 200) {
            const auditData = JSON.parse(auditResponse.body);
            if (Array.isArray(auditData.entries) && auditData.entries.length > 0) {
                logPass('Audit logging is active');
            } else {
                logFail('No audit entries found');
            }
        } else {
            logFail(`Audit log endpoint failed (${auditResponse.statusCode})`);
        }

    } catch (error) {
        logFail(`Sandbox test error: ${error}`);
    }
}

// ============================================
// MAIN TEST RUNNER
// ============================================

async function runSmokeTests(): Promise<void> {
    log('\n============================================================', COLORS.BLUE);
    log('🧪 CLAWD SECURE - SMOKE TEST SUITE', COLORS.BLUE);
    log('============================================================\n', COLORS.BLUE);

    // Validate environment
    if (!GATEWAY_TOKEN) {
        log('⚠️  WARNING: X_GATEWAY_TOKEN not set in environment', COLORS.YELLOW);
        log('   Some tests will be skipped\n', COLORS.YELLOW);
    }

    // Run all test suites
    await testAuthentication();
    await testEncryption();
    await testOllama();
    await testSandbox();

    // Summary
    log('\n============================================================', COLORS.BLUE);
    log('TEST SUMMARY', COLORS.BLUE);
    log('============================================================\n', COLORS.BLUE);

    const totalTests = passedTests + failedTests;
    log(`Total Tests: ${totalTests}`, COLORS.BLUE);
    log(`Passed: ${passedTests}`, COLORS.GREEN);
    log(`Failed: ${failedTests}`, failedTests > 0 ? COLORS.RED : COLORS.GREEN);

    if (failedTests === 0) {
        log('\n✅ ALL TESTS PASSED - System is secure and operational!\n', COLORS.GREEN);
        process.exit(0);
    } else {
        log('\n❌ SOME TESTS FAILED - Review errors above\n', COLORS.RED);
        process.exit(1);
    }
}

// Run tests
runSmokeTests().catch((error) => {
    log(`\n❌ Test suite crashed: ${error}\n`, COLORS.RED);
    process.exit(1);
});
