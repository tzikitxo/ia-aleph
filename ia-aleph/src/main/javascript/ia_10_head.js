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

var ia=window.ia=(window.ia||{});
ia.isReady=false;

(function(){
    
    ia.device={
        hasCordova:function(){
            return window.cordova?true:false;
        },
        isIphone:function(){
            return (this.hasCordova() && window.device.platform.match(/(iPad|iPhone|iPod)/i))?true:false;
        },
        isAndroid:function(){
            return (this.hasCordova() && window.device.platform.match(/android/i))?true:false;
        },
        isAndroidBefore44:function(){
            return (this.isAndroid() && window.device.version.match(/^([0123]\..*|[4]\.[0123](|[^0-9].*))$/))?true:false;
        },
        isIosBrowser:function(){
            return navigator.userAgent.match(/(iPad|iPhone|iPod)/i)?true:false;
        }
    };
    
})();

ia.startupFunction=function(){
    var ia=window.ia;
    
    var log,debug=log=ia.utils.log;
    
    var device=ia.device;
	var utils=ia.utils=ia.utils;
	var data=ia.data;
    
    log('starting app ',(device.hasCordova()?('with cordova'):'without cordova'),', url : ',document.location.href);
    if(device.hasCordova()){	
        log('device name = ',window.device.name,' , platform = ',window.device.platform);
    }

    



