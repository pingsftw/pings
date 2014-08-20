class UsersController < ApplicationController
  def create
    user = User.create(email: params[:email], password: params[:password])
    if user.persisted?
      sign_in(user)
    end
    render json: user
  end
end
