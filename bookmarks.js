Bookmarks = new Mongo.Collection("Bookmarks");

/**
 * @see http://stackoverflow.com/a/3890175
 */
function linkify(inputText) {
  var replacedText, replacePattern1, replacePattern2, replacePattern3;

  //URLs starting with http://, https://, or ftp://
  replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
  replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

  //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
  replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
  replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

  return replacedText;
}


if (Meteor.isClient) {

  Template.body.onCreated(function() {
    Session.set('filter2', '');
  });

  Template.body.helpers({
    bookmarks: function() {
      // var currFilter = this.filter.get();
      var currFilter = Session.get('filter2');
      if (currFilter !== '') {
        var rg = new RegExp(".*" + currFilter + ".*", "i");
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
    },
  });

  ////
  //// Attempting to make an edit-in-place for items
  ////
  Template.editable.onCreated(function() {
    this.isEditing = new ReactiveVar(false);
  });

  Template.editable.events({
    'dblclick': function(event, context) {
      context.isEditing.set( ! context.isEditing.get());
    },
    'change textarea': function(event, context) {
      Bookmarks.update(context.data._id, {$set: {text: event.target.value}});
    },
    "click .edit": function(event, context) {
      context.isEditing.set( ! context.isEditing.get());
    },
    "click .delete": function(event, context) {
      if (confirm("Delete?")) {
        Bookmarks.remove(context.data._id);
      }
    },
  });

  Template.editable.helpers({
    editing: function() {
      return Template.instance().isEditing.get();
    },
    linkified: function() {
      var context = Template.instance();
      if (context.data.text) {
        return linkify(context.data.text).replace(/\n/g,"<br>");
      } else {
        return;
      }
    },
  });

  Template.registerHelper("prettifyDate", function(timestamp) {
    var d = timestamp;
    return d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
