class GiftsController < ApplicationController
  def create
    result = current_user.give(params)
    render json: result
  end
  def index
    render json: current_user.received_gifts
  end
end
