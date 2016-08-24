var kue = require('kue');
var nconf = require('nconf');
var worker = require('./worker');

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
var queue = kue.createQueue(nconf.get('redisConfig'));

function _queueJob(data, done) {
    var job = queue.create(data.jobName,
        {
            data: data.input
        }).delay(data.delay)
        .save();

}

function _processJob(name, done) {
    queue.process(name, 1, function (job, done) {
        console.log("processing job", job.id);
        worker.sendmail(job.data, function () {
            console.log("finished runnig task");
            done && done();
        });

    });
}

function _bulkUpdate(newDelay,cb) {
    getJobIdsToUpdate('delayed', function (idArr) {
        console.log("Ids to update", idArr);
        idArr.forEach(function (id) {
            kue.Job.get(id, function (err, job) {
                console.log("updating job with new delay", id);
                job.set('created_at', new Date().getTime());
                job.delay(newDelay).save();
            });
        });

    })

}

function getJobIdsToUpdate(kind, done) {
    if (kind === 'delayed') {
        queue.delayed(function (error, Ids) {
            done(Ids);
        });
    }
    if (kind === 'active') {
        queue.active(function (error, Ids) {
            done(Ids);
        });
    }
    if (kind === 'inactive') {
        queue.inactive(function (erroe, Ids) {
            done(Ids);
        });
    }
}

kue.app.listen(3000);
console.log('UI started on port 3000');

module.exports = {
    queueJob: function (data, done) {
        _queueJob(data, done);
    },
    processJob: function (name, done) {
        _processJob(name, done);
    },
    bulkupdate: function (newDelay,done) {
        _bulkUpdate(newDelay,done);
    }
};