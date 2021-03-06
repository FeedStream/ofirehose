// Feed for ofirehose.com
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

var Feed = function() {
    this._items = [];
};

var MAX = 20;

Feed.prototype.unshift = function(value) {

    var result = this._items.unshift(value);

    if (this._items.length > MAX) {
        this._items.splice(MAX, this._items.length - MAX);
    }

    return this._items.length;
};

Feed.prototype.slice = function(begin, end) {
    return this._items.slice(begin, end);
};

exports.Feed = Feed;
