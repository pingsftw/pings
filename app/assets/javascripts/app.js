var BaseView = Backbone.View.extend({
  render: function(){
    if (!this.templateName) {
      console.log("This view needs a templateName")
      console.trace()
      return
    }
    var template = $("#" + this.templateName + "-template")
    if (!template[0]) {
      console.log("You're missing the template for "+ this.templateName)
      return
    }
    var compiled = _.template(template.html())
    this.$el.html(compiled(this.params()))
    this.postRender()
  },
  params: function(){}
})

var HomePage = BaseView.extend({
  templateName: "home",
  events: {
    "click .login": function(){
      console.log("hi", this.$(".user-box"))
      new LoginView({el: this.$(".user-box")}).render()
    }
  },
  params: function(){
    return {user: current_user}
  },
  postRender: function(){
    var innerTemplate = current_user ? UserBoxView : SignUpView
    new innerTemplate({el: this.$(".user-box")}).render()
  }
})

var UserBoxView = BaseView.extend({
  templateName: "user-box",
  params: function(){
    return {user: current_user.email}
  },
})


var FormView = BaseView.extend({
  events: {
    "submit": function(){
      console.log("ping")
      var self=this
      var vals = {}
      $("input").each(function(i, el){
        var $e = $(el)
        vals[$e.attr("name")] = $e.val()
      })
      console.log(vals)
      $.post($("form").attr("action"), vals, function(user){
        if (user.errors){
          _.each(user.errors, function(value, key){
            var div = this.$("[name="+key+"]").parent().find(".error")
            div.text(value)
          })
        }
      }, "json")
      return false

    }
  }
})

var LoginView = FormView.extend({
  templateName: "login"
})

var SignUpView = FormView.extend({
  templateName: "sign-up"
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
