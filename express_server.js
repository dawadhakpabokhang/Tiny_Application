const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const password = "purple-monkey-dinosaur"; // you will probably this from req.params
const hashedPassword = bcrypt.hashSync(password, 10);

app.use(cookieParser());
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

let urlDatabase = {
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    userID: "creator"
  },
  "9sm5xK": {
    url: "http://www.google.com",
    userID: "creator"
  }
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
  if(req.cookies["user_id"]){
  let templateVars = { urls: urlDatabase,
                       user: req.cookies["user_id"]};
  res.render("urls_index", templateVars);
  } else{
    res.redirect('/login');
  }
});

// on this path it renders the urls_new page
app.get("/urls/new", (req, res) =>{
  let user_id = req.cookies["user_id"];
  if(user_id){
    let templateVars = { user: users[ req.cookies["user_id"] ]};
    res.render("urls_new", templateVars);
  }
  else{
    res.redirect('/login');
  }
});

app.get("/u/:shortURL", (req, res) => {
  // this grabs the parameter of the ;shortURL and then redirects
  res.redirect(urlDatabase[req.params.shortURL].url);
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
  let urlElement = {
    url: longURL,
    userID: req.cookies["user_id"]
  }
  urlDatabase[randomString] = urlElement;
  res.redirect('/urls/' + randomString);
});

app.post("/register", (req, res) => {
  if(req.body.email == "" || req.body.password == ""){
    res.status(404).send();
  } else{
    let newUserId = generateRandomString();
    let newEmail = req.body.email;
    let newPassword = req.body.password;
    res.cookie("user_id", newUserId);
    users[newUserId] = {id: newUserId, email: newEmail, password: newPassword};
    res.redirect('/urls');
  }
});

// update entry if user is logged in
app.post("/urls/:id", (req, res) => {
  longURL = req.body.newLongUrl;
  let urlElement = {
    url: longURL,
    userID: req.cookies["user_id"]
  }
  urlDatabase[req.params.id] = urlElement;
  res.redirect('/urls');
});

// READ THROUGH THIS LOGIN

app.post("/login", (req, res) => {
  var searchResult = null;
  //search through all users
  for(let id in users){
    let user = users[id];

    if(user.email === req.body.email){
      searchResult = user;
    }
  }
  //check if user has been found
  if (searchResult === null){
    res.status(403).end();
  }
  else if (searchResult.password === req.body.password) {
    res.cookie('user_id', searchResult.id);

    let templateVars = { urls: urlDatabase,
                         user: searchResult };
    res.redirect('/urls');
  } else {
    res.status(403).send();
  }
});

app.post("/logout", (req, res) => {
 res.clearCookie("user_id");
 res.redirect('/urls');
});

// this route gets rid of the key and value pair given by the user and present within the urlDatabase object
app.post("/urls/:key/delete", (req, res) => {
  //if user is logged in then only user can delete url
  if(req.cookies["user_id"] == urlDatabase[req.params.key].userID){
    delete urlDatabase[req.params.key];
    res.redirect('/urls');
  } else{
    res.status(403).send();
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// generate random number
function generateRandomString() {
  return Math.random().toString(36).substring(2,8);
}