var BookItemView = BaseView.extend({
  templateName: "book-item",
  tagName: "li"
})

var Book = Backbone.Collection.extend({
  url: "/book.json"
})

var BookView = ListView.extend({
  templateName: "book",
  itemName: "Book"
})

var ProjectsPage = BaseView.extend({
  templateName: "projects",
  postRender: function(){
    var projects = new ProjectList()
    this.$el.append(new ProjectListView({collection: projects}).render().el)
  }
})

var HomePage = BaseView.extend({
  templateName: "home",
  events: {
    "click .login": function(){
      var el = new LoginView().render().el
      $(".user-box").empty().append(el)
    },
    "click .signup": function(){
      var el = new SignUpView().render().el
      $(".user-box").empty().append(el)
    }
  },
  params: function(){
    return {user: current_user}
  },
  postRender: function(){
    if (!current_user) {
      new SignUpView({el: this.$(".user-box")}).render()
    } else {
      new BuyView({el: this.$(".user-box")}).render()
      var book = new Book()
      new BookView({el: this.$(".book"), collection: book}).render()
    }
  }
})

var Transactions = Backbone.Collection.extend({
  url: "/transactions.json"
})

TransactionListView = ListView.extend({
  templateName: "transactions",
  itemName: "Transaction"
})

TransactionItemView = BaseView.extend({
  templateName: "transaction-item",
  tagName: "li"
})

var HistoryPage = BaseView.extend({
  templateName: "history",
  postRender: function(){
    this.$el.append(new PaymentListView({collection: new Backbone.Collection(current_user.payments)}).render().el)
    var transactions = new Transactions()
    this.$el.append(new TransactionListView({collection: transactions}).render().el)
  }
})

var ProjectList = Backbone.Collection.extend({
  url: "/projects.json"
})

var ProjectItemView = BaseView.extend({
  templateName: "project-item",
  tagName: "li"
})

var ProjectListView = ListView.extend({
  templateName: "project-list",
  itemName: "Project"
})

var PaymentItemView = BaseView.extend({
  templateName: "payment-item"
})

var PaymentListView = BaseView.extend({
  templateName: "payments",
  postRender: function(){
    var self=this
    this.collection.each(function(payment){
      self.$(".payment-list").append(
        new PaymentItemView({model: payment}).render().el
      )
    })
  }
})

var BuyView = BaseView.extend({
  templateName: "buy",
  postRender: function(){
    this.$el.append(new ResendButtonView().render().el)
  }
})

var ResendButtonView = FormView.extend({
  templateName: "resend-button",
  callback: function(data){
    alert("We send you another address")
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
  },
  error: function(){

    this.$(".signup").show()
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
    "home":             "home",
    "history":          "history",
    "projects":         "projects",

  },

  home: function() {
    var el = $("#main")[0]
    new HomePage({el: el}).render()
  },
  history: function(){
    var el = $("#main")[0]
    new HistoryPage({el: el}).render()
  },
  projects: function(){
    var el = $("#main")[0]
    new ProjectsPage({el: el}).render()
  }
})

var HeaderView = BaseView.extend({
  templateName: "header",
  tagName: "header",
  postRender: function(){
    new LogoutButtonView({el: this.$(".logout-button")}).render()
  },
  events: {
    "click .history": function(){router.navigate("history", {trigger: true})},
    "click .projects": function(){router.navigate("projects", {trigger: true})},
    "click .home": function(){router.navigate("home", {trigger: true})}
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
