class Gift < ActiveRecord::Base
  belongs_to :giver, class_name: "User"
  belongs_to :receiver, class_name: "User"

  def process
    receiver = User.find_by_email(receiver_email)
    if receiver
      giver.stellar_wallet.pay(receiver.stellar_wallet.account_id, value)
    else
      UserMailer.gift_invitation_email(self).deliver
    end
    self
  end
end
