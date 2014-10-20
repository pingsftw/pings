class ProjectsController < ApplicationController
  def index
    render json: Project.with_webs_balances
  end
end
