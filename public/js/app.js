(function ($) {
	$("#releaseDate").datepicker();
	var books = [];

    var Book = Backbone.Model.extend({
        defaults:{
            coverImage: "img/placeholder.png",
            title: "Some title",
            author: "John Doe",
            releaseDate: "2012",
            keywords: "JavaScript Programming"
        },
        idAttribute: "_id"
    });

    var Library = Backbone.Collection.extend({
    	//localStorage: new Backbone.LocalStorage("LibraryStorage"),
	    model: Book,
	    url: '/api/books'
	});

    var BookView = Backbone.View.extend({
        tagName:"div",
        className:"bookContainer",
        template:$("#bookTemplate").html(),

        render:function () {
            var tmpl = _.template(this.template); //tmpl is a function that takes a JSON object and returns html

            this.$el.html(tmpl(this.model.toJSON())); //this.el is what we defined in tagName. use $el to get access to jQuery html() function
            
            return this;
        },

        events: {
        	"click .delete": "deleteBook"
        },
 
	    deleteBook:function () {
	        //Delete model
	        this.model.destroy();
	 
	        //Delete view
	        this.remove();
	    }
    });

    var LibraryView = Backbone.View.extend({
	    el:$("#books"),

	    initialize:function(){
	        this.collection = new Library();
	        this.collection.fetch();
	        this.render();
 
    		this.collection.on("add", this.renderBook, this);
    		this.collection.on("remove", this.deleteBook, this);
    		this.collection.on("reset", this.render, this);
	    },

	    events:{
		    "click #add":"addBook"
		},

	    render:function(){
	        var that = this;
	        _.each(this.collection.models, function(item){
	            that.renderBook(item);
	        }, this);
	    },

	    renderBook:function(item){
	        var bookView = new BookView({
	            model:item
	        });
	        this.$el.append(bookView.render().el);
	    },

	    addBook:function(e){
	    	e.preventDefault();

		    var formData = {};
		 
		    $("#addBook div").children("input").each(function (i, el) {
		        if ($(el).val() !== "") {
		            if (el.id === 'keywords') {
		                var keywordArray = $(el).val().split(',');
		                var keywordObjects = [];
		                for (var j = 0; j < keywordArray.length; j++) {
		                    keywordObjects[j] = {"keyword":keywordArray[j]};
		                }
		                formData[el.id] = keywordObjects;
		            } else if (el.id === 'releaseDate'){
		                formData[el.id] = $('#releaseDate').datepicker("getDate").getTime();
		            } else {
		                formData[el.id] = $(el).val();
		            }
		        }
		    });
		 
		    books.push(formData);
		 
		    this.collection.create(formData);
		},

		removeBook: function(removedBook){
			var removedBookData = removedBook.attributes;

			_.each(removedBookData, function(val, key){
				if(removedBookData[key] === removedBook.defaults[key]){
					delete removedBookData[key];
				}
			});

			_.each(books, function(book){
				if(_.isEqual(book, removedBookData)){
					books.splice(_.indexOf(books, book), 1);
				}
			});
		}
	});

    var libraryView = new LibraryView();

})(jQuery);