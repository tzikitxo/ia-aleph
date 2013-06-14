class PrintController < ApplicationController
  
  require 'pdfkit'
  
  def printFromHtml
    
    # html = render_to_string 'books/print', :layout => false
    html = params[:html]
    raise "error!" if html.blank?
    filename = params[:filename]
    filename = 'list' if filename.blank?
    filename=filename.gsub(/ *$/, '')
    pdfKit = PDFKit.new html
    pdfData = pdfKit.to_pdf
    send_data pdfData, :filename => "#{filename}.pdf", :type => 'application/pdf'
  end
end
