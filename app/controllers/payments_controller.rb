class PaymentsController < ApplicationController
  def index #Tell Blockchain about it
    user = User.where(funding_address: params[:input_address], funding_secret: params[:secret]).first
    if user
      payment = Payment.create(
        user_id: user.id,
        address: params[:address],
        value: params[:value],
        destination_address: params[:destination_address],
        input_address: params[:input_address],
        input_transaction_hash: params[:input_transaction_hash],
        transaction_hash: params[:transaction_hash],
      )
      if payment.persisted?
        render text: "ok"
        return
      end
    end
    render text: "not ok"
  end
end
