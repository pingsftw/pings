class StellarWallet < ActiveRecord::Base
  Url = 'https://test.stellar.org:9002'
  StellarSecret = "sfvmSPdfVM6FFhSjSxvKVcg6vR95FAWBuczLoecNVH7xVJhBF8f"
  StellarAccount = "gCmk3eZhFdBGyVf2epUEYhkD91s2JatGz"
  before_save :setup
  belongs_to :user


  def get_keys
    result = HTTParty.post(Url, body: '{"method": "create_keys"}')["result"]
    self.account_id = result["account_id"]
    self.master_seed = result["master_seed"]
    self.master_seed_hex = result["master_seed_hex"]
    self.public_key = result["public_key"]
    self.public_key_hex = result["public_key_hex"]
  end

  def issue(currency, amount)
    body = {
      method: "submit",
      params: [
      {
      secret: StellarSecret,
      tx_json: {
        TransactionType: "Payment",
        Account: StellarAccount,
        Destination: account_id,
        Amount: {
          currency: currency,
          issuer: StellarAccount,
          value: amount
        }
      }
    }
  ]
    }
    puts body.to_json
    result = HTTParty.post(Url, body: body.to_json)
  end

  def prefund
    body = {
      method: "submit",
      params: [
      {
      secret: StellarSecret,
      tx_json: {
        TransactionType: "Payment",
        Account: StellarAccount,
        Destination: account_id,
        Amount: 100_000_000
      }
    }
  ]
    }
    puts body.to_json
    result = HTTParty.post(Url, body: body.to_json)
  end

  def setup
    get_keys
    prefund
    trust_server("WEB", 1000000)
    trust_server("BTC", 1000000)
  end

  def trust_server(currency, amount)
    address = StellarAccount
    body = {
      method: "submit",
      params: [{
        secret: master_seed,
        tx_json: {
          TransactionType: "TrustSet",
          Account: account_id,
          LimitAmount: {
            currency: currency,
            issuer: address,
            value: amount
          }
        }
      }]
    }
    puts body.to_json
    result = HTTParty.post(Url, body: body.to_json)
    puts result.body
  end

end
