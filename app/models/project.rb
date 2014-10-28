class Project < ActiveRecord::Base
  has_one :stellar_wallet
  attr_accessor :unoffered_webs
  has_many :acceptances

  def self.reset_btc
    all.each {|p| p.cancel_all("BTC")}
    PriceLevel.update_all filled: 0, complete: false
  end

  def self.for_wallets(account_ids)
    wallets = StellarWallet.where(account_id: account_ids).includes(:project)
    h = {}
    wallets.each {|w| h[w.account_id] = w.project}
    h
  end

  def self.fill_all(currency, step_size = 10000)
    while pl = PriceLevel.nxt(currency) do
      projects = bidders(currency)
      break if projects.empty?
      fill_level(currency, step_size, projects)
    end
  end

  def self.bidders(currency)
    projects = Project.where(autobid: true).includes(:acceptances)
    projects = projects.select{|p| p.acceptances.detect{|a| a.currency == currency}}
    projects.each do |p|
      p.unoffered_webs = p.balance("WEB") - p.webs_on_offer(currency)
    end
    projects.select{|p| p.unoffered_webs > 0}
  end

  def self.fill_level(currency, step_size, projects = nil)
    projects ||= bidders(currency)
    return if projects.empty?
    nxt = PriceLevel.nxt(currency)
    remaining = nxt[:remaining]
    while remaining > 0
      max_qty = remaining > step_size * projects.size ? step_size : remaining / projects.size
      max_qty = 1 if max_qty == 0
      done = true
      projects.each do |p|
        qty = [p.unoffered_webs, max_qty].min
        next if (qty == 0 || remaining == 0)
        done = false
        p.make_offer(currency, qty)
        remaining -= qty
        p.unoffered_webs -= qty
      end
      break if done
    end
  end

  def cancel_all(currency)
    stellar_wallet.offers(currency).each do |offer|
      stellar_wallet.cancel_offer(offer)
    end
  end

  def accept(currency, limit)
    acceptance = acceptances.find_by(currency: currency) || Acceptance.new(project: self, currency: currency)
    acceptance.limit = limit
    acceptance.save!
  end

  def self.by_wallet(account_id)
    StellarWallet.find_by_account_id(account_id).try(:project)
  end

  def ensure_stellar_wallet
    return stellar_wallet if stellar_wallet
    StellarWallet.create(project: self)
  end

  def issue_webs(quantity)
    stellar_wallet.issue("WEB", quantity)
  end

  def balance(currency)
    stellar_wallet.balance(currency)
  end

  def make_offer(currency, qty)
    nxt = PriceLevel.nxt(currency)
    return unless nxt
    if nxt[:remaining] >= qty
      sell currency, nxt[:price], qty
    else
      sell currency, nxt[:price], nxt[:remaining]
      make_offer(currency, qty - nxt[:remaining])
    end
  end

  def donation_summary
    txs = stellar_wallet.buy_webs_transactions
    h = {
      tokens_distributed: 0,
      usd_received: 0,
      btc_received: 0
    }
    txs.each do |tx|
      h[:tokens_distributed] += tx[:webs_qty]
      key = (tx[:payment_currency] == "USD" ? :usd_received : :btc_received)
      h[key] += tx[:payment_qty]
    end
    h
  end

  def sell(currency, price, qty)
    puts "SELL*************************"
    puts currency, price, qty
    puts stellar_wallet.offer(
      give: {currency: "WEB", qty: qty},
      receive: {currency: currency, qty: price * qty}
    )
    puts "*************************"
    PriceLevel.register_offer(currency, price, qty)
  end

  def offers(currency)
    @offers ||={}
    @offers[currency] ||=
    stellar_wallet.offers(currency).map do |o|
      webs = o["taker_gets"]["value"].to_i
      currency = o["taker_pays"]["value"].to_i
      {
        webs: webs,
        currency: currency,
        price: currency.to_f / webs
      }
    end
  end

  def webs_on_offer(currency)
    offers(currency).map{|o| o[:webs]}.sum
  end

  def best_offer(currency)
    offers(currency).sort_by{|o| o[:price]}.first
  end
end
