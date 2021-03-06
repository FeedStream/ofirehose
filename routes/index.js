// routes for ofirehose.com
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

var globals = require('../lib/globals'),
    localURL = require('../lib/url').localURL;

exports.index = function(req, res) {
    res.render('index', { title: 'Home' });
};

exports.ping = function(req, res) {

    var activity = req.body,
        theFeed = globals.feed(),
        theHub = globals.hub();

    theFeed.unshift(activity);
    theHub.distribute(activity, localURL('feed.json'), function(err) {});

    res.writeHead(201);
    res.end();
};

exports.feed = function(req, res) {
    
    var theFeed = globals.feed(),
        collection = {
            displayName: "OFirehose.com feed",
            hubs: [localURL('hub')],
            id: localURL('feed.json'),
            objectTypes: ["activity"],
            items: theFeed.slice(0, 20)
        };

    res.setHeader('Link', ['<'+localURL('hub')+'>; rel="hub"',
                           '<'+localURL('feed.json')+'>; rel="self"']);

    res.writeHead(200, {'Content-Type': 'application/json'});

    res.end(JSON.stringify(collection));
};

exports.publish = function(req, res) {
    res.render('publish', { title: 'Help for publishers' });
};

exports.subscribe = function(req, res) {
    res.render('subscribe', { title: 'Help for subscribers' });
};

var namespacedParams = function(body) {
    var params = {}, dotted, dot, namespace, name;
    
    for (dotted in body) {
        dot = dotted.indexOf(".");
        if (dot !== -1) {
            namespace = dotted.substr(0, dot);
            name = dotted.substr(dot + 1);
        } else {
            namespace = "__default__";
            name = dotted;
        }
        if (!params.hasOwnProperty(namespace)) {
            params[namespace] = {};
        }
        params[namespace][name] = body[dotted];
    }

    return params;
};

exports.hub = function(req, res) {
    var params = namespacedParams(req.body),
        theHub = globals.hub();

    switch (params.hub.mode) {
    case 'subscribe':
        theHub.subscribe(params, function(err, results) {
            if (err) {
                res.writeHead(500, {"Content-Type": "text/plain"});
                res.end(err.message);
            } else {
                res.writeHead(204);
                res.end();
            }
        });
        break;
    case 'unsubscribe':
        theHub.unsubscribe(params, function(err, results) {
            if (err) {
                res.writeHead(500, {"Content-Type": "text/plain"});
                res.end(err.message);
            } else {
                res.writeHead(204);
                res.end();
            }
        });
        break;
    case 'publish':
    default:
        res.writeHead(400, {"Content-Type": "text/plain"});
        res.end("That's not a mode this hub supports.");
    }
};
