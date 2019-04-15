var express = require('express');
var app = express();
app.set('view engine', 'ejs');
var bodyParser = require('body-parser')
const mongo = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017'
var assert = require('assert');
var fs = require('fs');



app.use(bodyParser.urlencoded({ extended: false }))
app.get('/',function(req,res){
    res.render('pages/index.ejs')
})
app.get('/register', function (req, res) {
    var tagline = ''
    res.render('pages/register.ejs', {
        tagline: tagline
    });
    
})

app.get('/login', function (req, res) {
    res.render('pages/login.ejs');
})
app.get('/upload', function (req, res){
    res.render('pages/upload')
})
app.post('/upload', function (req, res) {
    console.log(req.body.myFile.value)
    res.render('pages/upload')
    /*res.sendFile(__dirname + '/register.html')
    mongo.MongoClient.connect(url, function (error, client) {
        assert.ifError(error);
        var db = client.db('upload')
        var bucket = new mongo.GridFSBucket(db, {
            chunkSizeBytes: 1024,
            bucketName: 'songs'
        });
        fs.createReadStream('./').
            pipe(bucket.openUploadStream('module5 (2).docx')).
            on('error', function (error) {
                assert.ifError(error);
            }).
            on('finish', function () {
                console.log('done!');
                //process.exit(0);
            });
        //client.close()
    });*/
})
app.get('/download', function (req, res) {
    res.sendFile(__dirname + '/textbook.html')
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

app.post('/login', function (req, res) {

    mongo.connect(url, (err, client) => {
        if (err) {
            console.error(err)
            return
        }
        console.log("Connexted bois")
        var db = client.db('login')
        var collection = db.collection(req.body.username)
        collection.findOne({ username: req.body.username }, (err, item) => {
            console.log("Founf" + item)
            if (item.password == req.body.password)
                res.send("login Successful")
            else
                res.send("Login Failed")
        })
        client.close();
    })
})

app.post('/register', function (req, res) {

var arr =[]
    console.log("THis sIS THE sTArt");
    console.log(req.body)
    if (req.body.password == req.body.c_password) {

        mongo.connect(url, (err, client) => {
            if (err) {
                console.error(err)
                return
            }
            console.log("Connexted bois")
            var db = client.db('login')
            var collection = db.collection(req.body.username)
            


            db.listCollections().toArray(function (err, collInfos) {
                // collInfos is an array of collection info objects that look like:
                collInfos.forEach((ele) => {
                    //console.log(ele.name);
                    arr.push(ele.name)
                });

                console.log(arr)
                //collection.createIndex({ "username": 1 }, { unique: true });
                n = arr.includes(req.body.username)
                
                if (n) {
                    var tagline = "Username Taken"
                    res.render('pages/register.ejs', {  
                        tagline: tagline
                    })
                    console.log("Duplicate")
                    
                    //res.redirect('\dup')
                } else {
                    console.log("Adding")
                    //var tagline = "Press Submit"
                    //res.render('pages/login.ejs')
                    console.log("Duplicate")
                    //res.redirect('\login')
                }
            })



            collection.createIndex({ "username": 1 }, { unique: true });


            console.log("Adding")
            collection.insertOne({ username: req.body.username, password: req.body.password }, (err, item) => {
                res.render('pages/login.ejs')
            })

            // collection.findOne({ username: req.body.username }, (err, item) => {
            //     console.log(item)

            //     if (item){
            //         dup = true;
            //         res.redirect('\dup')
            //     }
            // })

            // console.log("Dup is " + dup)





            //res.redirect('\login');
            //...
            client.close()
        })
        //     console.log(use.password)
        //res.redirect('\login');
    }
    else
        res.send('Re_enter Password');

})

app.listen(3000);

