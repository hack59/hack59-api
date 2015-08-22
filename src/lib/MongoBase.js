import mongoose from "mongoose";
import Promise from "bluebird";

export class MongoBase {

    constructor(url= "mongodb://localhost:27017/kmemery"){

        this.lib = mongoose;

        this.db = mongoose.createConnection(url);

    }
}

export default class Collection extends MongoBase{

    constructor(name, schema){

        super();
        this.model = this.db.model(name, schema);

    }

    created(query){

        return new Promise(function(resolve, reject){
            this.model(query)
            .save(function(err, data){
                if(err){

                    reject(err);

                }else{

                    resolve(data);

                }
            });
        }.bind(this));
    }

    show(query){

        return this.model
            .findOne(query)
        .exec();

    }

    showById(id){

        return new Promise(function(resolve, reject){
            this.model.findOne(
                {_id : id})
            .exec()
            .then(function(data){

                resolve(data);

            }, function(err){

                reject(err);

            });
        }.bind(this));

    }

    update(query, update){

        return this.model.findOneAndUpdate(
            query,
            update)
        .exec();

    }

    list(query={}){

        return this.model
        .find(query)
        .exec();

    }
}
