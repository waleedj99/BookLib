var express = require('express');
var bodyParser = require('body-parser')
const methodOverride = require('method-override');
const mongo = require('mongodb').MongoClient
var assert = require('assert');
var fs = require('fs');
var formidable = require('formidable');
const pdf = require('pdf-thumbnail');

const mongoose = require('mongoose');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const multer = require('multer')
const crypto = require('crypto');
const path = require('path');


var app = express();
app.use(methodOverride('_method'));
const url = 'mongodb://localhost:27017'
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }))

const conn = mongoose.createConnection(url);

// Init gfs
let gfs;

conn.once('open', () => {
    // Init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});



const storage = new GridFsStorage({
    url: url,
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = file.originalname//buf.toString('hex') + path.extname(file.originalname);
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                
                };
                resolve(fileInfo);
            });
        });
    }
});
const upload = multer({ storage });

app.get('/register', function (req, res) {
    var tagline = ''
    res.render('pages/register.ejs', {
        tagline: tagline
    }); 
})
app.get('/', (req, res) => {
    
    gfs.files.find().toArray((err, files) => {
        
        // Check if files
        if (!files || files.length === 0) {
            
            res.render('pages/index', { files: false });
        } else {
            files.map(file => {
                if ( file.contentType === 'application/pdf' || file.contentType === 'application/pdf') 
                {
                    file.isPdf = true;
                } else 
                {
                    file.isPdf = false;
                }
            });
            res.render('pages/index', {files:files });
        }
    });
});
app.get('/login', function (req, res) {
    res.render('pages/login.ejs');
})

app.get('/image/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // Check if file
        console.log(file)
        if (!file || file.length === 0) {
            return res.status(404).json({
                err: 'No file exists'
            });
        }

        // Check if pdf
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
            // Read output to browser
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        } else {
            res.status(404).json({
                err: 'Not an image'
            });
        }
    });
});

app.get('/upload', function (req, res){
    res.render('pages/upload')
})
app.post('/upload', upload.single('myFile'), (req, res) => {
    res.json({file:req.file})
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
            client.close()
        })
        }
    else
        res.send('Re_enter Password');

})
app.listen(3000);