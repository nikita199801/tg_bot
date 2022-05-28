"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
let redis;
module.exports.connect = () => {
    const redisClient = new ioredis_1.default({
        port: 7100,
        host: "localhost",
        db: 8,
    });
    redisClient.on('error', e => console.error({ err: e }));
    redisClient.on('connect', () => {
        console.info(`Redis connected. localhost:7100`);
    });
    redis = redisClient;
};
module.exports.getConnection = () => redis;
//# sourceMappingURL=redis.js.map