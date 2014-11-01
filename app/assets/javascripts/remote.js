
window.remote = new stellar.Remote({
  servers: [
    {
        host:    stellar_host
      , port:    stellar_port
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

remote.balance = function(stellar_id, callback){
  this.requestAccountLines(stellar_id, function(error, data){
    if (error && error.remote.error == "actNotFound")
      return callback(0)
    if (error) console.error(error)
    callback(_.detect(data.lines, function(line){return line.currency=="WEB"}).balance)
  })
}

