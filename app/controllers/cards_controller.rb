class CardsController < ApplicationController
  def create
    card = Card.create(token: params[:token])
    current_user.cards << card
    render json: card
  end
end
