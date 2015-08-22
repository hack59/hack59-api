import Collection from "../lib/MongoBase";
import Promise from "bluebird";
import _ from "lodash";
import {Schema} from "mongoose";
import { getError } from '../lib/util';

class MessageClass extends Collection{

    constructor(name, schema){

        super(name, schema);

    }

}

const SubMessage = new Schema({

    uid : {type : Schema.Types.ObjectId},

    content : {type : String},

    created_time : {type : Number},

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

let Message = new MessageClass("message", {

    uid : {type : Schema.Types.ObjectId},

    rid : {type : Schema.Types.ObjectId},

    msg : [SubMessage],

    content : {type : String},

    created_time : {type : Number},

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

export default Message;

