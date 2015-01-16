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
    payment = process_charge(card, params[:qty].to_i * 100)
    payment.process!
    payment.reload
    render json: payment
  end

  def process_charge(card, quantity)
    stripe_charge = Stripe::Charge.create(
      :amount   => quantity,
      :currency => "usd",
      :customer => card.card_uid
    )
    payment = Charge.create(
      card_uid: stripe_charge.card.id,
      card_id: card.id,
      amount: stripe_charge.amount,
      customer: stripe_charge.customer,
      charge_uid: stripe_charge.id,
      balance_transaction: stripe_charge.balance_transaction,
      paid: stripe_charge.paid
    )
  end

  def charge
    card = current_user.cards.last
    quantity = params[:quantity]
    payment = process_charge(card, quantity)
    if current_user.approved?
      payment.process!
      payment.reload
      render json: payment
    else
      payment.email_for_approval
      render json: {status: "approval", amount: payment.amount}
    end
  end

  def approve
    c = Charge.find_by_charge_uid(params[:charge_uid])
    c.process!
    render json: c
  end
end
