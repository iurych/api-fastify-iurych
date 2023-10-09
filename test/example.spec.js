"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const child_process_1 = require("child_process");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = require("../src/app");
(0, vitest_1.describe)('Transactions routes', () => {
    (0, vitest_1.beforeAll)(async () => {
        await app_1.app.ready();
    });
    (0, vitest_1.afterAll)(async () => {
        await app_1.app.close();
    });
    (0, vitest_1.beforeEach)(() => {
        (0, child_process_1.execSync)('npm run knex migrate:rollback --all');
        (0, child_process_1.execSync)('npm run knex migrate:latest');
    });
    (0, vitest_1.it)('Should be able to create a new transaction', async () => {
        await (0, supertest_1.default)(app_1.app.server)
            .post('/transactions')
            .send({
            title: 'New transaction',
            amount: 5000,
            type: 'credit',
        })
            .expect(201);
    });
    (0, vitest_1.it)('Should be able to list all transactions', async () => {
        const mockTransactions = await (0, supertest_1.default)(app_1.app.server)
            .post('/transactions')
            .send({
            title: 'New transaction',
            amount: 5000,
            type: 'credit',
        });
        const cookies = mockTransactions.get('Set-Cookie');
        const listTransactionResponse = await (0, supertest_1.default)(app_1.app.server)
            .get('/transactions')
            .set('Cookie', cookies)
            .expect(200);
        (0, vitest_1.expect)(listTransactionResponse.body.transactions).toEqual([
            vitest_1.expect.objectContaining({
                title: 'New transaction',
                amount: 5000,
            }),
        ]);
    });
    (0, vitest_1.it)('Should be able to list a specific transaction', async () => {
        const mockTransactions = await (0, supertest_1.default)(app_1.app.server)
            .post('/transactions')
            .send({
            title: 'New transaction',
            amount: 5000,
            type: 'credit',
        });
        const cookies = mockTransactions.get('Set-Cookie');
        const listTransactionResponse = await (0, supertest_1.default)(app_1.app.server)
            .get('/transactions')
            .set('Cookie', cookies)
            .expect(200);
        const transactionId = listTransactionResponse.body.transactions[0].id;
        const getTransactionResponse = await (0, supertest_1.default)(app_1.app.server)
            .get(`/transactions/${transactionId}`)
            .set('Cookie', cookies)
            .expect(200);
        (0, vitest_1.expect)(getTransactionResponse.body.transaction).toEqual(vitest_1.expect.objectContaining({
            title: 'New transaction',
            amount: 5000,
        }));
    });
    (0, vitest_1.it)('Should be able to sumarize all transactions', async () => {
        const mockTransactions = await (0, supertest_1.default)(app_1.app.server)
            .post('/transactions')
            .send({
            title: 'Credit transaction',
            amount: 5000,
            type: 'credit',
        });
        const cookies = mockTransactions.get('Set-Cookie');
        await (0, supertest_1.default)(app_1.app.server)
            .post('/transactions')
            .set('Cookie', cookies)
            .send({
            title: 'Debit transaction',
            amount: 2000,
            type: 'debit',
        });
        const summaryResponse = await (0, supertest_1.default)(app_1.app.server)
            .get('/transactions/summary')
            .set('Cookie', cookies)
            .expect(200);
        (0, vitest_1.expect)(summaryResponse.body.summary).toEqual({
            amount: 3000,
        });
    });
});
