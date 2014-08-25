class PaymentsController < ApplicationController
  def index #Tell Blockchain about it
    pa = PaymentAddress.where(address: params[:input_address], secret: params[:secret]).first
    if pa
      payment = Payment.create(
        payment_address: pa,
        address: params[:address],
        value: params[:value],
        destination_address: params[:destination_address],
        input_address: params[:input_address],
        input_transaction_hash: params[:input_transaction_hash],
        transaction_hash: params[:transaction_hash],
      )
      if payment.persisted?
        render text: "*ok*"
        payment.process!
        pa.user.ensure_stellar_wallet.issue(payment.value)
        UserMailer.payment_email(pa.user, payment).deliver
        return
      end
    end
    render text: "not ok"
  end
end
