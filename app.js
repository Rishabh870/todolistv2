//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true , useUnifiedTopology: true } )

const itemsSchema = new mongoose.Schema({
  name:String
});

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name: "Welcome to TO DO LIST"
})

const item2 = new Item({
  name: "To add new task click +"
})

const item3 = new Item({
  name: "Checked the box to delete Items"
})

const defaultItem = [item1,item2, item3];

const listSchema = new mongoose.Schema({
  name:String,
  items: [itemsSchema]
});
const List = mongoose.model("List", listSchema)


app.get("/", function(req, res) {
  
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      
      Item.insertMany(defaultItem, function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("successfully saved");
        }
      });

      res.redirect("/");
    } else {
      
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
    
  } else {
    
    List.findOne({name : listName},function (err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })

  }

});

app.post("/delete", function(req, res){
  const checkedId = req.body.checkbox;
  const ListName = req.body.listName;

  if (ListName === "Today") {
    Item.findByIdAndRemove(checkedId, function(err){
      if (err) {
        console.log(err)
      } else {
        console.log("successfully Deleted");
        res.redirect("/")
      }
    })
    
  } else {
    List.findOneAndUpdate({name: ListName}, {$pull:{items:{_id: checkedId}}},function (err, foundList){
      if(!err){
        res.redirect("/"+ ListName)
      }
    })
  }
})


app.get("/:Id", function(req,res){
  const ListName = _.capitalize(req.params.Id);

  List.findOne({name : ListName},function (err, foundList) {
    if (!err) {
      if (!foundList) {// create new list
        const list = new List({
          name: ListName,
          items: defaultItem
        });
        list.save();
        res.redirect("/" + ListName)
      }
      else{
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })


});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
