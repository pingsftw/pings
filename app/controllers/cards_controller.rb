class CardsController < ApplicationController
  def create
    card = Card.create(token: params[:token])
    current_user.cards << card
    render json: card
  end

  def charge
    card = current_user.cards.last
    quantity = params[:quantity]
  end
end
