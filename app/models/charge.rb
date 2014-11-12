class Charge < ActiveRecord::Base
  belongs_to :card
  has_one :user, :through => :card
  has_one :stellar_wallet, :through => :user

  def user
    card.user
  end

  def self.recent
    charges = where("bid_hash IS NOT null").includes([:user, :stellar_wallet]).order("created_at DESC").limit(5)
    .map do |c|
      {
        amount: c.amount,
        bid_hash: c.bid_hash,
        user: c.user.username || c.stellar_wallet.account_id,
        icon_url: c.user.icon_url
      }
    end
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
