class Charge < ActiveRecord::Base
  belongs_to :card
  def user
    card.user
  end
  def process!
    user.ensure_stellar_wallet
    res = user.stellar_wallet.issue("USD", amount)
    self.issue_hash = res["result"]["tx_json"]["hash"]
    res =  user.bid(:usd)
    self.bid_hash = res["result"]["tx_json"]["hash"]
    save!
    email
  end

  def email
    UserMailer.usd_email(user, self).deliver
  end
end
