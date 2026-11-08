"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const server_js_1 = require("../src/server.js");
const database_1 = require("@frameflow/database");
(0, node_test_1.describe)('Auth API Endpoints', () => {
    const app = (0, server_js_1.buildServer)();
    (0, node_test_1.before)(async () => {
        await app.ready();
    });
    (0, node_test_1.after)(async () => {
        await database_1.prisma.user.deleteMany({
            where: { email: { contains: 'authtest' } },
        });
        await app.close();
    });
    (0, node_test_1.it)('registers a new user successfully', async () => {
        const email = `authtest-${Date.now()}@example.com`;
        const res = await app.inject({
            method: 'POST',
            url: '/api/auth/register',
            payload: {
                email,
                password: 'password123',
                name: 'Auth Test User',
            },
        });
        node_assert_1.default.strictEqual(res.statusCode, 201);
        const body = JSON.parse(res.payload);
        node_assert_1.default.ok(body.token);
        node_assert_1.default.strictEqual(body.user.email, email);
        node_assert_1.default.strictEqual(body.user.name, 'Auth Test User');
    });
    (0, node_test_1.it)('rejects registration with duplicate email', async () => {
        const email = `authtest-dup-${Date.now()}@example.com`;
        await app.inject({
            method: 'POST',
            url: '/api/auth/register',
            payload: {
                email,
                password: 'password123',
            },
        });
        const res = await app.inject({
            method: 'POST',
            url: '/api/auth/register',
            payload: {
                email,
                password: 'password123',
            },
        });
        node_assert_1.default.strictEqual(res.statusCode, 409);
    });
    (0, node_test_1.it)('logs in an existing user and returns JWT', async () => {
        const email = `authtest-login-${Date.now()}@example.com`;
        await app.inject({
            method: 'POST',
            url: '/api/auth/register',
            payload: {
                email,
                password: 'password123',
            },
        });
        const res = await app.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: {
                email,
                password: 'password123',
            },
        });
        node_assert_1.default.strictEqual(res.statusCode, 200);
        const body = JSON.parse(res.payload);
        node_assert_1.default.ok(body.token);
        node_assert_1.default.strictEqual(body.user.email, email);
    });
    (0, node_test_1.it)('rejects login with wrong password', async () => {
        const email = `authtest-badpwd-${Date.now()}@example.com`;
        await app.inject({
            method: 'POST',
            url: '/api/auth/register',
            payload: {
                email,
                password: 'password123',
            },
        });
        const res = await app.inject({
            method: 'POST',
            url: '/api/auth/login',
            payload: {
                email,
                password: 'wrongpassword',
            },
        });
        node_assert_1.default.strictEqual(res.statusCode, 401);
    });
    (0, node_test_1.it)('authenticates /api/auth/me using JWT token', async () => {
        const email = `authtest-me-${Date.now()}@example.com`;
        const regRes = await app.inject({
            method: 'POST',
            url: '/api/auth/register',
            payload: {
                email,
                password: 'password123',
            },
        });
        const { token } = JSON.parse(regRes.payload);
        const meRes = await app.inject({
            method: 'GET',
            url: '/api/auth/me',
            headers: {
                authorization: `Bearer ${token}`,
            },
        });
        node_assert_1.default.strictEqual(meRes.statusCode, 200);
        const body = JSON.parse(meRes.payload);
        node_assert_1.default.strictEqual(body.user.email, email);
    });
});
//# sourceMappingURL=auth.test.js.map