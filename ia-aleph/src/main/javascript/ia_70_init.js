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
	
	log('starting ia-aleph app');
	
	$("#loadingContainer").hide();
        
	var listStr,listStrFromUrl=$(document).getUrlParam("list");
	if(!listStrFromUrl || listStrFromUrl==''){
		listStr=session.get('savedList');
		if(listStr){
			session.remove('savedList');
		}
	}else{
		listStr=unescape(listStrFromUrl);
		if(session.isPersistent){
			session.set('savedList',listStr);
			window.location=utils.getBaseUrl();
		}
	}
	
	armylist.loadListStr=function(listStr){
		log('loading list str (url/session) ',listStr);
		try{
			var list=armyList.decodeList(listStr);
			armyList.clear();
			units.clear();
			units.loadUnitsForList(list);
			armyList.importList(list);
			$('#rootContainer').show();
		}catch(e){
			ia.error=e;
			log('error : ',e);
			armyList.clear();
			units.clear();
			factions.showFactionChooser();
		}
	};
        
	function afterListStrSearch(){
		var list=null;
		// try to open ios native app, on ios
		if(!device.isIphone() && device.isIosBrowser()){
			var iosUrl='alephtoolbox:'+(listStr||'');
			log('launching ios url : ',iosUrl);
			window.location.href=iosUrl;
		}
		if(listStr){
			armylist.loadListStr(listStr);
		}else{
			if(!list){
				list=armyList.getLastSavedList();
			}
			if(list){
				try{
					log('loading list ',list);
					units.loadUnitsForList(list);
					armyList.importList(list);
					$('#rootContainer').show();
				}catch(e){
					ia.error=e;
					log('error : ',e);
					armyList.clear();
					units.clear();
					factions.showFactionChooser();
				}
			}else{
				factions.showFactionChooser();
			}
		}
	}
    
	armyList.parseListStrFromUrl=function(url){
		var str=null;
		if(url){
			str=url.replace(/^.*[?]list=/,'');
			if(str&&str!=''&&!str.match(/^http/)){
				str=unescape(str);
				return str;
			}
		}
		return null;
	}
    
	function parseListFromUrl(url){
		listStr=armyList.parseListStrFromUrl(url);
	}
	
	// LOAD FOR ANDROID ( INTENT )
	if(!listStr && device.isAndroid()){
		log('got cordova (android), scanning intent uri');
		var exec = cordova.require('cordova/exec'); 
		exec(function(url) {
			log('got intent uri = '+url);
			parseListFromUrl(url);
			afterListStrSearch();
		},function(){
			afterListStrSearch();
		}, 'WebIntent', 'getUri', []);
	}else if(!listStr && device.isIphone()){
		log('got cordova (iphone), scanning url');
		parseListFromUrl(window.invokeString || device.iosIntentUrl);
		afterListStrSearch();
	}else{
		log('no cordova');
		afterListStrSearch();
	}
        
	if(device.isAndroid()){
		// fix for mobile Drag 'n Drop, need test
		log('applying drag \'n drop fix for android');
		(function(){
			var mouseEventTypes = {
				touchstart : "mousedown",
				touchmove : "mousemove",
				touchend : "mouseup"
			//   click : clickEvent
			};
            
			var originalType;
			for(originalType in mouseEventTypes) {
				document.addEventListener(originalType, function(originalEvent) {
					if (originalEvent.type != 'click' && originalEvent.type != 'touchstart'){
						originalEvent.preventDefault();
					}
					var event = document.createEvent("MouseEvents");
					var touch = originalEvent.changedTouches[0];
					event.initMouseEvent(mouseEventTypes[originalEvent.type], true, true, window, 0, touch.screenX, touch.screenY, touch.clientX, touch.clientY, touch.ctrlKey, touch.altKey, touch.shiftKey, touch.metaKey, 0, null);
					originalEvent.target.dispatchEvent(event);
					event.preventDefault();
				});
			}
		})();
		
		//hiding splash screen
		window.navigator.splashscreen.hide();
	}

        
	plugins.afterAppLoading();
	
	ia.isReady=true;
	plugins.onSizeOrLayoutChanged();
})();
