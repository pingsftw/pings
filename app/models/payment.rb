class Payment < ActiveRecord::Base
  belongs_to :payment_address
  def user
    payment_address.user
  end
  def process!
    user.ensure_stellar_wallet
    res = user.stellar_wallet.issue("BTC", value)
    self.issue_hash = res["result"]["tx_json"]["hash"]
    res =  user.bid
    self.bid_hash = res["result"]["tx_json"]["hash"]
    save!
    email
  end

  def email
    UserMailer.payment_email(user, self).deliver
  end

  def as_json *args
    h = super *args
    # h["created_at"] = h["created_at"].getutc.iso8601
    h
  end
end
