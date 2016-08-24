var scheduler = require('./scheduler');
var jobName = "test", delay = 8000, count = 0;

setInterval(appendQ, 1000);

scheduler.processJob(jobName, 50, function () {
    console.log("after job completion");
});

function appendQ() {
    ++count;
    if (count < 10) {
        console.log("scheduling more jobs, ", count);
        scheduler.queueJob({
            jobName: jobName,
            input: {
                name: "job " + count,
                id: count * 10
            },
            delay: delay
        });

    }
    //update just a few jobs, unix UTC time * 1000 to get JS date
    var newDelay = new Date(1472015618*1000);
    (count === 5) ? scheduler.bulkupdate(newDelay) : null;
}