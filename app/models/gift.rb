class Gift < ActiveRecord::Base
  belongs_to :giver, class_name: "User"
  belongs_to :receiver, class_name: "User"
  validates :value, numericality: {only_integer: true, greater_than: 0}
  validate :has_enough

  def process
    return if transaction_hash
    puts self
    receiver = self.receiver || User.find_by_email(receiver_email)
    if receiver
      deliver
      UserMailer.gift_email(self).deliver
    else
      UserMailer.gift_invitation_email(self).deliver
    end
    self
  end

  def has_enough
    available = giver.available_tokens
    if available < value
      errors.add(:value, "Must be less than available #{TOKEN_NAME} (#{available})")
    end
  end

  def deliver
    receiver.stellar_wallet.setup
    res = giver.stellar_wallet.pay(receiver.stellar_wallet.account_id, value)
    update_attributes(transaction_hash: res["tx_json"]["hash"])
  end

  def as_json(*args)
    h = super(*args)
    h["sender_email"] = giver.email
    h["errors"] = self.errors
    h
  end
end
