var Satoshis = 10000000

var BookItemView = BaseView.extend({
  templateName: "book-item",
  additionalParams: function(){
    return {
      currency: this.attributes.currency,
      scalingFactor: ScalingFactors[this.attributes.currency]
    }
  }
})

var Book = Backbone.Collection.extend({
  fetch: function(){
    var self = this
    remote.book(this.currency, function(offers){
      self.reset(offers)
      self.trigger("sync")
    })
  },
  initialize: function(models, options){this.currency = options.currency}
})

var BooksPage = BaseView.extend({
  templateName: "books",
  postRender: function(){
    var btcBook = new Book([], {currency: "BTC"})
    var usdBook = new Book([], {currency: "USD"})
    new BookView({el: this.$(".btc-book"), collection: btcBook, attributes: {currency: "BTC"}}).render()
    new BookView({el: this.$(".usd-book"), collection: usdBook, attributes: {currency: "USD"}}).render()
    btcBook.fetch()
    usdBook.fetch()
  }
})

var BookView = ListView.extend({
  templateName: "book",
  itemName: "Book",
  additionalParams: function(){
    return {
      currency: this.attributes.currency,
    }
  }

})

var FAQPage = BaseView.extend({
  templateName: "faq"
})

var ChargeMessageView = BaseView.extend({
  templateName: "charge-message",
  postRender: function(){
    new ChangeSupportView({collection: projects, el: self.$(".change-support")}).render()
    current_user.getWebsBalance()
  }
})

var ChargePage = FormView.extend({
  templateName: "charge",
  callback: function(net){
    new ChargeMessageView({el: this.$(".charge-message"), model: new Backbone.Model(net)}).render()
  }
})

var ProjectsPage = BaseView.extend({
  templateName: "projects",
  postRender: function(){
    new ProjectListView({collection: projects, el: this.$(".project-list")}).render()
  },
   events: {
    "click a": function(event){
      router.navigate(event.target.pathname, {trigger: true})
      event.preventDefault()
    }
   }

})

var TotalsView = BaseView.extend({
  templateName: "totals",
  initialize: function(){
    var self = this
    this.model.bind("change", function(){
      self.render()
    })
  }
})

var DonationTotals = Backbone.Model.extend({
  url: function(){
    return "/projects/" + this.get("id") + "/totals.json"
  }
})

var ProjectPage = BaseView.extend({
  templateName: "project",
  postRender: function(){
    var totals = new DonationTotals({id: this.model.get("id")})
    new TotalsView({model: totals, el: this.$(".totals")})
    totals.fetch()
  }
})

var Project = Backbone.Model.extend({
  url: function(){
    return "/projects/" + this.get("id") + ".json"
  }
})

var User = Backbone.Model.extend({
  url: function(){
    return "/users/" + this.get("stellar_id") + ".json"
  },
  getSupporting: function(){
    var self = this
    remote.requestAccountInfo(self.get("stellar_id"), function(error, data){
      var dest = data.account_data.InflationDest
      var project = projects.by_address(dest)
      self.set("supporting", project.get("name"))
    })
  },
  getWebsBalance: function(){
    if (!this.get("stellar_id")) return
    var self=this
    remote.requestAccountLines(self.get("stellar_id"), function(error, data){
      if (error) console.error(error)
      var line = _.detect(data.lines, function(line){return line.currency=="WEB"})
      self.set("webs_balance", line.balance)
    })
  }
})

var MyProfileView = BaseView.extend({
  templateName: "my-profile"
})

var OtherProfileView = FormView.extend({
  templateName: "other-profile"
})


var ProfilePage =  BaseView.extend({
  templateName: "profile-page",
  initialize: function(){
    var self=this
    this.model.bind("change", function(){
      new ProfileView({el: self.$(".profile"), model: self.model}).render()
    })
    this.model.fetch({success: function(){
      self.model.getWebsBalance()
      self.model.getSupporting()
    }})
  }
})

var UsernameSorryView = BaseView.extend({
  templateName: "username-sorry",
  params: function(){
    return {usernameMinumum: window.usernameMinimum}
  }
})

var ProfileView = BaseView.extend({
  templateName: "profile",
  postRender: function(){
    if (this.model.get("username")){
      new UsernameDisplayView({el: this.$(".username"), model: this.model}).render()
    } else {
      if (this.model.get("me")) {
        if (current_user.get("balances").webs < usernameMinimum) {
          new UsernameSorryView({el: this.$(".username"), model: this.model}).render()
        } else {
          new UsernameCreateView({el: this.$(".username"), model: this.model}).render()
        }
      }
    }
    var el = this.$(".me")
    var SubView = this.model.get("me") ? MyProfileView : OtherProfileView
    new SubView({el: el, model: this.model}).render()
  }
})

var UsernameDisplayView = BaseView.extend({
  templateName: "username-display"
})

var UsernameCreateView = FormView.extend({
  templateName: "username-create",
  callback: function(user){
    this.model.set(user)
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
      this.$(".message").text("Set aside " + gift.value + " " + tokenName + " for " + gift.receiver_email)
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
    ChangeSupportView({collection: projects, el: self.$(".change-support")}).render()
  }
})

var ScalingFactors = {
        USD: 100,
        BTC: Satoshis
      }

var MiniBookView = BaseView.extend({
  templateName: "mini-book",
  additionalParams: function(){
    return {
      currency: this.attributes.currency,
      scalingFactor: ScalingFactors[this.attributes.currency]
    }
  }
})

var Stats = Backbone.Model.extend({
  url: "/stats/overview.json",
  getOutstanding: function(){
    var self = this
    remote.mainline(function(lines){
      sum = _.inject(lines, function(memo, line){return memo - +line.balance},0)
      self.set("issued_tokens", sum)
    })
  }
})

var StatsView = BaseView.extend({
  templateName: "stats",
  initialize: function(){
    var self = this
    this.model.bind("change", function(){self.render()})
    this.model.fetch()
    this.model.getOutstanding()
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
    },
    "click .causes": function(){
      new ProjectListView({collection: projects, el: this.$('.projects')}).render()
    }
  },
  postRender: function(){
    var self = this
    new StatsView({el: this.$(".stats"), model: new Stats()})
    if (!this.model.get("id")) {
      new SignUpView({el: this.$(".user-box")}).render()
      this.$(".welcome").show()
    } else {
      this.$('.pricing').show()
      new EmailSendView({el: this.$(".email-send")}).render()
      new BuyView({el: this.$(".user-box"), model: this.model.get("card")}).render()
      var btcBook = new Book([], {currency: "BTC"})
      btcBook.bind("reset", function(){
        new MiniBookView({
          el: self.$(".mini-book-btc"),
          model: btcBook.first(),
          attributes: {currency: "BTC"}
        }).render()
      })
      btcBook.fetch({reset: true})
      var usdBook = new Book([], {currency: "USD"})
      usdBook.bind("reset", function(){
        new MiniBookView({
          el: self.$(".mini-book-usd"),
          model: usdBook.first(),
          attributes: {currency: "USD"}
        }).render()
      })
      usdBook.fetch({reset: true})
      if (this.model.get("balances") && this.model.get("balances").webs) {
        new SupportView({el: this.$(".support"), model: self.model}).render()
        this.$(".support").show()
      }
    }
  }
})

var Transactions = Backbone.Collection.extend({
  url: "/transactions.json"
})

var TransactionListView = ListView.extend({
  templateName: "transactions",
  itemName: "Transaction"
})

var TransactionItemView = BaseView.extend({
  templateName: "transaction-item",
})

var Gifts = Backbone.Collection.extend({
  url: "/gifts.json"
})

var GiftListView = ListView.extend({
  templateName: "gifts",
  itemName: "Gift"
})

var GiftItemView = BaseView.extend({
  templateName: "gift-item",
})

var HistoryPage = BaseView.extend({
  templateName: "history",
  postRender: function(){
    new PaymentListView({
      collection: new Backbone.Collection(current_user.get("payments")),
      el: this.$(".payments")
    }).render()
    new GiftListView({
      collection: new Gifts(),
      el: this.$(".gifts")
    }).render()
    new TransactionListView({
      collection: new Transactions(),
      el: this.$(".transactions")
    }).render()
  }
})

var ProjectList = Backbone.Collection.extend({
  by_address: function(address){
    return this.detect(function(p){return p.get("account_id") == address})
  }
})

var ProjectItemView = BaseView.extend({
  templateName: "project-item",
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
    router.navigate("/", {trigger: true})
    router.home({trigger: true})
    setHeader()
  }
})

var LoginView = FormView.extend({
  templateName: "login" ,
  callback: function(user){
    if (!user.errors){
      current_user = new User(user)
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
    "projects/:project_id":         "project",
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
  project: function(project_id){
    var el = $("#main")[0]
    new ProjectPage({el: el, model: projects.get(project_id)}).render()
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
  initialize: function(){
    var self = this
    this.model.bind("change", function(){self.render()})
    this.model.getWebsBalance()
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
current_user = new User(user)
Stripe.setPublishableKey('pk_test_k1B3ERuI0ElXdq1U6KjgNBUh');
setHeader()
Backbone.history.start({pushState: true})
$("time").timeago()
current_user.getWebsBalance()
})
