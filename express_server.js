const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

// on the /urls path respond by rendering the urls_index page
app.get("/urls", (req, res) =>{
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// on this path it renders the urls_new page
app.get("/urls/new", (req, res) =>{
  res.render("urls_new");
});

// takes user to the page displaying info based on myVar (the page is dynamic)
app.get("/urls/:myVar", (req, res) =>{
  let templateVars = {  shortURL: req.params.myVar,
                        urlList: urlDatabase };
  res.render('urls_show', templateVars)
});


app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send("Ok");
});

// on the /hello path respond with an html document that contains Hey!
app.get("/hello", (req, res) =>{
  res.end('<html><body><h1>Hey!</h1></body></html');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// generate random number
function generateRandomString() {
  return Math.random().toString(36).substring(2,8);
}