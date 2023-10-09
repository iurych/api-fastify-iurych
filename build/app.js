"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const fastify_1 = __importDefault(require("fastify"));
const transactions_1 = require("./routes/transactions");
const cookie_1 = __importDefault(require("@fastify/cookie"));
exports.app = (0, fastify_1.default)();
exports.app.register(cookie_1.default);
exports.app.register(transactions_1.transactionsRoutes, {
    prefix: 'transactions',
});
