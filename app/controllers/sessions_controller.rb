class SessionsController < ApplicationController
  def create
    user = User.where(email: params[:email]).first
    if user.valid_password?(params[:password])
      sign_in user
      render json: user
    else
      render json: {errors: {email: "sorry", password: "no good"}}
    end
  end
  def destroy
    sign_out
    render json: {status: "ok"}
  end
end
