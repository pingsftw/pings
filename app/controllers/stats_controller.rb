class StatsController < ApplicationController
  def overview
    render json: {
      total_usd: Charge.sum(:amount),
      total_btc: Payment.sum(:value),
      issued_tokens: StellarWallet.tokens_outstanding
    }
  end
end
