// main function for ofirehose.com
//
// Copyright 2012 StatusNet Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var fs = require("fs"),
    express = require('express'),
    routes = require('./routes'),
    localURL = require('./lib/url').localURL,
    config = require('./config'),
    os = require('os'),
    Databank = require('databank').Databank,
    globals = require('./lib/globals'),
    Hub = require('./lib/hub').Hub,
    Feed = require('./lib/feed').Feed;

var server = config.server || os.hostname();
var address = config.address || server;
var useHTTPS = (config.key) ? true : false;
var app, bounce;

localURL.server = server;
localURL.protocol = (useHTTPS) ? "https" : "http";

if (useHTTPS) {
    app = express.createServer({key: fs.readFileSync(config.key),
                                cert: fs.readFileSync(config.cert)});
    bounce = express.createServer(function(req, res, next) {
        var host = req.header('Host');
        res.redirect('https://'+host+req.url, 301);
    });
} else {
    app = express.createServer();
}

module.exports = app;

// Configuration

app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'utml');
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.logger());
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
    app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/feed.json', routes.feed);

app.get('/doc/publish', routes.publish);
app.get('/doc/subscribe', routes.subscribe);

app.post('/ping', routes.ping);

app.post('/hub', routes.hub);

// DB

var driver = config.driver || "disk";
var params = config.params || {};

params.schema = Hub.schema;

var db = Databank.get(driver, params);

db.connect({}, function(err) {
    if (err) {
        console.error("Couldn't connect to JSON store: " + err.message);
    } else {
        globals.hub(new Hub(localURL.server, db));
        globals.feed(new Feed());
        if (useHTTPS) {
            app.listen(443, address);
            bounce.listen(80, address);
        } else {
            app.listen(80, address);
        }
    }
});
