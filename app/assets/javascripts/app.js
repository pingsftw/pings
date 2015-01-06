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
    remote.info(self.get("stellar_id"), function(account_data){
      var project = projects.by_address(account_data.InflationDest)
      self.set("supporting", project.get("name"))
    })
  },
  getWebsBalance: function(){
    if (!this.get("stellar_id")) return
    var self=this
    remote.balance(self.get("stellar_id"), function(balance){
      self.set("webs_balance", balance)
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
        if (current_user.get("webs_balance") < usernameMinimum) {
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

var ConfirmationPage = BaseView.extend({
  templateName: "confirm",
  postRender: function(){
    new BuyView({el: this.$(".buy"), model: current_user.get("card")}).render()
  }
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

var CommunityFeed = Backbone.Collection.extend({
  url: "/charges.json"
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

var ProjectsExploreView = ListView.extend({
  templateName: "projects-explore",
  itemName: "ProjectMini"
})

var CommunityExploreView = ListView.extend({
  templateName: "community-explore",
  itemName: "Community"
})

var CommunityItemView = BaseView.extend({
  templateName: "community-item"
})

var ExploreView = BaseView.extend({
  templateName: "explore",
  postRender: function(){
    new ProjectsExploreView({el: this.$(".projects"), collection: projects}).render()
    new CommunityExploreView({el: this.$(".community"), collection: new CommunityFeed()}).render()
  }
})

var AboutPage = BaseView.extend({
  templateName: "about"
})

var HowPage = BaseView.extend({
  templateName: "how-page"
})

var VotePage = BaseView.extend({
  templateName: "vote"
})

var HomePage = BaseView.extend({
  templateName: "home",
  events: {
    "click .causes": function(){
      new ProjectListView({collection: projects, el: this.$('.projects')}).render()
    }
  },
  postRender: function(){
    var self = this
    new StatsView({el: this.$(".stats"), model: new Stats()})
    new EmailSendView({el: this.$(".email-send")}).render()
    new BuyView({el: this.$(".buy"), model: this.model.get("card")}).render()
    new ExploreView({el: this.$(".explores")}).render()
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
      exp_year: $('.year').val(),
      name: $('.name').val(),
      address_zip: $(".zip").val()
    }, function(code, obj){
      if (code == 200) {
        $.post("/cards.json", {token: obj.id}, function(){
          router.navigate("vote", {trigger: true})
        })
      } else {
        self.$('.stripe-error').text(obj.error.message)
        this.$('button').removeAttr("disabled")
      }
    });
  }
})

var BtcBuyView = BaseView.extend({
  templateName: "btc-buy"
})

var ExistingCardView = FormView.extend({
  templateName: "existing-card",
  callback: function(net){
    this.trigger("success", net)
  },
  params: function(){return $.extend(this.model, this.attributes)}
})

var UsdBuyView = ChooserView.extend({
  templateName: "usd-buy",
  processView: function(){
    if (this.model) {
      return ExistingCardView
    }
    return StripeView
  },
  quantity: function(){
    return this.$("input:checked").val()
  }
})

var CurrencyView = ChooserView.extend({
  templateName: "currency"
})

var BuyView = BaseView.extend({
  templateName: "buy",
  events: {
    "click button.stripe": "proceed"
  },
  postRender: function(){
    var self = this
    this.c = new CurrencyView({el: this.$(".currency")}).render()
    this.c.bind("change", function(){ self.quantity() })
    this.c.$("[value='usd']").click()
    this.quantityView.bind("change", function(){self.proceed()})
  },
  proceed: function(){
    var self = this
    var viewClass = this.quantityView.processView()
    var quantity = this.quantityView.quantity()
    this.$(".process").unbind()
    var processView = new viewClass({model: this.model, el: this.$(".process"), attributes: {quantity: quantity}}).render()
    processView.bind("success", function(net){
      router.navigate("vote", {trigger: true})
    })
  },
  quantity: function(){
    this.quantityView = new this.currencies[this.c.val()]({model: this.model, el: this.$(".quantity")}).render()
  },
  currencies: {
    usd: UsdBuyView,
    btc: BtcBuyView
  }
})

var LogoutButtonView = FormView.extend({
  templateName: "logout-button",
  callback: function(data){
    current_user = new Backbone.Model(null)
    router.navigate("/", {trigger: true})
    setHeader()
  }
})

var LoginView = FormView.extend({
  templateName: "login-form" ,
  callback: function(user){
    if (!user.errors){
      current_user = new User(user)
      setHeader()
      router.home({trigger: true})
    }
  },
  postRender: function(){
    this.$("[name='email']").focus()
  }
})

var SignUpView = FormView.extend({
  templateName: "sign-up" ,
  callback: function(user){
    if (_(user.errors).isEmpty()){
      current_user = new User(user)
      router.navigate("confirmation", {trigger: true})
    }
  }

})

var HowView = BaseView.extend({
  templateName: "how"
})

var joinHow = {
  title: "Join",
  text: "Join the community"
}
var loadHow = {
  title: "Load",
  text: "Support the Internet to load up on " + tokenName + "s"
}
var voteHow = {
  title: "Vote",
  text: "Vote to help choose which projects receive support"
}

var HowsView = BaseView.extend({
  templateName: "hows",
  postRender: function(){
    new HowView({el: this.$(".join"), model: joinHow}).render()
    new HowView({el: this.$(".load"), model: loadHow}).render()
    new HowView({el: this.$(".vote"), model: voteHow}).render()
  }
})

var ProjectMiniItemView = BaseView.extend({
  templateName: "project-mini",
  events: {
    "click": function(){
      router.navigate("projects/" + this.model.get("id"), {trigger: true})
    }
  }
})

var ProjectsSplashView = ListView.extend({
  templateName: "projects-splash",
  itemName: "ProjectMini"
})

var SplashPage = BaseView.extend({
  templateName: "splash",
  postRender: function(){
    new SignUpView({el: this.$(".sign-up")}).render()
    new StatsView({el: this.$(".stats"), model: new Stats()})
    new HowsView({el: this.$(".hows")}).render()
    new ProjectsSplashView({el: this.$(".projects-splash"), collection: projects}).render()
  }
})

var MainRouter = Backbone.Router.extend({
  routes: {
    "":                 "home",
    "home":             "home",
    "about":             "about",
    "how":             "how",
    "community":             "community",
    "history":          "history",
    "projects":         "projects",
    "projects/:project_id":         "project",
    "book":             "book",
    "users/:stellar_id":          "profile",
    "charge":          "charge",
    "confirmation":          "confirmation",
    "faq":          "faq",
    "vote":          "vote",

  },

  about: function() {
    var el = $("#main")[0]
    new AboutPage({el: el}).render()
  },
  how: function() {
    var el = $("#main")[0]
    new HowPage({el: el}).render()
  },
  community: function() {
    var el = $("#main")[0]
    new ExploreView({el: el}).render()
  },
  book: function() {
    var el = $("#main")[0]
    new BooksPage({el: el}).render()
  },
  home: function() {
    var el = $("#main")[0]
    if (current_user.get("id")) {
      new HomePage({el: el, model: current_user}).render()
    } else {
      new SplashPage({el: el}).render()
    }
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
  } ,
  confirmation: function(){
    var el = $("#main")[0]
    new ConfirmationPage({el: el, model: current_user}).render()
  },
  vote: function(){
    var el = $("#main")[0]
    new VotePage({el: el, model: current_user}).render()
  }
})

var UserLinkView = BaseView.extend({
  templateName: "user-link",
  postRender: function(){
    new LogoutButtonView({el: this.$(".logout-button")}).render()
  }
})

var LoginButtonView = BaseView.extend({
  templateName: "login-button",
  events: {
    "click": function(){
      new LoginView({el: this.$(".login-form")}).render()
    }
  }
})

var HeaderView = BaseView.extend({
  templateName: "header",
  tagName: "header",
  postRender: function(){
    if (this.model.get("email")) {
      new UserLinkView({el: this.$(".user"), model: this.model}).render()
    } else {
      new LoginButtonView({el: this.$(".user")}).render()
    }
  },
  initialize: function(){
    var self = this
    this.model.bind("change", function(){self.render()})
    this.model.getWebsBalance()
  },
  events: {
    "click .history": function(){router.navigate("history", {trigger: true})},
    "click .book": function(){router.navigate("book", {trigger: true})},
    "click .about": function(){router.navigate("about", {trigger: true})},
    "click .community": function(){router.navigate("community", {trigger: true})},
    "click .how-works": function(){router.navigate("how", {trigger: true})},
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
  new HeaderView({model: current_user, el: $("header")}).render()
}

var router = new MainRouter()
$(function(){
current_user = new User(user)
setHeader()
Backbone.history.start({pushState: true})
$("time").timeago()
current_user.getWebsBalance()
})
