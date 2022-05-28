import { isEmpty, isObject } from "lodash";

const config = require('config');
const dummy = require('../../config/dummy.json');

function validate(config: any) {
    return !isEmpty(config) && isObject(config);
}

let dbConfig: any;

module.exports.create = function (mongo: any) {
    async function getConfigFromStorage() {
        const config = (await mongo.getConnection().collection('bot_options').findOne({ _id: 'config' })).data;
        if (!validate(config)) {
            return dummy;
        }
        dbConfig = config;
        return config;
    }

    function getConfig() {
        if (dbConfig) {
            return Promise.resolve(dbConfig);
        }

        return getConfigFromStorage();
    }

    // setInterval(() => getConfigFromStorage(), 5000);

    return {
        async updateConfig(rConfig: any) {
            if (!validate(rConfig)) {
                return Promise.reject(new Error('Incorrect config'));
            }
            await mongo.getConnection().collection('bot_options').updateOne({ _id: 'config' }, rConfig)
            dbConfig = rConfig;
            return console.info('Config was updated and overriden');
        },
        middleware(req: any, res: any, next: Function) {
            getConfig()
                .then((config: any) => {
                    req.config = config;
                    res.locals.dbConfig = config;
                    next();
                });
        },
        getConfig,
        getConfigFromStorage,
    };
};
