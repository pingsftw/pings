var BookItemView = BaseView.extend({
  templateName: "book-item",
  tagName: "li"
})

var Book = Backbone.Collection.extend({
  url: "/book.json"
})

var BookPage = ListView.extend({
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

var ChangeSupportView = FormView.extend({
  templateName: "change-support",
  postRender: function(){
    var select = this.$("select")
    this.collection.each(function(project){
      var option = $("<option>", {value: project.id}).text(project.get("name"))
      select.append(option)
    })
  },
  callback: function(data){
    current_user.set("supporting", data.project.name)
  }
})

var SupportView = BaseView.extend({
  templateName: "support",
  initialize: function(){
    var self=this
    this.model.bind("change", function(){
      self.$('.data').text(self.model.get("supporting"))
    })
  },
  postRender: function(){
    var self = this
    var projects = new ProjectList()
    var changeView =new ChangeSupportView({collection: projects, el: self.$(".change-support")})
    projects.bind("reset", function(){ changeView.render() })
    projects.fetch({reset: true})
  }
})

var MiniBookView = BaseView.extend({
  templateName: "mini-book",
  initialize: function(){console.log(this.model, this.params())}
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
    },
    "click .causes": function(){
      var projects = new ProjectList()
      new ProjectListView({collection: projects, el: this.$('.projects')}).render()
    }
  },
  postRender: function(){
    var self = this
    if (!user) {
      new SignUpView({el: this.$(".user-box")}).render()
      this.$(".welcome").show()
    } else {
      this.$('.pricing').show()
      new BuyView({el: this.$(".user-box")}).render()
      var book = new Book()
      book.bind("reset", function(){
        new MiniBookView({el: self.$(".mini-book"), model: book.first()}).render()
      })
      book.fetch({reset: true})
      if (current_user.get("balances").webs) {
        new SupportView({el: this.$(".support"), model: current_user}).render()
      }
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
    this.$el.append(new PaymentListView({collection: new Backbone.Collection(current_user.get("payments"))}).render().el)
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

var StripeView = BaseView.extend({
  templateName: "stripe",
  events: {
    "input .card_num": "luhn",
    "input .card_cvc": "cvc",
    "input .card_exp": "exp",
    "click button": "submit"
  },
  postRender: function(){
    this.$(".card_num").focus()
  },
  cvc: function(){
    var e = this.$('.card_cvc')
    var l = this.$('.cvc')
    if (Stripe.card.validateCVC(e.val())) {
      l.hide()
    } else {
      l.show()
    }
  },
  luhn: function(){
    var e = this.$('.card_num')
    var l = this.$('.luhn')
    if (Stripe.card.validateCardNumber(e.val())) {
      l.hide()
    } else {
      l.show()
    }
  },
  exp: function(){
    var l = this.$('.exp')
    if (Stripe.card.validateExpiry(this.$(".month").val(), this.$(".year").val())) {
      l.hide()
    } else {
      l.show()
    }
  },
  submit: function(){
    var self=this
    this.$('button').attr("disabled", true)
    Stripe.card.createToken({
      number: $('.card_num').val(),
      cvc: $('.card_cvc').val(),
      exp_month: $('.month').val(),
      exp_year: $('.year').val()
    }, function(code, obj){
      if (code == 200) {
        alert("yay")
      } else {
        self.$('.stripe-error').text(obj.error.message)
        this.$('button').removeAttr("disabled")
      }
    });
  }
})

var BuyView = BaseView.extend({
  templateName: "buy",
  events: {
    "click button.stripe": "stripe"
  },
  postRender: function(){
    new ResendButtonView({el: this.$(".resend")}).render()
  },
  stripe: function(){
    new StripeView({el: this.$('.stripe')}).render()
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
    "book":         "book",

  },

  book: function() {
    var el = $("#main")[0]
    new BookPage({el: el, collection: new Book()}).render()
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
    "click .book": function(){router.navigate("book", {trigger: true})},
    "click .projects": function(){router.navigate("projects", {trigger: true})},
    "click .home": function(){router.navigate("home", {trigger: true})}
  }
})

var router = new MainRouter()
$(function(){
current_user = new Backbone.Model(user)
Stripe.setPublishableKey('pk_test_aXfBatOAJ9MiaJuDRGNkCnmn');

if (user) {
  $("body").prepend(
    new HeaderView({model: current_user}).render().el
  )
}

Backbone.history.start({pushState: true})
$("time").timeago()
})
