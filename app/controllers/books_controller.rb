class BooksController < ApplicationController
  def show
    book = StellarWallet.book("BTC")
    with_projects = book.map{|h| h[:project] = Project.by_wallet(h[:account]); h}
    render json: with_projects
  end
end
