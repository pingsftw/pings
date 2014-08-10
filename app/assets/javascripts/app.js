var MainRouter = Backbone.Router.extend({

  routes: {
    "":                 "home",
  },

  home: function() {
    console.log("hi")
  }

})

new MainRouter()
console.log(Backbone.history.start({pushState: true}))
