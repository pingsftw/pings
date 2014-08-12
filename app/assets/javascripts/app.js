var HomePage = Backbone.View.extend({
  render: function(){
    var template = $("#home-template")
    var compiled = _.template(template.html())
    var innerTemplate = current_user ? UserBoxView : SignUpView
    this.$el.html(compiled({user: current_user}))
    new innerTemplate({el: this.$(".user_box")}).render()
  }
})

var SignUpView = Backbone.View.extend({
  render: function(){
    var template = $("#sign-up-template")
    var compiled = _.template(template.html())
    this.$el.html(compiled())
  }
})


var MainRouter = Backbone.Router.extend({

  routes: {
    "":                 "home",
  },

  home: function() {
    var el = $("#main")[0]
    new HomePage({el: el}).render()
  }

})

new MainRouter()
$(function(){
console.log(Backbone.history.start({pushState: true}))
})
