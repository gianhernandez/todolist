const express = require('express')
const date = require(__dirname + "/date.js");
const app = express();
const items = [];
const workItems = [];

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true}));
app.use(express.static("public"));



app.get('/', function(req, res) {

  const day = date.getDate();
  res.render('list', {listTitle: day, newItem: items});

});

//Separating list items depending of which todolist
app.post("/", (req,res) => {

  const item = req.body.newItem;

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }

});

//Creating a work todolist
app.get("/work", (req, res) => {
  res.render("list", {listTitle: "Work List", newItem: workItems  });
})


app.listen(process.env.PORT)
