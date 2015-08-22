import _ from 'lodash';
import moment from 'moment';
import Promise from "bluebird";
import LoginManager from '../lib/LoginBase';
import { Router } from 'express';
import { Users, Rooms} from '../models';
import { getError } from '../lib/util';

let router = Router();

router.route("/search/comment/")
    .post(LoginManager.checkPermision, function(req, res, next){

        /**
         * @params _id room ID
         * @params skip 第幾筆開始
         * @params limit 總更回傳幾筆
         * **/

        let result = Rooms.showById(req.body._id);

        let user = req._login_required;

        result.then(function(room){

            if(_.isNull(room)){

                req.error = getError("找不到資料", 522);
                next();

            }else{

                let resp = _.pick(room, "_id");

                let tmp = room.msg.reverse();

                let array = _.map(tmp, (item) => {
                    item._doc.has_good = true;
                    item._doc.has_bad = true;

                    const good = _.find(user.good, (it) => {
                        return item._id.toString() === it._id.toString();
                    });

                    const bad = _.find(user.bad, (it) => {
                        return item._id.toString() === it._id.toString();
                    });
                    if(_.isUndefined(good)){
                        item._doc.has_good = false;
                    }

                    if(_.isUndefined(bad)){

                        item._doc.has_bad = false;

                    }
                    return item._doc;

                });
                resp.msg = _.slice(array, req.body.skip, req.body.limit);
                req.result = resp;
                req.message = "搜尋成功";
                next();

            }
        });
    });

router.route("/search/")
    .post(LoginManager.checkPermision, function(req, res, next){

        /**
         * @params skip 起始資料
         * @params limit 回傳幾筆
         * @params sort 排序
         * @params select 回傳的欄位
         ***/

        const sort = req.body.sort || "-created_time";

        const skip = req.body.skip || 0;

        const limit = req.body.limit || 10;

        const select = req.body.select || "_id title content created_time loc push";

        let query = {};

        if(req.body.titla){

            query.title = new RegExp(req.body.title, "i");

        }
        if(req.body.content){

            query.content = new RegExp(req.body.content, "i");

        }

        if(req.body.loc){

            query.loc = {
                    $geoWithin: {

                        $geometry: {

                            type : "Polygon" ,

                            coordinates: req.body.loc

                        }

                    }

                };
        }

        let result = Rooms.list(query, sort, select, skip, limit);

        result.then(function(rooms){

            req.result = rooms;
            req.message = "搜尋成功";
            next();


        }, function(err){

            req.error = err;
            req.message = "搜尋失敗";
            next();

        });
    });

router.route("/vote/")
    .post(LoginManager.checkPermision, function(req, res, next){

        /**
         * @params rid 聊天室ID
         * @params type 類型 good or bad
         *
         * **/

        const type = req.body.type;

        let user = req._login_required;

        let result = Rooms.voteRoom(req.body.rid, type);

        let data = {};


        result.then(function(room){

            data.room = room;

            return Users
                .pushGB(user._id, room._id, type);

        }, function(err){

            req.error = err;
            next();

        }).then(function(user){

            req.result = data.room;

            next();

        }, function(err){

            req.error = err;
            next();

        });

    });

router.route("/msg/vote/")
    .post(LoginManager.checkPermision, function(req, res, next){
    /**
     * @params post_id留言的Id
     * @params type : good or bad
     *
     * **/

        const uid = req._login_required.id;

        const type = req.body.type;

        let data = {};

        let result = Rooms.pushGB(req.body._id, type);

        result.then(function(post){

            console.log(post);
            data.post = post;
            return Users.pushGB(uid, post._id, type);

        }, function(err){

            req.error = err;
            req.message = "修改文章失敗";
            next();

        }).then(function(user){

            req.result = data.post;
            req.message = "修改成功";
            next();

        });
    });

router.route("/push/msg/")
    .post(LoginManager.checkPermision, function(req, res, next){

        /**
         * @params _id room._id
         * @params content 留言內容
         * @params loc 經緯度
         *      @params lng : 經度
         *      @params lat : 緯度
         * **/
        var query = _.pick(req.body
                , "loc", "content");

        query.loc.coordinates = [query.loc.lng, query.loc.lat];

        if(_.isEmpty(req.body._id)
                || _.isEmpty(query.content)){

            req.error = getError("留言內容與房間ID不可為空", 522);
            next();

        }else{

            query.created_time = moment().unix();

            let result = Rooms.showById(req.body._id);

            result.then(function(room){

                if(_.isNull(room)){

                    req.error = getError("房間不存在", 524);
                    next();

                }else{

                    room.msg.push(query);
                    room.save(function(err){

                        if(err){

                            req.error = getError("儲存失敗", 525);
                            next();

                        }else{

                            req.result = room;
                            req.message = "搜尋成功";
                            next();

                        }
                    });

                }

            });
        }
    });

router.route("/created/")
    .post(LoginManager.checkPermision, function(req, res, next){

        /**
         *  @params loc : 經緯度
         *      @params lng : 經度
         *      @params lat : 緯度
         *  @params content : 建立的內容或原因敘述
         *  @params title : 抬頭標題
         *
         * **/
        let query = _.pick(req.body
                , "loc", "content", "title");

        query.created_time = moment().unix();

        query.poster = req._login_required._id;

        query.loc.coordinates = [query.loc.lng, query.loc.lat];

        let result = Rooms
        .created(query)
        .then(
        function(rooms){

            req.result = rooms;
            req.message = "留言成功";
            next();

        }, function(err){

            req.error = err.toString();
            req.message = "寫入資料庫失敗";
            next();

        });
    });

export default router;

