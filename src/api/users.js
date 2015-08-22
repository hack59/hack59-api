import _ from 'lodash';
import LoginManager from '../lib/LoginBase';
import { Router } from 'express';
import { Users } from '../models';
import { getError } from '../lib/util';

let router = Router();

router.route("/created/")
    .post(function(req, res, next){
        let query = _.pick(req.body
            , "account", "pwd"
            , "fb_id", "name"
            , "ios_token");

        let createdmember = Users.created(query);

        createdmember.then(function(user){

            const token = LoginManager.getFreshToken(user);
            req.result = {
                user : user,
                token : token
            };
            req.message = "建立會員成功";
            next();

        }, function(err){

            req.error = getError("建立會員失敗", 520);
            next();

        });

    });
export default router;
