class PrintController < ApplicationController
  
  require 'pdfkit'
  
  def printFromHtml
    
    # html = render_to_string 'books/print', :layout => false
    html = params[:html]
    raise "error!" if html.blank?
    pdfKit = PDFKit.new html
    pdfData = pdfKit.to_pdf
    send_data pdfData, :filename => "list.pdf", :type => 'application/pdf'
  end
end
