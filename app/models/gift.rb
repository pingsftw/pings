class Gift < ActiveRecord::Base
  belongs_to :giver, class_name: "User"
  belongs_to :receiver, class_name: "User"

  def process
    receiver = User.find_by_email(receiver_email)
    if receiver
      deliver
      UserMailer.gift_email(self).deliver
    else
      UserMailer.gift_invitation_email(self).deliver
    end
    self
  end

  def deliver
    giver.stellar_wallet.pay(receiver.stellar_wallet.account_id, value)
  end
end
