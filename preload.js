// preload.js
const { spawn } = require('child_process');
const path = require('path');
const { contextBridge, ipcRenderer } = require('electron');

const cwd = process.cwd();
const decoderPath = path.join(cwd, 'decoder/index.js');

let decoder = spawn('node', [decoderPath], {
  cwd: cwd,
  stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
  env: {
    ...process.env,
    ELECTRON_RUN_AS_NODE: 1
  }
});

decoder.on('message', (m) => {
  //console.log('PARENT', m)
});

decoder.on('error', (err) => { console.log('SPAWN ERROR', err) })

decoder.stderr.on('data', (data) => {'STDERR:',  console.log(Buffer.from(data).toString()) })

decoder.stdout.on('data', (data) => {'STDERR:',  console.log(Buffer.from(data).toString()) })

decoder.on('exit', (code) => {console.log('exit code', code)})

contextBridge.exposeInMainWorld('decoder', {

  test: () => {

    console.log(decoder);
    decoder.send({hello: 'world'});
  
  },
  
});

ipcRenderer.on('closing', (_) => { let killed = decoder?.kill('SIGKILL'); ipcRenderer.send('closing', { decoderProcessKilled: killed }) });
