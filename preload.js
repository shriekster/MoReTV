// preload.js
const { spawn } = require('child_process');
const path = require('path');
const { contextBridge, ipcRenderer } = require('electron');

let decoder;

contextBridge.exposeInMainWorld('decoder', {
  test: () => {
    
    const cwd = process.cwd();
    const decoderPath = path.join(cwd, 'decoder/index.js');

    try {
    const decoder = spawn('node', [decoderPath], {
      cwd: cwd,
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: 1
      }
    });
    console.log(decoder)
  
    decoder.on('message', (m) => {
      //console.log('PARENT', m)
    });

    decoder.on('error', (err) => { console.log('SPAWN ERROR', err) })

    decoder.stderr.on('data', (data) => {'STDERR:',  console.log(Buffer.from(data).toString()) })

    decoder.stdout.on('data', (data) => {'STDERR:',  console.log(Buffer.from(data).toString()) })
  
    decoder.send({hello: 'world'})

    decoder.on('exit', (code) => {console.log('exit code', code)})

    
  } catch (err) {
    console.log('err', err)
  }

  }
})

ipcRenderer.on('closing', (_) => { let killed = decoder?.kill('SIGKILL'); ipcRenderer.send('closing', { killed }) })
