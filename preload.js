// preload.js
const { spawn } = require('child_process');
const path = require('path');
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('decoder', {
  test: () => {
    
    const cwd = process.cwd();
    const decoderPath = path.join(cwd, 'decoder/index.js');

    console.log('exec', process.execPath)

    try {
    const child = spawn('node', [decoderPath], {
      cwd: cwd,
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
      env: {
        ...process.env,
        ELECTRON_RUN_AS_NODE: 1
      }
    });
  
    child.on('message', (m) => {
      console.log('PARENT', m)
    });

    child.on('error', (err) => { console.log('SPAWN ERROR', err) })

    child.stderr.on('data', (data) => {'STDERR:',  console.log(Buffer.from(data).toString()) })

    child.stdout.on('data', (data) => {'STDERR:',  console.log(Buffer.from(data).toString()) })
  
    child.send({hello: 'world'})

    child.on('exit', (data) => {console.log(data)})

    console.log('child', child)
  } catch (err) {
    console.log('err', err)
  }

  }
})