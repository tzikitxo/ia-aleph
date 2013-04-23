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

(function(){
    
    log('loading 26: main');
	
    var bgDxUrl=utils.getBackgroundImageDx();
    $('#rootContainer #overly1').css({
        'background-image':"url('"+bgDxUrl+"')",
        'background-position':$(document).height()>600?"right 300px":"right -0",
        'background-repeat':"no-repeat"
    });
    
    $(document).ajaxStart(function() {
        log('ajax start');
        $('.loadingIcon').show();
    });
	if($.active){
		$('.loadingIcon').show();
	}
    $(document).ajaxStop(function() {
        log('ajax stop');
        $('.loadingIcon').hide();        
    });
        
})();
