var assert = require('assert');
var fs = require('fs');
var mongo = require('mongodb');

var url = 'mongodb://localhost:27017';
var express = require('express');
var up = express();
app.get('/',function(req,res){
    res.sendFile(__dirname+'/register.html')
    mongo.MongoClient.connect(url, function (error, client) {
        assert.ifError(error);
        var db = client.db('upload')
        var bucket = new mongo.GridFSBucket(db, {
            chunkSizeBytes: 1024,
            bucketName: 'songs'
        });
        fs.createReadStream('./module5 (2).docx').
            pipe(bucket.openUploadStream('module5 (2).docx')).
            on('error', function (error) {
                assert.ifError(error);
            }).
            on('finish', function () {
                console.log('done!');
                //process.exit(0);
            });
            //client.close()
    });
})
app.get('/dn', function (req, res) {
    res.sendFile(__dirname+'/textbook.html')
    mongo.MongoClient.connect(url, function (error, client) {
        assert.ifError(error);
        var db = client.db('upload')
        //var bucket = new mongodb.GridFSBucket(db);
        var bucket = new mongo.GridFSBucket(db, {
            chunkSizeBytes: 1024,
            bucketName: 'songs'
        });
    bucket.openDownloadStreamByName('module5 (2).docx').
        pipe(fs.createWriteStream('./mod.docx')).
        on('error', function (error) {
            assert.ifError(error);
        }).
        on('finish', function () {
            console.log('done!');
            //process.exit(0);
        });
    //client.close()
    })
})
up.listen(8080)