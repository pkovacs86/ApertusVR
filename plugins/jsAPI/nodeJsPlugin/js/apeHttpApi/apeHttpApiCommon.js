/*MIT License

Copyright (c) 2016 MTA SZTAKI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.*/

var util = require('util');
var expressValidator = require('express-validator');
var ape = require('apertusvr/js/ape');
var utils = require('apertusvr/js/utils.js');

exports.moduleTag = 'ApeHTTPApiCommon';

exports.setProperties = function(req, res, next) {
  console.log('ape.httpApi.common.setProperties()');
  var respObj = new utils.responseObj();

  if (!respObj.validateHttpParams(req, res)) {
    res.status(400).send(respObj.toJSonString());
    return;
  }

  for(var i=0; i<req.body.data.items.length; i++) {
    var item = req.body.data.items[i];
    if (item.type == "node") {
      ape.nbind.JsBindManager().getNode(item.name, function(error, obj) {
        if (error) {
          respObj.addError({
            name: 'invalidCast',
            msg: obj,
            code: 666
          });
          res.status(400).send(respObj.toJSonString());
          return;
        }

        var q = utils.quaternionFromAngleAxis(item.properties.orientation.angle, item.properties.orientation.axis);
        console.log(item.name);
        console.log('quaternion: ' + q);
        obj.setOrientation(q);
      });
    }
  }

  respObj.addEvent({
    group: 'PROPERTIES',
    type: 'PROPERTIES_SET',
    subjectName: ''
  });
  res.send(respObj.toJSonString());
};

exports.getPosition = function(req, res, next) {
  console.log('ape.httpApi.nodes.getPosition()');
  var respObj = new utils.responseObj();

  // handle http param validation errors
  req.checkParams('name', 'UrlParam is not presented').notEmpty()
  req.checkParams('name', 'UrlParam must be a string').isAlpha();
  if (!respObj.validateHttpParams(req, res)) {
    res.status(400).send(respObj.toJSonString());
    return;
  }

  // get name from url
  var name = req.params.name;

  ape.nbind.JsBindManager().getNode(name, function(error, obj) {
    if (error) {
      respObj.addError({
        name: 'invalidCast',
        msg: obj,
        code: 666
      });
      res.status(400).send(respObj.toJSonString());
      return;
    }

    respObj.setData({
      position: utils.convertToJsObj(obj.getPosition())
    });
    res.send(respObj.toJSonString());
  });
};

exports.setPosition = function(req, res, next) {
  console.log('ape.httpApi.nodes.setPosition()');
  var respObj = new utils.responseObj();

  // handle http param validation errors
  req.checkParams('name', 'UrlParam is not presented').notEmpty()
  req.checkParams('name', 'UrlParam must be a string').isAlpha();
  req.checkBody('x', 'BodyParam is not presented').notEmpty();
  req.checkBody('x', 'BodyParam must be a number').isInt();
  req.checkBody('y', 'BodyParam is not presented').notEmpty();
  req.checkBody('y', 'BodyParam must be a number').isInt();
  req.checkBody('z', 'BodyParam is not presented').notEmpty();
  req.checkBody('z', 'BodyParam must be a number').isInt();
  if (!respObj.validateHttpParams(req, res)) {
    res.status(400).send(respObj.toJSonString());
    return;
  }

  // get node name from urlParam
  var name = req.params.name;

  ape.nbind.JsBindManager().getNode(name, function(error, obj) {
    if (error) {
      respObj.addError({
        name: 'invalidCast',
        msg: obj,
        code: 666
      });
      res.status(400).send(respObj.toJSonString());
      return;
    }

    var newPos = new ape.nbind.Vector3(Number(req.body.x), Number(req.body.y), Number(req.body.z));
    if (newPos.notEqualTo(obj.getPosition())) {
      respObj.addEvent({
        group: 'NODE',
        type: 'NODE_POSITION',
        subjectName: obj.getName()
      });
    }
    obj.setPosition(newPos);
    respObj.setData({
      position: utils.convertToJsObj(obj.getPosition())
    });
    res.send(respObj.toJSonString());
  });
};