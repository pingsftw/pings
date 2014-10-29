
window.remote = new stellar.Remote({
  servers: [
    {
        host:    'test.stellar.org'
      , port:    9001
      , secure:  true
    }
  ]
})
remote.connect()

remote.mainAccount = window.masterWallet

remote.mainline = function(callback){
  this.requestAccountLines(this.mainAccount, function(e, d){
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


