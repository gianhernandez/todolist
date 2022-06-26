const express = require('express')
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");




app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://admin-gian:Test123@cluster0.r5v15.mongodb.net/todolistDB",{ useNewUrlParser:true});


const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);




app.get('/', (req, res) => {

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully saved the default items to DB.");
        }
      });
      res.redirect("/");
    } else {
      res.render('list', {listTitle: "Today", newListItems: foundItems});
    }

  });

});

app.get("/:customListName", (req, res) => {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, (err, foundList) => {
      if (!err) {
        if (!foundList) {
          const list = new List({
            name: customListName,
            items: defaultItems
          });

          list.save();
          res.redirect("/" + customListName);
        } else {
          res.render('list', {listTitle: foundList.name, newListItems: foundList.items});
        }
      }
    });

});




//Separating list items depending of which todolist
app.post("/", (req, res) => {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {

    List.findOne({name: listName}, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })

  }

});

app.post("/delete", (req,res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

if (listName === "Today") {

  Item.findByIdAndRemove(checkedItemId, (err) => {
    if (!err) {
      console.log("Successfully deleted item");
      res.redirect("/");
    }

  });
} else {

  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, (err, foundList) => {
    if (!err) {
      res.redirect("/" + listName);
    }
  });

}



})


app.listen(process.env.PORT || 3000, function () {
console.log("Server started.");
 });
