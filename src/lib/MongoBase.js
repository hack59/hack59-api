import mongoose from "mongoose";
import Promise from "bluebird";
import { getError } from './util';

export class MongoBase {

    constructor(url= "mongodb://localhost:27017/kmemery"){

        this.lib = mongoose;

        this.db = mongoose.createConnection(url);

    }
}

export default class Collection extends MongoBase{

    constructor(name, schema){

console.log(MongoBase);
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

                reject(getError("搜尋失敗", 525));

            });
        }.bind(this));

    }

    update(query, update){

        return new Promise(function(resolve, reject){
            console.log(query);
            this.model.findOneAndUpdate(
                query,
                update)
            .exec()
            .then(function(data){

                console.log(data);
                resolve(data);

            }, function(err){

                reject(getError("修改失敗", 530));

            });
        }.bind(this));

    }

    list(query={}, sort="-created_time"){

        return new Promise(function(resolve, reject){
            this.model
            .find(query)
            .sort(sort)
            .exec(function(err, data){

                if(err){

                    reject(getError("搜尋失敗", 520));

                }else{

                    resolve(data);

                }
            });
        }.bind(this));

    }
}
