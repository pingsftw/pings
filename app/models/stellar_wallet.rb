class StellarWallet < ActiveRecord::Base
  Url = 'https://test.stellar.org:9002'
  StellarSecret = "sfvmSPdfVM6FFhSjSxvKVcg6vR95FAWBuczLoecNVH7xVJhBF8f"
  StellarAccount = "gCmk3eZhFdBGyVf2epUEYhkD91s2JatGz"
  WEBS_PROJECT_ACCOUNT_ID = "gG7WkiVMubimEfL2q4VhPmcniLxDCqQqTK"
  before_save :setup
  belongs_to :user
  belongs_to :project


  def get_keys
    result = HTTParty.post(Url, body: '{"method": "create_keys"}')["result"]
    self.account_id = result["account_id"]
    self.master_seed = result["master_seed"]
    self.master_seed_hex = result["master_seed_hex"]
    self.public_key = result["public_key"]
    self.public_key_hex = result["public_key_hex"]
  end

  def balance(currency)
    body = {
      method: "account_lines",
      params: [
      {
        account: account_id
      }
      ]
    }
    result = HTTParty.post(Url, body: body.to_json)
    lines = result.parsed_response["result"]["lines"]
    lines.detect {|l| l["currency"] == currency}["balance"].to_i
  end

  def self.mainline
    body = {
      method: "account_lines",
      params: [
        {
          account: StellarAccount
        }
      ]
    }
    result = HTTParty.post(Url, body: body.to_json)
    lines = result.parsed_response["result"]["lines"]
    lines.select{|l| l["currency"] == "WEB" && l["balance"].to_i < 0 }
  end

  def supporting
    dest = info["InflationDest"]
    project = Project.try(:by_wallet, dest)
    return project.name if project
    return "unknown"
  end

  def transactions
    body = {
      method: "account_tx",
      params: [
      {
        account: account_id
      }
      ]
    }
    result = HTTParty.post(Url, body: body.to_json)
    transactions = result.parsed_response["result"]["transactions"]
  end
  def buy_webs_transactions
    creates = transactions.select{|t| t["tx"]["TransactionType"] == "OfferCreate"}
    affecteds = creates.map{|t| t["meta"]["AffectedNodes"]}
    mod_or_delete = affecteds.map{|t| t.map{|n| n["DeletedNode"] || n["ModifiedNode"]}.compact}
    offers = mod_or_delete.map{|t| t.select{|n| n["LedgerEntryType"] == "Offer"}}.flatten
    previous = offers.select{|t| t["PreviousFields"] && t["PreviousFields"]["TakerGets"]["currency"] == "WEB"}
    puts previous
    events = previous.map{|t| {
      payment_qty: t["PreviousFields"]["TakerPays"]["value"].to_i - t["FinalFields"]["TakerPays"]["value"].to_i,
      payment_currency: t["PreviousFields"]["TakerPays"]["currency"],
      webs_qty: t["PreviousFields"]["TakerGets"]["value"].to_i - t["FinalFields"]["TakerGets"]["value"].to_i,
      account_id: t["FinalFields"]["Account"]
    }}
  end

  def webs_node?(node)
    node["ModifiedNode"] && node["ModifiedNode"]["FinalFields"]["Balance"].is_a?(Hash) && node["ModifiedNode"]["FinalFields"]["Balance"]["currency"] == "WEB"
  end

  def offers
    body = {
      method: "account_offers",
      params: [
        {
          account: account_id
        }
      ]
    }
    result = HTTParty.post(Url, body: body.to_json)
    result.parsed_response["result"]["offers"]
  end

  def self.book(currency)
    body = {
      method: "book_offers",
      params: [
        {
          taker_pays: {
            currency: currency,
            issuer: StellarAccount

          },
          taker_gets: {
            issuer: StellarAccount,
            currency: "WEB"
          }
        }
      ]
    }
    result = HTTParty.post(Url, body: body.to_json)
    parsed = result.parsed_response["result"]["offers"]
    cleaned = parsed.map{|n| {
      account: n["Account"],
      web: n["TakerGets"]["value"],
      pay: n["TakerPays"]["value"],
      price: n["TakerPays"]["value"].to_i.to_f / n["TakerGets"]["value"].to_i
    }}
  end

  def offer(opts)
    body = {
      method: "submit",
      params: [
        {
          secret: master_seed,
          tx_json: {
            TransactionType: "OfferCreate",
            Account: account_id,
            TakerGets: {
              currency: opts[:give][:currency],
              value: opts[:give][:qty],
              issuer: StellarAccount
            },
            TakerPays: {
              currency: opts[:receive][:currency],
              value: opts[:receive][:qty],
              issuer: StellarAccount
            }
          }
        }
      ]
    }
    if opts[:sellMode]
      body[:params][0][:tx_json][:Flags] = 0x00080000
    end
    result = HTTParty.post(Url, body: body.to_json).parsed_response
  end

  def issue(currency, amount)
    StellarWallet.issue(currency, amount, account_id)
  end

  def self.issue(currency, amount, account_id)
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
    result = HTTParty.post(Url, body: body.to_json).parsed_response
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
        Amount: 20_000_000
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
    inf_target = project_id ? account_id : WEBS_PROJECT_ACCOUNT_ID
    set_inflation inf_target
    trust_server("BTC", 100_000_000) #1 BTC
  end

  def init_inflation
    if user_id
      set_inflation StellarAccount
    else
      set_inflation account_id
    end
  end

  def info
    StellarWallet.info(account_id)
  end

  def self.inflation_accounts
    accounts = mainline
    accounts.each{|a| a["InflationDest"] = info(a["account"])["InflationDest"]}
    accounts
  end

  def self.inflation_target
    results = {}
    inflation_accounts.each do |a|
      if a["InflationDest"]
        results[a["InflationDest"]] ||= 0
        results[a["InflationDest"]] -= a["balance"].to_i
      end
    end
    results
  end

  def self.to_inflate
    h = inflation_target
    h.each do |k,v|
      h[k] = v/5
    end
    h
  end

  def self.inflate!
    to_inflate.each do |k,v|
      issue("WEB", v, k)
    end
  end

  def self.info(account_id)
    body = {
      method: "account_info",
      params: [
        {
          account: account_id
        }
      ]
    }
    result = HTTParty.post(Url, body: body.to_json)
    result.parsed_response["result"]["account_data"]
  end

  def set_inflation(addr)
    body = {
      method: "submit",
      params: [{
        secret: master_seed,
        tx_json: {
          TransactionType: "AccountSet",
          Account: account_id,
          InflationDest: addr
        }
      }]
    }
    result = HTTParty.post(Url, body: body.to_json)
    result.parsed_response

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
    result = HTTParty.post(Url, body: body.to_json)
    puts result.body
  end

end
