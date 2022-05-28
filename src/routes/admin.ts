import e, { Router } from "express";
import passport, { authenticate } from "passport";
const mongo = require('../modules/mongo');
const dbConfig = require('../modules/db_config').create(mongo);

const router = Router();

router
    .get('/config', async (req, res, next) => {
        try {
            const originalConfig = await dbConfig.getConfigFromStorage();
            res.send(JSON.stringify(originalConfig))
        } catch (error) {
            next()
        }
    })

    .post('/config/update', async (req, res, next) => {
        try {
            const data = req.body;
            await mongo.getConnection().collection('bot_options').replaceOne({ _id: 'config' }, { data: data.config });
            res.json({
                result: 'ok',
            });

        } catch (error) {
            next()
        }
    })

    .get('/config/panel', async (req, res, next) => {
        try {
            if (req.isAuthenticated()) {
                res.render('control_panel')
                next();
                return;
            }
            res.redirect('/');

        } catch (error) {
            next()
        }
    })


module.exports = router