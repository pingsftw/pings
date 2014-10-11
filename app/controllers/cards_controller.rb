class CardsController < ApplicationController
  Stripe.api_key = "sk_test_mH78kESY1UJUALYxszlDOAKz"

  def create
    customer = Stripe::Customer.create(
      :card => params[:token],
      :description => "payinguser@example.com"
    )
    card = Card.create(token: customer.id)
    current_user.cards << card
    render json: card
  end

  def charge
    card = current_user.cards.last
    quantity = params[:quantity]
    Stripe::Charge.create(
      :amount   => (quantity.to_f * 100).to_i, # $15.00 this time
      :currency => "usd",
      :customer => card.token
    )
  end
end
