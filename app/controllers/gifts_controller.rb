class GiftsController < ApplicationController
  def create
    result = current_user.give(params[:email], params[:value])
    render json: result
  end
end
