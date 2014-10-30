class CardsController < ApplicationController
  Stripe.api_key = "sk_test_mH78kESY1UJUALYxszlDOAKz"

  def create
    customer = Stripe::Customer.create(
      :card => params[:token],
      :description => "payinguser@example.com"
    )
    card = Card.create(
      card_uid: customer.id,
      brand: customer.cards.first.brand,
      last4: customer.cards.first.last4
    )
    current_user.cards << card
    render json: card
  end

  def charge
    card = current_user.cards.last
    quantity = params[:quantity]
    charge = Stripe::Charge.create(
      :amount   => (quantity.to_f * 100).to_i, # $15.00 this time
      :currency => "usd",
      :customer => card.card_uid
    )
    payment = Charge.create(
      card_uid: charge.card.id,
      card_id: card.id,
      amount: charge.amount,
      customer: charge.customer,
      charge_uid: charge.id,
      balance_transaction: charge.balance_transaction,
      paid: charge.paid
    )
    if current_user.approved?
      payment.process!
      payment.reload
      net = StellarWallet.net_from_tx payment.bid_hash
      render json: net
    else
      payment.email_for_approval
      render json: {status: "approval"}
    end
  end

  def approve
    c = Charge.find_by_charge_uid(params[:charge_uid])
    c.process!
    render json: c
  end
end
