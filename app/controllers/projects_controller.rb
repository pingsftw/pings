class ProjectsController < ApplicationController
  def show
    render json: Project.find(params[:id])
  end

  def totals
    project = Project.find(params[:project_id])
    render json: project.donation_summary
  end
end
