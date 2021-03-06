import Collection from "../lib/MongoBase";
import Promise from "bluebird";
import _ from "lodash";
import {Schema} from "mongoose";
import { getError } from '../lib/util';

class RoomsClass extends Collection{

    constructor(name, schema){

        super(name, schema);

        this.schema = schema;

        this.schema.index( { loc : "2dsphere" } )

    }

    voteRoom(rid, type){

        return new Promise(function(resolve, reject){

            let updatequery = {};

            if(type === "good"){

                updatequery["$inc"] = {

                    "push.good" : 1

                };

            }else if(type === "bad"){

                updatequery["$inc"] = {

                    "push.bad" : 1

                };

            }
            let result = this.update(
                {_id : rid},
                updatequery);

            result.then(function(room){

                if(_.isNull(room)){

                    reject(getError("討論串不存在"));

                }else{

                    resolve(room);

                }

            }, function(err){

                reject(err);

            });
        }.bind(this));
    }

    pushRoomGB(id, type){

        return new Promise(function(resolve, reject){

            let result = this.show(id);

            result.then(function(post){

                post.push[type] += 1;

                post.save(function(err){

                    if(err){

                        reject(getError("修改失敗", 533));

                    }else{

                        resolve(post);

                    }
                });
            });
        }.bind(this));
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

let Message = new Schema({

    uid : {type : Schema.Types.ObjectId},

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

        type : {
            type : String,
            default : "point"
        },
        coordinates : [
            {type:Number}
        ],

        lng : {
            type : Number
        },
        lat : {
            type : Number
        }

    }

});

let Rooms = new RoomsClass("room", new Schema({

    poster : {

        uid : {type : Schema.Types.ObjectId},

    },

    title : {type : String},

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

    content : {type : String},

    created_time : {
        type : Number
    },

    msg : [Message],

    loc : {
        type : {
            type : String,
            default : "point"
        },
        coordinates : [
            {type:Number}
        ],

        lng : {type : Number},

        lat : {type : Number}

    }

}));

export default Rooms;

