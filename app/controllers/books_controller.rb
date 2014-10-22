class BooksController < ApplicationController
  def show
    currency = params[:currency] == "USD" ? "USD" : "BTC"
    book = StellarWallet.book(currency)
    projects = Project.for_wallets(book.map{|h| h[:account]})
    book.each{|h| h[:project] = projects[h]}
    render json: book
  end
end
