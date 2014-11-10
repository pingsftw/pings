class Charge < ActiveRecord::Base
  belongs_to :card
  def user
    card.user
  end

  def self.recent
    []
  end

  def email_for_approval
    UserMailer.user_approval_email(user, self).deliver
    UserMailer.admin_approval_email(user, self).deliver
  end

  def process!
    user.ensure_stellar_wallet
    user.update_attributes approved: true
    res = user.stellar_wallet.issue("USD", amount)
    puts res
    self.issue_hash = res["tx_json"]["hash"]
    res =  user.bid(:usd)
    self.bid_hash = res["tx_json"]["hash"]
    save!
    email
  end

  def email
    UserMailer.usd_email(user, self).deliver
  end
end
