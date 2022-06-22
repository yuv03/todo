//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://to_do:ron1234@cluster0.i6jke.mongodb.net/todolistDB");

// creating schema
const itemsSchema = new mongoose.Schema ({
  name : String
});

const listsSchema = new mongoose.Schema ({
  name : String,
  items : [itemsSchema]
});

// creating the model
const Item = mongoose.model("Item", itemsSchema);

const List = mongoose.model("List" , listsSchema);
//creating document in our collection

const item1 = new Item({
  name: "Welcome to your to do list"
});

const item2 = new Item({
  name: "Hit + to add new items"
});

const item3 = new Item({
  name : "<-- Hit this to delete the item"
});

const itemArray = [item1, item2, item3];




// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function(req, res) {

// const day = date.getDate();
Item.find({}, function(err, foundItems){

// Here we are checking whether the database is empty or not.
//If it is empty then if loop will run for once only and after that the control
// will never go to the if loop
  if(foundItems.length === 0){
    Item.insertMany(itemArray, function(err){
      if (err){
        console.log(err);
      }
      // else{
      //   console.log("Successfully added items to the database");
      // }
    });
    res.redirect("/");
  }else{

    res.render("list", {listTitle: "Today" , newListItems: foundItems});

  }

});
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  //creating a new document in the collection and saving it.
  // And then redirecting it to the home route so that the new added item appears on our web page.
  const item = new Item({
    name : itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else {
    List.findOne({name : listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }






});

app.post("/delete" , function(req, res){
  const checkedID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedID , function(err){
      if(err){
        console.log(err);
      }else {
        console.log("success");
        res.redirect("/");
      }
    });
  }else {
    List.findOneAndUpdate({name: listName}, {$pull : {items : {_id:checkedID}}}, function(err, foundList){
      if(!err){
        res.redirect("/"+ listName);
      }
    });
  }





});


app.get("/:customListName", function(req,res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName}, function(err, foundList){
      if(!err){
        if(!foundList){
          const list = new List({
            name : customListName,
            items : itemArray
          });

          list.save();
          res.redirect("/" + customListName);
        }else {
          res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
        }
      }
    });



});


app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully");
});
