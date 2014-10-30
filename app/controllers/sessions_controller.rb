class SessionsController < ApplicationController
  def create
    user = User.where(email: params[:email]).first
    if user && user.valid_password?(params[:password])
      if !user.confirmed?
        render json: {errors: {email: "That's a good start", password: "But you need to confirm first"}}
      else
        sign_in user
        render json: user
      end
    else
      render json: {errors: {email: "sorry", password: "no good"}}
    end
  end
  def destroy
    sign_out
    render json: {:csrfToken => form_authenticity_token}
  end
end
