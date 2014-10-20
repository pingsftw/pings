class StellarWallet < ActiveRecord::Base
  Url = 'https://test.stellar.org:9002'
  StellarSecret = "sfvmSPdfVM6FFhSjSxvKVcg6vR95FAWBuczLoecNVH7xVJhBF8f"
  StellarAccount = "gCmk3eZhFdBGyVf2epUEYhkD91s2JatGz"
  WEBS_PROJECT_ACCOUNT_ID = "gG7WkiVMubimEfL2q4VhPmcniLxDCqQqTK"
  before_save :setup
  belongs_to :user
  belongs_to :project

  class StellarBoom < StandardError; end;

  def setup
    get_keys
    prefund
    set_lines
  end

  def set_lines
    trust_server("WEB", 1000000)
    inf_target = project_id ? account_id : WEBS_PROJECT_ACCOUNT_ID
    set_inflation inf_target
    trust_server("BTC", 100_000_000) #1 BTC
    trust_server("USD", 100_000) #$1,000
  end

  def self.request(method, params = nil)
    body = {
      method: method
    }
    if params
      body[:params] = [params]
    end
    res = HTTParty.post(Url, body: body.to_json).parsed_response["result"]
    if res["engine_result"] && res["engine_result"] != "tesSUCCESS"
      throw StellarBoom.new(res)
    end
    res
  end

  def request(method, params = {})
    StellarWallet.request(method, params.merge({account: account_id}))
  end

  def submit(params)
    params[:secret] = master_seed
    params[:tx_json][:Account] = account_id
    StellarWallet.request("submit", params)
  end

  def self.submit(params)
    params[:secret] = StellarSecret
    params[:tx_json][:Account] = StellarAccount
    request("submit", params)
  end

  def get_keys
    result = StellarWallet.request("create_keys")
    self.account_id = result["account_id"]
    self.master_seed = result["master_seed"]
    self.master_seed_hex = result["master_seed_hex"]
    self.public_key = result["public_key"]
    self.public_key_hex = result["public_key_hex"]
  end

  def self.mainline
    lines = StellarWallet.request("account_lines", {account: StellarAccount})["lines"]
    lines.select{|l| l["currency"] == "WEB" && l["balance"].to_i < 0 }
  end

  def balance(currency)
    lines = StellarWallet.request("account_lines", {account: account_id})["lines"]
    lines.detect {|l| l["currency"] == currency}["balance"].to_i
  end

  def transactions
    StellarWallet.request("account_tx", {account: account_id})["transactions"]
  end

  def cancel_offer(offer)
    params = {
      tx_json: {
        TransactionType: "OfferCancel",
        OfferSequence: offer["seq"]
      }
    }
    submit(params)
  end

  def offers(currency)
    res = StellarWallet.request("account_offers", {account: account_id})["offers"]
    res.select{|o| o["taker_pays"]["currency"] == currency}
  end

  def on_offer(currency)
    offers(currency).map{|o| o["taker_gets"]["value"].to_i}.sum
  end

  def self.book(currency)
    params = {
          taker_pays: {
            currency: currency,
            issuer: StellarAccount

          },
          taker_gets: {
            issuer: StellarAccount,
            currency: "WEB"
          }
        }
    offers = request("book_offers", params)["offers"]
    cleaned = offers.map{|n| {
      account: n["Account"],
      web: n["TakerGets"]["value"],
      pay: n["TakerPays"]["value"],
      price: n["TakerPays"]["value"].to_i.to_f / n["TakerGets"]["value"].to_i
    }}
  end


  def offer(opts)
    params = {
      tx_json: {
        TransactionType: "OfferCreate",
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
    if opts[:sellMode]
      params[:tx_json][:Flags] = 0x00080000
    end
    submit(params)
  end

  def issue(currency, amount)
    StellarWallet.issue(currency, amount, account_id)
  end

  def self.issue(currency, amount, account_id)
    params = {
      tx_json: {
        TransactionType: "Payment",
        Destination: account_id,
        Amount: {
          currency: currency,
          issuer: StellarAccount,
          value: amount
        }
      }
    }
    self.submit(params)
  end

  def pay(address, value)
    params = {
    tx_json: {
        TransactionType: "Payment",
        Destination: address,
        Amount: {
          currency: "WEB",
          issuer: StellarAccount,
          value: value
        }
      }
    }
    submit(params)
  end

  def prefund
    params = {
      tx_json: {
        TransactionType: "Payment",
        Destination: account_id,
        Amount: 40_000_000
      }
    }
    StellarWallet.submit(params)
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
    request("account_info", {account: account_id})
  end

  def set_inflation(addr)
    params = {
      tx_json: {
        TransactionType: "AccountSet",
        InflationDest: addr
      }
    }
    submit(params)
  end

  def trust_server(currency, amount)
    params = {
      tx_json: {
        TransactionType: "TrustSet",
        LimitAmount: {
          currency: currency,
          issuer: StellarAccount,
          value: amount
        }
      }
    }
    submit(params)
  end

  def supporting
    dest = info["InflationDest"]
    project = Project.try(:by_wallet, dest)
    return project.name if project
    return "unknown"
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
end
