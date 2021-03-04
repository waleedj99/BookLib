var express = require('express');
var bodyParser = require('body-parser')
const methodOverride = require('method-override');
const mongo = require('mongodb').MongoClient
var assert = require('assert');
var fs = require('fs');
var session = require('express-session')
const mongoose = require('mongoose');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const multer = require('multer')
const crypto = require('crypto');
const { time } = require('console');
var app = express();
app.use(methodOverride('_method'));
//mongodb + srv://waleed:<password>@cluster0-iewfh.mongodb.net/admin?retryWrites=true&w=majority
const url = "mongodb+srv://waleed:Throwaway69@cluster0-iewfh.mongodb.net/test?retryWrites=true&w=majority"
//'mongodb://localhost:27017'
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static("public"));

const SESS_LIFETIME = 1000*60*60*2 
const SESS_NAME = 'ses1'
const IN_PROD = 'production'
const SESS_SECRET = "something"
const conn = mongoose.createConnection(url);//Connect to database
var isLogin = false
var loggedInUsername = ''

const thirdSem = ['Computer Organisation', 'OOPs with Java', 'Data Structures', 'Discrete Mathematics', 'Logic Design']
const fourthSem = ['Algorithm Design', 'Microprocessors', "Operating System", 'Linux system programming']
const fifthSem = ['Database Management Systems', 'Computer Networks']
const sixthSem = ['Computer Graphics', 'Compilers', 'Internet and Web Technologies']
const seventhSem = ['Object Modelling and Design', 'Advanced Computer Architecture', 'Embedded Computing System']
const eighthSem = ['Machine Learning', 'Python', 'Big Data']

function timer(ms) {
    return new Promise(res => setTimeout(res, ms));
}


app.use(
    session({
        name:SESS_NAME,
        resave:false,
        saveUninitialized:false,
        secret:SESS_SECRET,
        cookie:{
            maxAge:SESS_LIFETIME,
            sameSite:true,
            secure:IN_PROD,
        }
        
    })
)


const redirectHome = (req,res,next)=>{
    console.log(isLogin)
    if(!isLogin){
        next()
    }else{
       res.redirect('/') 
    }
}


const redirectLogin = (req, res, next) => {
    console.log(isLogin)
    if (isLogin) {
        next()
    } else {
        res.redirect('/login')
    }
}
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
                console.log(file)
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

app.get('/', redirectLogin, (req, res) => {

    gfs.files.find().toArray((err, files) => {

        // Check if files
        if (!files || files.length === 0) {
            res.render('pages/index', { files: false });
        } else {
            files.map(file => {
                if (file.contentType === 'application/pdf' || file.contentType === 'application/pdf') {
                    file.isPdf = true;
                } else {
                    file.isPdf = false;
                }
            });
            res.render('pages/index', { files: files });
        }
    });
});

app.get('/register', redirectHome, function (req, res) {
    var tagline = ''
    res.render('pages/register.ejs', {
        tagline: tagline
    }); 
})
app.get('/notes', redirectLogin,(req,res)=>{
    gfs.files.find().toArray((err, files) => {

        // Check if files
        if (!files || files.length === 0) {

            res.render('pages/notes', { files: false ,isLogin:isLogin})
        } else {
            files.map(file => {
                if (file.contentType === 'application/pdf' && file.category === "notes" && file.semester === req.query.sem) {
                    file.isNote = true;
                } else {
                    file.isNote = false;
                }
            });
            
            switch (req.query.sem) {
                case '3':
                    res.render('pages/notes', { files: files, sem:'3', subject: thirdSem } )
                    break;
                case '4':
                    res.render('pages/notes', { files: files, sem: '4', subject: fourthSem })
                    break;
                case '5':
                    res.render('pages/notes', { files: files, sem: '5', subject: fifthSem })
                    break;
                case '6':
                    res.render('pages/notes', { files: files, sem: '6',subject: sixthSem })
                    break;
                case '7':
                    res.render('pages/notes', { files: files, sem: '7', subject: seventhSem })
                    break;
                case '8':
                    res.render('pages/notes', { files: files, sem: '8', subject: eighthSem })
                    break;
                default:
                    res.render('pages/notes', { files: files })
            }
        }
    });

})
app.get('/textbook', redirectLogin,(req,res)=>{
    
    gfs.files.find().toArray((err, files) => {
        // Check if files
        if (!files || files.length === 0) {
            
            res.render('pages/textbook', { files: false , isLogin:isLogin})
        } else {
            files.map(file => {
                if (file.contentType === 'application/pdf' && file.category === "textbook" && file.semester === req.query.sem) {
                    file.isTB = true;
                } else {
                    file.isTB = false;
                }
            });
            
            switch (req.query.sem) {
                case '3':
                    res.render('pages/textbook', { files: files, sem: '3', subject: thirdSem })
                    break;
                case '4':
                    res.render('pages/textbook', { files: files, sem: '4', subject: fourthSem })
                    break;
                case '5':
                    res.render('pages/textbook', { files: files, sem: '5', subject: fifthSem })
                    break;
                case '6':
                    res.render('pages/textbook', { files: files, sem: '6', subject: sixthSem })
                    break;
                case '7':
                    res.render('pages/textbook', { files: files, sem: '7', subject: seventhSem })
                    break;
                case '8':
                    res.render('pages/textbook', { files: files, sem: '8', subject: eighthSem })
                    break;
                default:
                    res.render('pages/textbook', { files: files })
            }
        }
    });
})



app.get('/login',redirectHome, function (req, res) {
    res.render('pages/login.ejs');
})
app.get('/logout', redirectLogin,(req,res)=>{
    isLogin = false
    res.redirect('/')
})
app.get('/pdf/:filename', redirectLogin, (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        // Check if file
        console.log(file)
        if (!file || file.length === 0) {
            console.log(err)
            return res.status(404).json({
                err: 'No file exists'
            });
        }

        // Check if pdf
        if (file.contentType === 'application/pdf' || file.contentType === 'application/pdf') {
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

app.get('/upload', redirectLogin, function (req, res){
    res.render('pages/upload')
})



app.post('/upload', upload.single('myFile'), (req, res) => {
    mongo.connect(url, (err, client) => {
        if (err) {
            console.error(err)
            return
        }
        
            var db = client.db('test')

            //console.log(db)
            var collection = db.collection("uploads.files")
            //console.log(collection)
            console.log("req is " + req.body.semester)
            collection.updateOne(
                { filename: req.file.filename },
                {
                    $set:
                    {
                        semester: req.body.semester,
                        subject: req.body.subject,
                        category: req.body.category,
                        uploader: loggedInUsername
                    }
                }
            )
            client.close();
        
        

        res.redirect('/')

    })
})




app.post('/save/:filename/:type', redirectLogin,(req,res)=>{
    mongo.connect(url, (err, client) => {
        if (err) {
            console.error(err)
            return
        }
        var db = client.db('BookLib')
        var collection = db.collection('savedBooks')
        collection.createIndex({ username: 1, bookname:1},{unique:true})
        collection.insertOne({ username: loggedInUsername, bookname: req.params.filename},(err,result)=>{
            if(err){
                return
            }
        })
        res.redirect('/' + req.params.type +'/?sem=3')
        
    })
})



app.post('/unsave/:filename/:type', redirectLogin, (req, res) => {
    mongo.connect(url, (err, client) => {
        if (err) {
            console.error(err)
            return
        }
        var db = client.db('BookLib')
        var collection = db.collection('savedBooks')
        collection.createIndex({ username: 1, bookname: 1 }, { unique: true })
        collection.deleteOne({ username: loggedInUsername, bookname: req.params.filename }, (err, result) => {
            if (err) {
                return
            }
        })
        res.redirect('/profile')

    })
})

let saved = []
let upl =[]
app.get('/profile',function(req,res){
    saved=[]
    upl = []


    gfs.files.find({ uploader: loggedInUsername }).toArray((err, file) => {
        // Check if file

        file.forEach(element => {
            upl.push(element)

        });
        //console.log(savedandupl)
        //res.send(savedandupl)
        if (!file || file.length === 0) {
            console.log(err)
            return res.status(404).json({
                err: 'No file exists'
            });
        }
    })
    mongo.connect(url, (err, client) => {
        if (err) {
            console.error(err)
            return
        }
        var renderSent = false
        var db = client.db('BookLib')
        var collection = db.collection('savedBooks')
        collection.find({username:loggedInUsername}).toArray((err,files)=>{
            files.forEach((element,index) => {
                gfs.files.findOne({ filename: element.bookname },(err, file) => {
                    // Check if file                    
                    saved.push(file)
                    console.log(file)
                    if (index == files.length - 1) {
                        renderSent = true
                        res.render("pages/profile", { usem: usem, uname: loggedInUsername, sbooks: saved, ubooks: upl, isLogin: isLogin })
                    }
                    
                   //res.send(saved)
                })           
                console.log(index)     
                //savedandupl.push(element)
            });
            
        })
        
        client.close()
    })

    
})

app.post('/login', function (req, res) {
    mongo.connect(url, (err, client) => {
        if (err) {
            console.error(err)
            return
        }
        var db = client.db('BookLib')
        var collection = db.collection('loginInfo')
        collection.findOne({ "username": req.body.username }, (err, item) => {
            if(item!=null){
                if (item.password == req.body.password){
                    isLogin = true
                    usem = item.user_sem
                    loggedInUsername = req.body.username
                    res.redirect('/')
                }
                else{
                    isLogin = false
                    res.send("Login Failed")
                }
            }
            else{
                res.send("Login Failed")
            } 
        })
        client.close();
        })
    
})

let usem = "Same"
let toInsert = true
app.post('/register', function (req, res) {
    console.log("THis sIS THE sTArt");
    console.log(req.body)
    if (req.body.password == req.body.c_password) {

        mongo.connect(url, (err, client) => {
            if (err) {
                console.error(err)
                return
            }
            var db = client.db('BookLib')
            var collection = db.collection('loginInfo')
            collection.findOne({ username: req.body.username},(err,result)=>{
                if(result!=null){
                    toInsert = true
                }else{
                    toInsert = false
                }
            })   
            collection.createIndex({ "username": 1 }, { unique: true });
                if(toInsert==true){
                    collection.insertOne({ username: req.body.username, password: req.body.password, user_sem: req.body.semester })
                    res.redirect('/login')
                }
                else{
                    var tagline = "Username taken"
                    res.render('pages/register.ejs', {
                        tagline: tagline
                    })
                }
            
            client.close()
        })
    }
    else {
        var tagline = "Passwords don't match"
        res.render('pages/register.ejs', {
            tagline: tagline
        })
    }
})
var port = process.env.PORT || 3000
app.listen(port, function() {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});