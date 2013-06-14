/*
	This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 **/

$(function(){
	$('.convertToPdfButton').bind('click',function(){
		var html=$('html')[0].outerHTML;
		var form=$('<form target="_blank" action="http://0.0.0.0:3000/print/printFromHtml" method="POST"></form>');
		$('<textarea name="html" />').text(html).appendTo(form);
		$('<textarea name="filename" />').text($('.listTitle').text()).appendTo(form);
//		$('<textarea name="filename" />').text($('.listTitle').text()+' '+$('.armylistName').text()).appendTo(form); TODO
		form.submit();
	});
//	log('print js ready!');
});
