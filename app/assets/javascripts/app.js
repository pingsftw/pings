var BookItemView = BaseView.extend({
  templateName: "book-item",
  tagName: "li"
})

var Book = Backbone.Collection.extend({
  url: function() {return "/book.json?currency=" + this.currency}
})

var BooksPage = BaseView.extend({
  templateName: "books",
  postRender: function(){
    var btcBook = new Book()
    btcBook.currency = "BTC"
    var usdBook = new Book()
    usdBook.currency = "USD"
    new BookView({el: this.$(".btc-book"), collection: btcBook, attributes: {currency: "BTC"}}).render()
    new BookView({el: this.$(".usd-book"), collection: usdBook, attributes: {currency: "USD"}}).render()
    btcBook.fetch()
  }
})

var BookView = ListView.extend({
  templateName: "book",
  itemName: "Book",
})

var FAQPage = BaseView.extend({
  templateName: "faq"
})

var ChargePage = FormView.extend({
  templateName: "charge"
})

var ProjectsPage = BaseView.extend({
  templateName: "projects",
  postRender: function(){
    var projects = new ProjectList()
    this.$el.append(new ProjectListView({collection: projects}).render().el)
  }
})

var User = Backbone.Model.extend({
  url: function(){
    return "/users/" + this.get("stellar_id") + ".json"
  }
})

var ProfilePage = BaseView.extend({
  templateName: "profile",
  initialize: function(){
    var self=this
    this.model.bind("change", function(){console.log("boom"); self.render()})
    this.model.fetch()
  },
  postRender: function(){
    new EmailSendView({el: this.$(".email-send")}).render()
  }
})

var ConfirmView = BaseView.extend({
  templateName: "confirm"
})

var EmailSendView = FormView.extend({
  templateName: "email-send",
  callback: function(gift){
    if (gift.receiver_id) {
      console.log("was a receiver")
    } else {
      this.$(".message").text("Set aside " + gift.value + " Webs for " + gift.receiver_email)
    }
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
    if (!this.model.get("id")) {
      new SignUpView({el: this.$(".user-box")}).render()
      this.$(".welcome").show()
    } else {
      this.$('.pricing').show()
      new BuyView({el: this.$(".user-box"), model: this.model.get("card")}).render()
      var book = new Book()
      book.bind("reset", function(){
        new MiniBookView({el: self.$(".mini-book"), model: book.first()}).render()
      })
      book.fetch({reset: true})
      if (this.model.get("balances") && this.model.get("balances").webs) {
        new SupportView({el: this.$(".support"), model: self.model}).render()
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
        $.post("/cards.json", {token: obj.id}, function(){
          router.navigate("charge", {trigger: true})
        })
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
    "click button.stripe": "proceed"
  },
  proceed: function(){
    if (this.model) {
      router.navigate("charge", {trigger: true})
    } else {
      new StripeView({el: this.$('.stripe')}).render()
    }
  }
})

var LogoutButtonView = FormView.extend({
  templateName: "logout-button",
  callback: function(data){
    current_user = new Backbone.Model(null)
    setHeader()
    router.home({trigger: true})
  }
})

var LoginView = FormView.extend({
  templateName: "login" ,
  callback: function(user){
    if (!user.errors){
      current_user = new Backbone.Model(user)
      setHeader()
      router.home({trigger: true})
    }
  },
  error: function(){

    this.$(".signup").show()
  }
})

var SignUpView = FormView.extend({
  templateName: "sign-up" ,
  callback: function(user){
    if (_(user.errors).isEmpty()){
      var message = new ConfirmView().render()
      $("#main").empty().append(message.el)
    }
  }

})

var MainRouter = Backbone.Router.extend({
  routes: {
    "":                 "home",
    "home":             "home",
    "history":          "history",
    "projects":         "projects",
    "book":             "book",
    "users/:stellar_id":          "profile",
    "charge":          "charge",
    "faq":          "faq",

  },

  book: function() {
    var el = $("#main")[0]
    new BooksPage({el: el}).render()
  },
  home: function() {
    var el = $("#main")[0]
    new HomePage({el: el, model: current_user}).render()
  },
  history: function(){
    var el = $("#main")[0]
    new HistoryPage({el: el}).render()
  },
  projects: function(){
    var el = $("#main")[0]
    new ProjectsPage({el: el}).render()
  },
  profile: function(stellar_id){
    var el = $("#main")[0]
    new ProfilePage({el: el, model: new User({stellar_id: stellar_id})}).render()
  },
  faq: function(){
    var el = $("#main")[0]
    new FAQPage({el: el}).render()
  },
  charge: function(){
    var el = $("#main")[0]
    new ChargePage({el: el, model: current_user}).render()
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
    "click .home": function(){router.navigate("home", {trigger: true})},
    "click .faq": function(){router.navigate("faq", {trigger: true})},
    "click .user": function(event){
      var pathname = event.currentTarget.pathname
      router.navigate(pathname, {trigger: true})
      return false
    }
  }
})

function setHeader(){
  if (current_user.get("id")) {
    new HeaderView({model: current_user, el: $("header")}).render()
  } else {
    $('header').empty()
  }
}

var router = new MainRouter()
$(function(){
current_user = new Backbone.Model(user)
Stripe.setPublishableKey('pk_test_k1B3ERuI0ElXdq1U6KjgNBUh');
setHeader()

Backbone.history.start({pushState: true})
$("time").timeago()
})
