Bookmarks = new Mongo.Collection("Bookmarks");

if (Meteor.isClient) {

  Template.body.onCreated(function() {
    Session.set('filter2', '');
  });

  Template.body.helpers({
    bookmarks: function() {
      // var currFilter = this.filter.get();
      var currFilter = Session.get('filter2');
      if (currFilter !== '') {
        var rg = new RegExp(".*" + currFilter + ".*");
        return Bookmarks.find({text: rg}, {sort: {createdAt: -1}});
      } else {
        return Bookmarks.find({}, {sort: {createdAt: -1}});
      }
    }
  });

  Template.body.events({
    "submit .new-bookmark": function (event) {
      event.preventDefault();
      var text = event.target.text.value;
      Bookmarks.insert({
        text: text,
        createdAt: new Date()
      });
      event.target.text.value = "";
    },
    "keyup .filter": function(event) {
      Session.set('filter2', event.target.value);
      console.log(event.target.value);
    },
    "click .delete": function() {
      if (confirm("Delete?")) {
        Bookmarks.remove(this._id);
      }
    },
    "click .edit": function(event) {
      this.is_editing = 'yes';
    },
  });

  ////
  //// Attempting to make an edit-in-place for items
  ////
  Template.editable.onCreated(function() {
    this.isEditing = new ReactiveVar(false);
  });
  Template.editable.events({
    'dblclick': function(e, t) {
      t.isEditing.set( ! t.isEditing.get());
      console.log(t.isEditing.get() );
    },
  });
  Template.editable.helpers({
    editing: function() {
      return Template.instance().isEditing.get();
    },
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
