"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionsRoutes = void 0;
const zod_1 = require("zod");
const database_1 = require("../database");
const node_crypto_1 = require("node:crypto");
const check_sessionId_1 = require("../middlewares/check-sessionId");
const transactionsRoutes = async (app) => {
    app.addHook('preHandler', async (request) => {
        console.log(`[${request.method}] ${request.url}`);
    });
    app.get('/', {
        preHandler: [check_sessionId_1.CheckIdSessionIdExist],
    }, async (request) => {
        const sessionId = request.cookies.session_id;
        const transactions = await (0, database_1.knex)('transactions')
            .where('session_id', sessionId)
            .select();
        return {
            transactions,
        };
    });
    app.get('/:id', {
        preHandler: [check_sessionId_1.CheckIdSessionIdExist],
    }, async (request) => {
        const allTransactionsSchema = zod_1.z.object({
            id: zod_1.z.string().uuid(),
        });
        const { id } = allTransactionsSchema.parse(request.params);
        const sessionId = request.cookies.session_id;
        const transaction = await (0, database_1.knex)('transactions')
            .where({
            session_id: sessionId,
            id,
        })
            .first();
        return { transaction };
    });
    app.get('/summary', {
        preHandler: [check_sessionId_1.CheckIdSessionIdExist],
    }, async (request) => {
        const sessionId = request.cookies.session_id;
        const summary = await (0, database_1.knex)('transactions')
            .where('session_id', sessionId)
            .sum('amount', { as: 'amount' })
            .first();
        return { summary };
    });
    app.post('/', async (request, reply) => {
        const createBodySchema = zod_1.z.object({
            title: zod_1.z.string(),
            amount: zod_1.z.number(),
            type: zod_1.z.enum(['credit', 'debit']),
        });
        const { amount, title, type } = createBodySchema.parse(request.body);
        let sessionId = request.cookies.session_id;
        if (!sessionId) {
            sessionId = (0, node_crypto_1.randomUUID)();
            reply.cookie('session_id', sessionId, {
                path: '/',
                maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
            });
        }
        await (0, database_1.knex)('transactions').insert({
            id: (0, node_crypto_1.randomUUID)(),
            title,
            amount: type === 'credit' ? amount : amount * -1,
            session_id: sessionId,
        });
        return reply.status(201).send();
    });
};
exports.transactionsRoutes = transactionsRoutes;
