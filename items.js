var MongoClient = require('mongodb').MongoClient,
    assert = require('assert');
var ObjectID=require('mongodb').ObjectID;

function ItemDAO(database) {
    "use strict";

    this.db = database;


    this.getCategories = function(callback) {
        "use strict";
        
        var categories = [];

        this.db.collection('item').aggregate([
                         { $group: {
                           _id : "All",
                           num : {$sum: 1} } }
        ], function (err, results) {
                    results.forEach(function (el) {
                    categories.push(el);
                })
        });

        this.db.collection('item').aggregate([
                        { $match: { category: {$ne:null} } },
                        { $group: {
                           _id : "$category",
                           num : {$sum: 1}
                        } },
                        { $sort: { num: -1 }
        }], function (err, results) {
                results.forEach(function (el) {                
                    categories.push(el);
                })
                  callback(categories);  

            })
    }
    
    this.getItems = function(category, page, itemsPerPage, callback) {
        "use strict";
       
       var pageItems = [];
       var toSkip = page * itemsPerPage; 
       if (category == 'All') {
        this.db.collection('item').find({}).skip(toSkip).limit(itemsPerPage).toArray(
            function (err, results) {   
                    results.forEach(function (el, index) {              
                    pageItems.push(el);
                    })              
                   callback(pageItems);           
            });
       } else {
       this.db.collection('item').find({category: category}).skip(toSkip).limit(itemsPerPage).toArray(
            function (err, results) {   
                    results.forEach(function (el, index) {
                     
                    pageItems.push(el);
                    })
                   
                    callback(pageItems);
                
            });
        }  
    }


    this.getNumItems = function(category, callback) {
        "use strict";
        var numItems = 0;
        if (category == 'All') {
              this.db.collection('item').find({}).count(function(error, count){
                    
                    callback(count);
        });
        } else {
          this.db.collection('item').find({category:category}).count(function(error, count){
                    
                    callback(count);
            });
        }
       
    }
    
    
    this.getItem = function(itemId, callback) {
        "use strict";
        this.db.collection('item').find({_id: itemId}).toArray(function (err, results) {
        callback(results[0]); 
        })
    }

    this.addQuestion = function(title, question, name, callback) {
        "use strict";
         var  questionDoc = {
            _id: Math.floor(Math.random() * 31613221851651212),
            name: name,
            title: title,
            description: question,
            category: 'new',
            date: Date.now()
        }

        this.db.collection("item").insertOne(questionDoc , function(err, results) {
                     callback();
                }); 
    }
    


   this.addAnswer = function(itemId, comment, name, callback) {
        "use strict";

         var  reviewDoc = {
            name: name,
            comment: comment,
            date: Date.now()
        }

        this.db.collection("item").updateOne( 
                {"_id":itemId}, 
                {$push: {"reviews": reviewDoc},
                }, function(err, results) {
                     callback();
                }); 

                   
    }
    
        this.getOldView = function(itemId, callback) {
        "use strict";

        this.db.collection("item").update({_id:itemId}, {$set: {category : 'old'}}, function (err, res) {
                callback();
            
        })
        
           
    };
    
   this.deleteQuestion = function(itemId, callback) {
        "use strict";
        
        this.db.collection("item").remove({_id:itemId}, function (err, res) {
                callback();
            
        })
    }
    
    
    
        // Search 
    //   this.searchItems = function(query, page, itemsPerPage, callback) {
    //     "use strict";      
    //     var items = [];
    //     this.db.collection('item').find({ $text: { $search: query }}).limit(itemsPerPage).toArray(
    //         function (err, results) { 
    //                 results.forEach(function (el, index) {                   
    //                     items.push(el);
    //                 })                
    //                   callback(items);              
    //         });
    // }

    // this.getNumSearchItems = function(query, callback) {
    //     "use strict";

    //     var numItems = 0;
    //     this.db.collection('item').find({ $text: { $search: query }}).count(function(error, count){
                    
    //                 callback(count);
    //     });
    // }



}

module.exports.ItemDAO = ItemDAO;
