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
    console.log("rendered " + this.templateName, this.el)
  },
  params: function(){},
  postRender: function(){},
})


var FormView = BaseView.extend({
  callback: function(){},
  events: {
    "submit": function(){
      var self=this
      var vals = {}
      $("input").each(function(i, el){
        var $e = $(el)
        vals[$e.attr("name")] = $e.val()
      })
      $.ajax($("form").attr("action"), {
        type: $("form").attr("method"),
        data: vals,
        success: function(data){
          if (data.errors){
            _.each(data.errors, function(value, key){
              var div = this.$("[name="+key+"]").parent().find(".error")
              div.text(value)
            })
          }
          self.callback(data)
        },
        dataType: "json"
      })
      return false
    }
  }
})

var HomePage = BaseView.extend({
  templateName: "home",
  events: {
    "click .login": function(){
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

var UserBoxView = FormView.extend({
  templateName: "user-box",
  params: function(){
    return {user: current_user.email}
  },
  callback: function(data){
    if (data.status == "ok"){
      current_user = null
      router.home()
    }
  }
})


var LoginView = FormView.extend({
  templateName: "login" ,
  callback: function(user){
    if (!user.errors){
      current_user = user
      router.home()
    }
  }

})

var SignUpView = FormView.extend({
  templateName: "sign-up"
})

var MainRouter = Backbone.Router.extend({
  routes: {
    "":                 "home",
  },

  home: function() {
    console.log("routing home")
    var el = $("#main")[0]
    new HomePage({el: el}).render()
  }
})

var router = new MainRouter()
$(function(){
Backbone.history.start({pushState: true})
})
