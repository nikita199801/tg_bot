import passport, { use } from "passport";

const router = require('express').Router();

router

    .post('/login', passport.authenticate('password', { session: true }), async (req: any, res: any, next: Function) => {
        if (req.isAuthenticated()) {
            res.redirect('/admin/config/panel')
        }
    })

    .post('/logout', async (req: any, res: any, next: Function) => {
        req.logout(function (err: any) {
            res.redirect('/')
        });
    })
module.exports = router;