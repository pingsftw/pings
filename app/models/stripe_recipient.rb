class StripeRecipient < ActiveRecord::Base
  belongs_to :project

  def pay(value, hash)
    tx = Stripe::Transfer.create(
      :amount => value,
      :currency => "usd",
      :recipient => stripe_id,
      :description => "Transfer for #{hash}"
    )
    tx["id"]
  end

  def self.from_stripe(recipient)
    hash = recipient.to_hash
    hash[:stripe_id] = hash.delete(:id)
    hash[:stripe_type] = hash.delete(:type)
    new(hash)
  end

  #StripeRecipient.for_project(project, {email: *, tax_id: *, routing_number: *, account_number: *})
  def self.for_project(project, options)
    res = Stripe::Recipient.create(
      name: project.name,
      type: "corporation",
      tax_id: options[:tax_id],
      bank_account: {
        country: "US",
        routing_number: options[:routing_number],
        account_number: options[:account_number]
      },
      email: options[:email]
    )
    r = from_stripe(res)
    r.project = project
    r
  end
end
