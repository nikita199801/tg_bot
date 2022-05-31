import passport, { use } from "passport";

const router = require('express').Router();

router

    .post('/login', passport.authenticate('password', { session: true }), async (req: any, res: any, next: Function) => {
        if (req.isAuthenticated()) {
            const { user } = req.session.passport;
            res.redirect(`/profile/dashboard/${user}`);
        }
    })

    .post('/logout', async (req: any, res: any, next: Function) => {
        req.logout(function (err: any) {
            res.redirect('/')
        });
    })
module.exports = router;