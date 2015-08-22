import Collection from "../lib/MongoBase";
import Promise from "bluebird";
import _ from "lodash";
import {Schema} from "mongoose";
import { getError } from '../lib/util';

class UsersClass extends Collection{

    constructor(name, schema){

        super(name, schema);

    }

    pushGB(uid, post_id, type){

        return new Promise(function(resolve, reject){

            let result = this.showById(uid);

            result.then(function(user){

                user[type].push({

                    pid : post_id

                });

                user.save(function(err){

                    if(err){

                        reject(getError("儲存會員失敗", 526));

                    }else{

                        resolve(user);

                    }
                });
            },function(err){

                reject(err);

            });

        }.bind(this));
    }
}

const GBpost = new Schema({

    pid : {type : Schema.Types.ObjectId}

});

let Users = new UsersClass("user", new Schema({

    created_time : {
        type : Number
    },

    hash : {

        type : String

    },

    ios_token : {

        type : String,
        default : ""

    },

    good : [GBpost],

    bad : [GBpost]

}));

export default Users;

