var kue = require('kue');
var nconf = require('nconf');

/**
 * create a keys.json file with below structure
 * 
 {
    "redisConfig": {
        "redis": {
            "host": "...",
            "port": ...,
            "auth": "..."
        }
    }
}
 */
nconf.file(
    './keys.json'
);
// create our job queue
var jobs = kue.createQueue(nconf.get('redisConfig'));

// one minute
var minute = 60000;

var email = jobs.create('email', {
    title: 'Account renewal required', to: 'test@gmail.com', template: 'renewal-email'
}).delay(minute)
    .priority('high')
    .save();


email.on('promotion', function () {
    console.log('renewal job promoted');
});

email.on('complete', function () {
    console.log('renewal job completed');
});

jobs.create('email', {
    title: 'Account expired', to: 'test@gmail.com', template: 'expired-email'
}).delay(minute * 10)
    .priority('high')
    .save();

jobs.process('email', 10, function (job, done) {
    setTimeout(function () {
        done();
    }, Math.random() * 60);
});

// start the UI
kue.app.listen(3000);
console.log('UI started on port 3000');