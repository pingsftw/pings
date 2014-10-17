class PriceLevel < ActiveRecord::Base
  def self.for_currency(currency)
    where(currency: currency, complete: false).order("price ASC").first
  end
  def self.nxt(currency)
    level = for_currency(currency)
    return unless level
    {price: level.price, remaining: level.target - level.filled}
  end

  def self.register_offer(currency, price, qty)
    level = for_currency(currency)
    return false if level.price != price
    return false if qty > (level.target - level.filled)
    level.filled += qty
    level.complete = level.filled == level.target
    level.save!
  end

end
