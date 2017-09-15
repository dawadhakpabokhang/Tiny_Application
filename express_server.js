const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');

app.use(cookieParser());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/register", (req, res) => {
  res.render('register');
});

app.get("/login", (req, res) => {
  res.render('login');
});

// on the /urls path respond by rendering the urls_index page
app.get("/urls", (req, res) =>{
  let templateVars = { urls: urlDatabase,
                       user: users[ req.cookies["user_id"] ] };
  res.render("urls_index", templateVars);
});

// on this path it renders the urls_new page
app.get("/urls/new", (req, res) =>{
  let templateVars = { user: users[ req.cookies["user_id"] ]};
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  // this grabs the parameter of the ;shortURL and then redirects
  res.redirect('/urls/' + req.params.shortURL);
});

// takes user to the page displaying info based on myVar (the page is dynamic)
app.get("/urls/:myVar", (req, res) =>{
  let templateVars = {  shortURL: req.params.myVar,
                        urlList: urlDatabase,
                        user: users[ req.cookies["user_id"] ]};
  res.render('urls_show', templateVars)
});

// upon posting a new website, generate a randomstring for the website and
// push it and its url into the UrlDatabase
app.post("/urls", (req, res) => {
  let randomString = generateRandomString();
  longURL = req.body.longURL;
  // creating a new key and value and adding it to urlDatabase
  urlDatabase[randomString] = longURL;
  console.log(urlDatabase);
  res.redirect('/urls/' + randomString);
});

app.post("/register", (req, res) => {
  if(req.body.email == "" || req.body.password == ""){
    res.status(404).send();
  } else{
    console.log('nah not null');
    let newUserId = generateRandomString();
    let newEmail = req.body.email;
    let newPassword = req.body.password;
    res.cookie("user_id", newUserId);
    users[newUserId] = {id: newUserId, email: newEmail, password: newPassword};
    res.redirect('/urls');
  }
});

app.post("/urls/:id", (req, res) => {
 urlDatabase[req.params.id] = req.body.newLongUrl;
 res.redirect('/urls');
});

// READ THROUGH THIS LOGIN

app.post("/login", (req, res) => {
  var searchResult = null;

  //search through all users
  for(let id in users){
    let user = users[id];

    if(user.email === req.body.email){
      console.log("user match!" + user.email);
      searchResult = user;
    }
  }
  //check if user has been found
  if (searchResult === null){
    console.log('User not found!');
    res.status(403).end();
  }
  else if (searchResult.password === req.body.password) {
    res.cookie('user_id', searchResult.id);
    console.log('password match');

    let templateVars = { urls: urlDatabase,
                         user: searchResult };
    res.render('urls_index', templateVars);
  } else {
    console.log("Password do not match!");
    res.status(403).send();
  }
});

app.post("/logout", (req, res) => {
 res.clearCookie("user_id");
 res.redirect('/urls');
});

// this route gets rid of the key and value pair given by the user and present within the urlDatabase object
app.post("/urls/:key/delete", (req, res) => {
  delete urlDatabase[req.params.key];
  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// generate random number
function generateRandomString() {
  return Math.random().toString(36).substring(2,8);
}