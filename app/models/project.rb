class Project < ActiveRecord::Base
  has_one :stellar_wallet
  before_save :ensure_stellar_wallet

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

  def sell(price, qty)
    stellar_wallet.offer(
      give: {currency: "WEB", qty: qty},
      receive: {currency: "BTC", qty: (price * qty * 100_000_000).to_i}
    )
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
    h[:webs] = balance("WEB")
    h[:offers] = offers
    h[:best_offer] = best_offer
    h
  end
end
