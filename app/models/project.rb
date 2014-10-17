class Project < ActiveRecord::Base
  has_one :stellar_wallet
  before_save :ensure_stellar_wallet
  attr_accessor :webs_balance
  has_many :acceptances

  def self.fill_level(currency, step_size)
    projects = Project.where(autobid: true)
    nxt = PriceLevel.nxt(currency)
    remaining = nxt[:remaining]
    while remaining >= projects.size
      qty = remaining > step_size * projects.size ? step_size : remaining / projects.size
      projects.each{|p| p.make_offer(currency, qty); remaining -= qty}
    end
    projects.first.make_offer(currency, remaining)
  end

  def accept(currency, limit)
    acceptance = acceptances.find_by(currency: currency) || Acceptance.new(project: self, currency: currency)
    acceptance.limit = limit
    acceptance.save!
  end

  def self.by_wallet(account_id)
    StellarWallet.find_by_account_id(account_id).try(:project)
  end

  def self.with_webs_balances
    all.each{|p| p.webs_balance = p.balance("WEB")}
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
    if nxt[:remaining] > qty
      sell currency, nxt[:price], qty
    else
      sell currency, nxt[:price], nxt[:remaining]
      make_offer(currency, qty - nxt[:remaining])
    end
  end

  def sell(currency, price, qty)
    stellar_wallet.offer(
      give: {currency: "WEB", qty: qty},
      receive: {currency: currency, qty: price * qty}
    )
    PriceLevel.register_offer(currency, price, qty)
  end

  def offers
    @offers ||= stellar_wallet.offers.map do |o|
      webs = o["taker_gets"]["value"].to_i
      btc = o["taker_pays"]["value"].to_i
      {
        webs: webs,
        btc: btc,
        price: btc.to_f / 100_000_000/ webs
      }
    end
  end

  def best_offer
    offers.sort_by{|o| o[:price]}.first
  end

  def as_json(*args)
    h = super(*args)
    h[:offers] = offers
    h[:best_offer] = best_offer
    h
  end
end
