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
    console.log("rendered " + this.templateName, this.el, this.params())
    return this
  },
  params: function(){
    if (this.model) {
      return this.model.toJSON()
    }
  },
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
          if (data.csrfToken) {
            $('meta[name="csrf-token"]').attr('content', data.csrfToken);
          }
          self.callback(data)
        },
        dataType: "json"
      })
      return false
    }
  }
})

var BookItemView = BaseView.extend({
  templateName: "book-item"
})

var Books = Backbone.Collection.extend({
  url: "/book.json"
})

var BookView = BaseView.extend({
  templateName: "book",
  initialize: function(){
    var self = this
    this.collection = new Books()
    this.collection.bind("reset", function(){self.populate()})
    this.collection.fetch({reset: true})
  },
  populate: function(){
    this.collection.each(function(dataItem){
      var item = new BookItemView({model: dataItem}).render()
      this.$(".book-items").append(item.el)
    })
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
    new ProjectListView({el: this.$(".projects")}).render()
    new BookView({el: this.$(".book")}).render()
  }
})

var ProjectList = Backbone.Collection.extend({
  url: "/projects.json"
})

var ProjectItemView = BaseView.extend({
  templateName: "project-item",
  tagName: "li"
})

var ProjectListView = BaseView.extend({
  templateName: "project-list",
  initialize: function(){
    var self=this
    this.collection = new ProjectList()
    this.collection.bind("reset", function(){self.populate()})
    this.collection.fetch({reset: true})
  },
  populate: function(){
    this.collection.each(function(project){
      var item = new ProjectItemView({model: project}).render()
      this.$(".project-list").append(item.el)
    })
  }
})

var PaymentItemView = BaseView.extend({
  templateName: "payment-item"
})

var PaymentListView = BaseView.extend({
  templateName: "payments",
  initialize: function(){
    this.collection = new Backbone.Collection(current_user.payments)
  },
  postRender: function(){
    this.collection.each(function(payment){
      console.log(payment)
      this.$(".payment-list").append(
        new PaymentItemView({model: payment}).render().el
      )
    })
  }
})

var UserBoxView = BaseView.extend({
  templateName: "user-box",
  params: function(){
    return current_user
  },
  postRender: function(){
    new ResendButtonView({el: this.$(".resend-button")}).render()
    new PaymentListView({el: this.$(".payments")}).render()
  }
})

var ResendButtonView = FormView.extend({
  templateName: "resend-button",
  callback: function(data){
    alert("sent it again")
  }
})

var LogoutButtonView = FormView.extend({
  templateName: "logout-button",
  callback: function(data){
    current_user = null
    router.home()
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
  templateName: "sign-up" ,
  callback: function(user){
    if (!user.errors){
      current_user = user
      router.home()
    }
  }

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

var HeaderView = BaseView.extend({
  templateName: "header",
  tagName: "header",
  postRender: function(){
    new LogoutButtonView({el: this.$(".logout-button")}).render()
  }
})

var router = new MainRouter()
$(function(){
$("body").prepend(
  new HeaderView({model: new Backbone.Model(current_user)}).render().el
)
Backbone.history.start({pushState: true})
$("time").timeago()
})
