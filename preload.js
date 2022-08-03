// preload.js
const { spawn } = require('child_process');
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('versions', {
  test: () => {
    
    const child = spawn('node', ['./decoder/index.js'], {
      cwd: process.cwd(),
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
      env: {
        ELECTRON_RUN_AS_NODE: 1,
      }
    });
  
    child.on('message', (m) => {
      console.log('PARENT', m)
    });

    child.on('error', (code, signal) => { console.log(code, signal) })

    child.stderr.on('data', (data) => { console.log(Buffer.from(data).toString()) })
  
    child.send({hello: 'world'})

    console.log(child)
  

  }
})