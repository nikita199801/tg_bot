import mongo from "../modules/mongo";
const router = require('express').Router();

router
    .get('/dashboard/:id', async(req: any, res: any) => {
        try {
            if (req.isAuthenticated()) {
                const db = mongo.getConnection();
                const user = await db.collection('users').findOne({_id: req.params.id});
                if (!user) {
                    res.redirect('/');
                    return;
                }
                const issues = await db.collection('issues').find({ assignee: user.accountId, status: {$in: ['11', '21']} }).sort({id: -1}).limit(10).toArray();
                const closedIssues = await db.collection('issues').find({ assignee: user.accountId, status: '31' }).sort({id: -1}).limit(10).toArray();
                issues.forEach(e => e.self = `https://ott-support.atlassian.net/browse/${e.key}`)
                res.render('profile', {user: { ...user},  issues, closedIssues });
            }
        } catch (error) {
            console.error(error);
            res.sendStatus(500);
        }
    })

module.exports = router;