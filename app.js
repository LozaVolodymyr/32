var express = require('express'),
    bodyParser = require('body-parser'),
    nunjucks = require('nunjucks'),
    MongoClient = require('mongodb').MongoClient,
    assert = require('assert'),
    ItemDAO = require('./items').ItemDAO;
   

app = express();
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use('/static', express.static(__dirname + '/static'));
app.use(bodyParser.urlencoded({ extended: true }));


var env = nunjucks.configure('views', {
    autoescape: true,
    express: app
});

var nunjucksDate = require('nunjucks-date');
nunjucksDate.setDefaultFormat('MMMM Do YYYY, h:mm:ss a');
env.addFilter("date", nunjucksDate);

var ITEMS_PER_PAGE = 5;
var mongoDb = 'mongodb://localhost:27017/qustions';



MongoClient.connect(mongoDb, function(err, db) {
    "use strict";

    assert.equal(null, err);
    console.log("Successfully connected to MongoDB.");

    var items = new ItemDAO(db);
    
    var router = express.Router();

    router.get("/", function(req, res) {
        "use strict";
        
        var page = req.query.page ? parseInt(req.query.page) : 0;
        var category = req.query.category ? req.query.category : "All";

        items.getCategories(function(categories) {
            
            items.getItems(category, page, ITEMS_PER_PAGE, function(pageItems) {

                items.getNumItems(category, function(itemCount) {
                    var numPages = 0;
                    if (itemCount > ITEMS_PER_PAGE) {
                        numPages = Math.ceil(itemCount / ITEMS_PER_PAGE);
                    }
                
                    res.render('home', { category_param: category,
                                         categories: categories,
                                         itemCount: itemCount,
                                         items: pageItems });
                    
                });
            });
        });
    });
    
    router.get("/create", function(req, res) {
            "use strict";
         res.render("create")
    });
    
    router.post("/create/question", function(req, res) {
        "use strict";
        var title = req.body.title;
        var question = req.body.question;
        var name = req.body.name;
        items.addQuestion(title, question, name, function() {
            res.redirect("/");
        });
    });
    
        router.post("/item/:itemId/delete", function(req, res) {
        "use strict";
        var itemId = parseInt(req.params.itemId);
        items.deleteQuestion(itemId, function() {
            res.redirect("/");
        });
    });
    
    
    // Search
    // router.get("/search", function(req, res) {
    //     "use strict";

    //     var page = req.query.page ? parseInt(req.query.page) : 0;
    //     var query = req.query.query ? req.query.query : "";

    //     items.searchItems(query, page, ITEMS_PER_PAGE, function(searchItems) {

    //         items.getNumSearchItems(query, function(itemCount) {

    //             var numPages = 0;
                
    //             if (itemCount > ITEMS_PER_PAGE) {
    //                 numPages = Math.ceil(itemCount / ITEMS_PER_PAGE);
    //             }
                
    //             res.render('search', { queryString: query,
    //                                    items: searchItems });
                
    //         });
    //     });
    // });


    router.post("/item/:itemId/answers", function(req, res) {
        "use strict";

        var itemId = parseInt(req.params.itemId);
        var review = req.body.review;
        var name = req.body.name;
        var stars = parseInt(req.body.stars);

        items.addAnswer(itemId, answer, name,  function(itemDoc) {
            res.redirect("/item/" + itemId);
        });
    });



    router.get("/item/:itemId", function(req, res) {
        "use strict";

        var itemId = parseInt(req.params.itemId);

        items.getItem(itemId, function(item) {

            if (item == null) {
                res.status(404).send("Item not found.");
                return;
            }

            items.getOldView(itemId, function(relatedItems) {
                res.render("item",
                           {
                               item: item
                           });
            });
        });
    });

    app.use('/', router);

    // Start the server listening
    var server = app.listen(3000, function() {
        var port = server.address().port;
        console.log('Server listening on port %s.', port);
    });

});
