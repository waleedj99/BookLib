var express = require('express');
var app = express();
app.set('view engine', 'ejs');
var bodyParser = require('body-parser')
const mongo = require('mongodb').MongoClient
const url = 'mongodb://localhost:27017'

app.use(bodyParser.urlencoded({ extended: false }))


app.get('/register', function (req, res) {
    var tagline = ''
    res.render('pages/register.ejs', {
        tagline: tagline
    });
    
})

app.get('/login', function (req, res) {
    res.render('pages/login.ejs');
})


app.get('/dup', function (req, res) {
    res.send("Username already Exists");
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


//NEED TO FIND A WAY TO AVOID DUPLICATES

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

