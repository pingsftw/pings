class Cashout < ActiveRecord::Base
  belongs_to :project
  def process!
    update_attributes!(redeem_hash: project.stellar_wallet.redeem("USD", value)["tx_json"]["hash"])
    update_attributes!(stripe_id: project.stripe_recipient.pay(value, redeem_hash))
  end
end
