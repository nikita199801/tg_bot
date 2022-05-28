import Redis from "ioredis";

let redis: Redis;

module.exports.connect = () => {
    const redisClient = new Redis({
        port: 7100,
        host: "localhost",
        db: 8,
      });

    redisClient.on('error', e => console.error({ err: e }));

    redisClient.on('connect', () => {
        console.info(`Redis connected. localhost:7100`);
    });

    redis = redisClient;
}

module.exports.getConnection = () => redis;

