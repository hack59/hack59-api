import http from 'http';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { toRes } from "./lib/util";
import middleware from './middleware';
import { users, rooms } from "./api";
import multipartMiddleware from 'connect-multiparty';

var app = express();
app.server = http.createServer(app);

// internal middleware
app.use(middleware());
app.use(multipartMiddleware());

// 3rd party middleware
app.use(cors({
	exposedHeaders: ['Link']
}));

app.use(bodyParser.json({
	limit : '100kb'
}));

// api router

//app.use('/api', api());


app.use("/users", users, toRes);

app.use("/rooms", rooms, toRes);


app.server.listen(process.env.PORT || 8080);


console.log(`Started on port ${app.server.address().port}`);

export default app;
