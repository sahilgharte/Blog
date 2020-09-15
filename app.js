const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");

var app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine","ejs");
// var inputs=[];

mongoose.connect("mongodb+srv://admin-username:password@cluster0.7a2yn.mongodb.net/todolistDB",{useNewUrlParser:true,useUnifiedTopology: true})

const itemsSchema = new mongoose.Schema ({
	name:{
		type:String,
		required:[1,"Please Enter the name"]
	}
});
const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
	name:"Study on Black Hole"
});

const item2 = new Item({
	name:"Eat Food"
});

const defaultItems = [item1,item2];

const listSchema = new mongoose.Schema({
	name:String,
	items:[itemsSchema]
});

const List = mongoose.model("List",listSchema);
// const defaultItems = [item1,item2];

// Item.insertMany(defaultItems,function(err){
// 	if(err){
// 		console.log(err);
// 	}else{
// 		console.log("Succesfully Inserted The Default Items");
// 	}
// });

var object={
		weekday:'long',
		day:'numeric',
		month:'long',
		year:'numeric'
	}
	var today=new Date();
	var currentDay=today.getDay();
	var day=_.capitalize(today.toLocaleDateString("en-US",object));

app.get("/",function(req,res){

	Item.find({},function(err,foundItems){
		if(foundItems.length===0){
				
				Item.insertMany(defaultItems,function(err){
					if(err){
						console.log(err);
					}else{
						console.log("Succesfully Inserted The Default Items");
					}
				});
				res.redirect("/");
		}	
		else{
			res.render("list",{kindOfDay:day,newListItem:foundItems});
		}

	});

});

app.post("/",function(req,res){
	var itemName=req.body.newItem;
	var listName=_.capitalize(req.body.button);
	// inputs.push(input);
	const item = new Item({
		name:itemName
	});

	if(listName===day){
		item.save();
		res.redirect("/");
	}else{
		List.findOne({name:listName},function(err,foundList){
			foundList.items.push(item);
			foundList.save();
			res.redirect("/"+listName);
		});
	}
	
});

app.post("/delete",function(req,res){
	const deletedItem=req.body.checkbox;
	const listName = _.capitalize(req.body.listName);
	// console.log(deletedItem);

	if(listName===day){
		Item.findByIdAndRemove(deletedItem,function(err){
		console.log(err);
		});
		res.redirect("/");
	}else{
		List.findOneAndUpdate({name:listName},{$pull:{items:{_id:deletedItem}}},function(err){
			if(!err){
				res.redirect("/"+listName);
			}
		});
	}

});

app.get("/:customListName",function(req,res){
	const customListName=req.params.customListName;

	List.findOne({name:customListName},function(err,foundList){
		if(!err){
			if(!foundList){
				// console.log("Doesn't Exists");
				// Here we will create the new list 
				const list = new List({
					name:customListName,
					items:defaultItems
					});
				list.save();
				res.redirect("/"+customListName)
			}else{
				// console.log("Already Exists");
				res.render("list",{kindOfDay:foundList.name,newListItem:foundList.items});
			}
		}
	})

	
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port,function(){
	console.log("Hey! Your server has started Succesfully");
});