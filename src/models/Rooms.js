import Collection from "../lib/MongoBase";
import Promise from "bluebird";
import _ from "lodash";
import {Schema} from "mongoose";
import { getError } from '../lib/util';

class RoomsClass extends Collection{

    constructor(name, schema){

        super(name, schema);

    }

    pushSubMsg(room, msgid, submsgid){

        return new Promise(function(resolve, reject){

            const index = _.findIndex(room.msg, function(item){

                return item._id.toString() === msgid;

            });

            if(index === -1){

                reject(getError("訊息不存在", 526));

            }else{
                room.msg[index].msg.push({

                    mid : submsgid

                });

                room.save(function(err){

                    if(err){

                        reject(getError("儲存失敗", 524));

                    }else{

                        resolve(room);

                    }
                });

            }
        });
    }

    pushGB(id, type){
        return new Promise(function(resolve, reject){

            let result = this.show({"msg._id" : id});

            result.then(function(post){
                if(post === null){

                    reject(getError("文章不存在", 525));

                }else{

                    const index = _.findIndex(post.msg, function(item){

                        return item._id.toString() === id;

                    });

                    post.msg[index].push[type] += 1;

                    post.save(function(err){

                        if(err){

                            reject(getError("修改文章失敗", 526));

                        }else{

                            resolve(post);

                        }
                    });

                }
            },
            function(err){

                reject(err);

            });



        }.bind(this));
    }

}

const SubMessage = new Schema({

    mid : {type : Schema.Types.ObjectId},

});

const Message = new Schema({

    uid : {type : Schema.Types.ObjectId},

    title : {type : String},

    content : {type : String},

    created_time : {type : Number},

    msg : [SubMessage],

    push : {

        good : {

            type : Number,
            default : 0

        },
        bad : {

            type : Number,
            default : 0

        }
    },

    loc : {

        lng : {
            type : Number
        },
        lat : {
            type : Number
        }

    }

});

let Rooms = new RoomsClass("room", {

    poster : {

        uid : {type : Schema.Types.ObjectId},

    },

    content : {type : String},

    created_time : {
        type : Number
    },

    msg : [Message],

    loc : {

        lng : {type : Number},
        lat : {type : Number}

    }

});

export default Rooms;

