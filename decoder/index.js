const cv = require('@u4/opencv4nodejs');

//console.log(cv)

process.on('message', (m) => {

    console.log('CHILD got message', m);
    process.send('message from CHILD');

});