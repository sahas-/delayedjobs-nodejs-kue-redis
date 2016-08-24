function _sendmail(data, done) {
    setTimeout(function () {
        done();
    }, 2000);

}

module.exports = {
    sendmail: function (data, done) {
        _sendmail(data, done);
    }
};