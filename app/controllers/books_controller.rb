class BooksController < ApplicationController
  def show
    currency = params[:currency] == "USD" ? "USD" : "BTC"
    book = StellarWallet.book(currency)
    with_projects = book.map{|h| h[:project] = Project.by_wallet(h[:account]); h}
    render json: with_projects
  end
end
