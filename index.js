#!/usr/bin/env node

var x11     = require('x11');
var program = require('commander');
program
  .version(require('./package.json').version)
  .option('-w, --wid <win>', 'specify window id', Number)
  .option('-t, --type <atom>', 'emwh message type', String, '_NET_WM_STATE')
  .option('-a, --action <atom>', 'message action: remove/add/toggle', String, 'toggle')
  .option('-p, --prop1 <atom>', 'first property to set', String)
  .option('-q, --prop2 <atom>', 'second property to set', String)
  .parse(process.argv);


function getAtoms(X, list, cb) {
  var res = {};
  var getAtom = function() {
    if (list.length == 0)
      return cb(null, res);
    var name = list.shift();
    X.InternAtom(false, name, function(err, atom) {
      if (err)
        return cb(err);
      res[name] = atom;
      getAtom();
    });
  };
  getAtom();
}

x11.createClient(function(err, display) {
  if (err) {
    throw err;
  }
  var X = display.client;
  var root = display.screen[0].root;
  var wid = program.wid;
  var data = new Buffer(32);

  data.fill(0);
  data.writeInt8(33, 0); // 33 = ClientMessage
  data.writeInt8(32, 1); // format
  data.writeUInt32LE(wid, 4);

  var atomsList = [];

  if (program.type == '_NET_WM_STATE') {

    var actions = {
      remove: 0,
      add: 1,
      toggle: 2,
    }
    atomsList.push(program.type);
    var action = actions[program.action];
    if (typeof action == 'undefined') {
      console.error('Unknown action ( "-a" or "--action" argument ). Possible values are add, remove and toggle');
      return;
    }
    if (program.prop1)
      atomsList.push(program.prop1);
    if (program.prop2)
      atomsList.push(program.prop2);
    getAtoms(X, atomsList, function(err, atoms) {
      if (err) throw err;
      data.writeUInt32LE(atoms[program.type], 8);
      data.writeUInt32LE(action, 12);
      data.writeUInt32LE(atoms[program.prop1],  16);
      if (program.prop2)
        data.writeUInt32LE(atoms[program.prop2], 20);
      var sourceIndication = 1;
      data.writeUInt32LE(sourceIndication, 24);
      console.log(wid, action, atoms[program.type], atoms[program.prop1], atoms[program.prop2])
      X.SendEvent(root, 0, x11.eventMask.SubstructureRedirect, data);
    });
  } else {
    console.error("Unknown message type");
  }
});
