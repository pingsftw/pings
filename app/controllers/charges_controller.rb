class ChargesController < ApplicationController
  def index
    render json: Charge.recent
  end
end
