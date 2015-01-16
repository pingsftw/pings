
window.remote = new stellar.Remote({
  servers: [
    {
        host:    "s1.ripple.com"
      , port:    443
      , secure:  true
    }
  ]
})
remote.connect()

remote.mainAccount = window.masterWallet

remote.mainline = function(callback){
  this.requestAccountLines(this.mainAccount, function(e, d){
    if (typeof(d) === "undefined") {
      console.error(e)
    }
    var lines = _.select(d.lines, function(l){return l.currency=="WEB" && l.balance < 0})
    callback(lines)
  }).request()
}

remote.book = function(currency, callback){
  var params = {
    pays: {
      currency: currency,
      issuer: this.mainAccount
    },
    gets: {
      issuer: this.mainAccount,
      currency: "WEB"
    }
  }
  this.requestBookOffers(params, function(e,d){callback(d.offers)})
}

remote.balance = function(stellar_id, callback){
  $.get("https://api.ripple.com/v1/accounts/"+stellar_id+"/balances", function(data){
    $.each(data.balances, function(i, balance){
      if (balance.currency == "WEB") { 
        console.log(balance)
        callback(balance.value)
      }
    })
  })
}

remote.info = function(stellar_id, callback){
  if (!stellar_id) return false
  this.requestAccountInfo(stellar_id, function(error, data){
    if (error) {
      console.error(error)
      return false
    }
    callback(data.account_data)
  })
}

remote.balance2 = function(stellar_id, callback){
  this.requestAccountLines(stellar_id, function(error, data){
    if (error && error.remote.error == "actNotFound")
      console.log(stellar_id)
      console.log(error)
      return callback(0)
    if (error) console.error(error)
    callback(_.detect(data.lines, function(line){return line.currency=="WEB"}).balance)
  })
}

