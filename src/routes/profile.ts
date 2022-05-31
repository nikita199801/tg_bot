import mongo from "../modules/mongo";
const router = require('express').Router();

router
    .get('/dashboard/:id', async(req: any, res: any) => {
        if (req.isAuthenticated()) {
            const db = mongo.getConnection();
            const test = 'asdsadsadsad'
            const user = await db.collection('users').findOne({_id: req.params.id});
            const issues = await db.collection('issues').find({}).limit(10).toArray();
            issues.forEach(e => e.self = `https://ott-support.atlassian.net/browse/${e.key}`)
            res.render('profile', {user: { ...user},  issues });
        }
    })

module.exports = router;