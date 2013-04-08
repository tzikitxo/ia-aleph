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

	var ia=window.ia=window.ia||{};
	var utils=ia.utils=ia.utils||{};
	var data=ia.data; // loaded from ia-data.js
	
	var log,debug;
	utils.log=log=debug=function(){
		if(!window.console){
			return;
		}else if(ia.device && ia.device.hasCordova()){
			var str='';
			$.each(arguments,function(x,val){
				str+=val; 
			});
			window.console.debug(str);
		}else{
			window.console.debug.apply(window.console,arguments);
		}
	};
	var dump=utils.dump=function(name,str){
		log(name,' : ',str);
		return str;
	}

	utils.getBaseUrl=((function(){
		var url= window.location.protocol
		+'//'
		+window.location.hostname
		+(window.location.port?(':'+window.location.port):'')
		+window.location.pathname;
		//  if(!url || url.match('^chrome-extension:')){
		if(!url){
			url=utils.getAbsoluteBasePath()+'ia.html';
		}
		return function(){
			return url;
		}
	})());

	utils.getBasePath=function(){
		return utils.getBaseUrl().replace(/ia.html$/,'');
	}

	utils.getAbsoluteBasePath=function(){
		return window.location.hostname=='localhost'?utils.getBasePath():'http://anyplace.it/ia/';
	}

	utils.cleanName=function(origName){
		return origName.toLowerCase().replace(/[^0-9a-z]+/g,'_').replace(/^_/,'').replace(/_$/,'');
	}

	utils.buildImagePath=function(name,suffix){
		//	var path=utils.getBasePath()+'/images/'+utils.cleanName(name);
		var path='images/'+utils.cleanName(name);
		if(suffix){
			path+='_'+suffix;
		}
		return path+'.png';
	}

	utils.remoteServiceAvailable=false;
	$.ajax({
		type: 'GET',
		url: utils.getAbsoluteBasePath()+'/ia.php?action=checkService',
		success: function(data){
			if(data && data.success){
				log('remote service available');
				utils.remoteServiceAvailable=true;
			}else{
				log('remote service unavailable: ',data);
			}
		},
		dataType: 'json'
	});
	
	utils.ajax=function(config){
		var name=config.name||config.action;
		function success(data){
			log(name,' success : ',data);
			if(config.success){
				config.success(data);
			}
		}
		function error(data){
			log(name,' error : ',data);
			utils.remoteServiceAvailable=false;
			if(config.error){
				config.error(data);
			}
		}
		var validateResponse=config.validateResponse||function(data){
			return (data && data.success)?true:false;
		};
		$.ajax($.extend({
			type: config.type||'GET',
			url: utils.getAbsoluteBasePath()+'/ia.php?action='+config.action,
			data: config.data,
			success: function(data){
				if(validateResponse(data)){
					success(data);
				}else{                
					error(data);
				}     
			},
			error: function(){     
				error(data);
			},
			dataType: 'json'
		},config.ajaxConfig||{}));
	};

	utils.getTinyUrl=function(configArg){
		var config=$.extend({
			error:function(){},
			success:function(){}
		},configArg);
		if(!utils.remoteServiceAvailable){
			log('getTinyUrl error : unavailable remoteService');
			config.error();
		}else{
			utils.ajax({
				type: 'POST',
				action:'getTinyUrl',
				data: JSON.stringify({
					"longUrl": config.url
				}),
				success:function(data){
					config.success(data.id);
				},
                                validateResponse:function(data){
                                    return (data && data.id)?true:false;
                                },
				ajaxConfig:config.ajaxConfig
			});
		//			$.ajax($.extend({
		//				type: 'POST',
		//				url: utils.getAbsoluteBasePath()+'/ia.php?action=getTinyUrl',
		//				data: JSON.stringify({
		//					"longUrl": config.url
		//				}),
		//				success: function(data){
		//					if(data && data.id){
		//						log('getTinyUrl success : ',data);
		//						config.success(data.id);
		//					}else{                
		//						log('getTinyUrl error : ',data);
		//						utils.remoteServiceAvailable=false;
		//						config.error(data);
		//					}     
		//				},
		//				error: function(){
		//					log('getTinyUrl error');
		//					utils.remoteServiceAvailable=false;
		//					config.error();
		//				},
		//				dataType: 'json'
		//			},config.ajaxConfig||{}));
		}
	};

	(function(){
		var baseUrlDx="http://www.infinitythegame.com/infinity/wp-content/themes/test/img/lateralDER/";
		var max=18;
    
		utils.getBackgroundImageDx=function(){
			var i=Math.floor(Math.random()*max)+1;
			var imageUrl=baseUrlDx+i+".png";
			return imageUrl;
		}
	})();

	utils.encodeData=function(data,config){
		var str=JSON.stringify(data);
		if(config && config.encode===false){
			return str;
		}
		var def;
		if(str.length>100){
			def=RawDeflate.deflate(str);
			log('deflated data from ',str.length,' to ',def.length,' characters');
		}else{
			def=str;
		}
		var enc=$.base64.encode(def).replace(/\//g,'_').replace(/[+]/g,'-').replace(/[=]/g,':');
		log('b64 encoded data from ',def.length,' to ',enc.length,' characters');
		return enc;
	};
	utils.decodeData=function(string,config){
		if(config && config.encode===false){
			return JSON.parse(string);
		}
		string=string.replace(/[%]../g,'').replace(/_/g,'/').replace(/-/g,'+').replace(/[.:]/g,'=').replace(/[^a-zA-Z0-9+\/=]/g,'');
		try{
			return JSON.parse($.base64.decode(string));
		}catch(e){
			log('error decoding without deflate, ',e,' trying with deflate');
			try{
				return JSON.parse(RawDeflate.inflate($.base64.decode(string)));
			}catch(e){
				log('error decoding with new b64 encoding, ',e,' trying with old encoding');
				return JSON.parse(RawDeflate.inflate($.base64legacy.decode(string)));
			}
		}
	};

	utils.wrapStorage=function(storage){
		var confingNs='it.anyplace.ia.';
		var storageWrapper={},valueConfig={};
		storageWrapper.configure=function(key,thisConfig){
			valueConfig[key]=thisConfig;
		};
		storageWrapper.unpack=function(key){
			var value= this.get(key);
			if(value){
				try{
					value=utils.decodeData(value,valueConfig[key]);
					return value;
				}catch(e){
					log('error unpacking value ',value,' for key ',key,' : ',e);
					return null;
				}
			}else{
				return null;
			}
		};
		storageWrapper.pack=function(key,value){
			this.set(key,utils.encodeData(value,valueConfig[key]));
		};
		storageWrapper.getOrInit=function(key,defaultInitializer){
			var value=this.get(key);
			if(value===undefined || value===null){
				value=defaultInitializer();
				this.set(key,value);
			}
			return value;
		};
		if(storage){
			storageWrapper.get=function(key){
				var value=storage.getItem(confingNs+key);
				if(value==="false"){
					return false;
				}else{
					return value;
				}
			};
			storageWrapper.set=function(key,value){
				if(value===undefined){
					value=true;
				}
				storage.setItem(confingNs+key,value);
			};
			storageWrapper.remove=function(key){
				storage.removeItem(confingNs+key);
			};
			storageWrapper.getAllWithPrefix=function(prefix,doUnpack){
				var res={},regexp=new RegExp('^'+confingNs+prefix),i;
				for(i=0;i<storage.length;i++){
					var key=storage.key(i);
					if(key.match(regexp)){
						key=key.replace(regexp,'');
						if(key){
							var value=doUnpack?storageWrapper.unpack(prefix+key):storageWrapper.get(prefix+key);
							if(value){
								res[key]=value;
							}
						}
					}
				}
				return res;
			};
			storageWrapper.unpackAllWithPrefix=function(prefix){
				return storageWrapper.getAllWithPrefix(prefix,true);
			};
			storageWrapper.isPersistent=true;
		}else{
			storageWrapper.get=function(key){
				return this[key];
			};
			storageWrapper.set=function(key,value){
				return this[key]=(value===undefined?true:value);
			};
			storageWrapper.remove=function(key){
				delete this[key];
			};
			storageWrapper.isPersistent=false;
		}
		return storageWrapper;
	}

	utils.getDisplayAttrName=function(attrName){
		return 'display'+attrName.substr(0,1).toUpperCase()+attrName.substr(1);
	};
	//
	//ia.showMain=function(){
	//    $('#rootContainer').show();
	//}

	utils.setTheme=function(newTheme){
		//    $('#cssLinkReference').remove().attr('href','css/style_theme_'+newTheme+'.css').appendTo('head');
		$('#cssLinkReference').attr('href','css/style_theme_'+newTheme+'.css');
	}

	utils.createScroll=function(config){
		var thisScroll=null,timeout=0;
		utils.log('created scroll ',config.name);
    
		var enableScroll=function(shouldReset){
			var ww=$(window).width(),wh=$(window).height();
			config.getScrollWrapper().css('height',Math.min(config.getAvailableHeight(ww,wh),config.getExpectedHeight()));
			if(config.getAvailableWidth){
				config.getScrollWrapper().css('width',Math.min(config.getAvailableWidth(ww,wh),config.getExpectedWidth()));
			}
			//  .css('width',config.getScrollWrapper().width());
			if(!thisScroll){
				log('enabling ',config.name);
				if(config.beforeEnable){
					config.beforeEnable();
				}
				thisScroll=new iScroll(config.getScrollWrapper()[0].id, $.extend({
					hScrollbar: false, 
					vScrollbar: false
				},config.iScrollConfig||{}));
			}
			setTimeout(function () {
				thisScroll.refresh();
				if(shouldReset){
					api.scrollToTop();
				}
				config.getScrollWrapper().addClass('scrollEnabled');
			},timeout);
		};
		var disableScroll=function(){
			if(thisScroll){
				log('disablig ',config.name);
				api.scrollToTop();
				thisScroll.destroy();
				thisScroll=null;
				config.getScrollWrapper().css('height','').css('width','').removeClass('scrollEnabled');
				//    .css('width','')            
				if(config.afterDisable){
					config.afterDisable();
				}
			}
		};
		var preLockPosition,isLocked=false;
		var api;
		return api={
			updateScroll:function(shouldReset){
				if(!ia.isReady){
					log('skipping ',config.name,' update : ia not ready');
				}else if(isLocked) {
					log('skipping ',config.name,' update : locked');
				}else{
					setTimeout(function () {
						var ww=$(window).width(),wh=$(window).height();
						var scrollWrapper=config.getScrollWrapper();
						if(!scrollWrapper || !(scrollWrapper[0]) || scrollWrapper.css('display') == 'none'){
							log(config.name,' scroll unavailable/hidden, skipping');
							return;
						}
						var availableHeight=config.getAvailableHeight(ww,wh),expectedHeight=config.getExpectedHeight(),
						expectedWidth=config.getExpectedWidth?config.getExpectedWidth():null,
						availableWidth=config.getAvailableWidth?config.getAvailableWidth(ww,wh):null;
						log('updating scroll ',config.name,', available : ',availableWidth||'_','x',availableHeight,
							' , expected : ',expectedWidth||'_','x',expectedHeight);
						if(availableHeight<0){
						// skipping, non-showing scroller
						}else if(availableHeight<expectedHeight || (expectedWidth && availableWidth<expectedWidth)){
							enableScroll(shouldReset);
						}else{
							disableScroll();
						}
					},timeout);
				}
				return this;
			},
			scrollToTop:function(){
				if(ia.isReady){
					if(thisScroll){
						thisScroll.scrollTo(0, 0, 0);
					}
				}
				return this;
			},
			scrollTo:function(el,timeout){
				if(ia.isReady){
					if(thisScroll){
						if(timeout!=undefined){
							setTimeout(function () {
								thisScroll.scrollToElement(el[0]||el,0);
							},timeout);
						}else{
							thisScroll.scrollToElement(el[0]||el,0);
						}
					}
				}
				return this;
			},
			disableScroll:disableScroll,
			lockScroll:function(){
				if(thisScroll && !isLocked){
					log('locking ',config.name);
					isLocked=true;
					preLockPosition={
						x:thisScroll.x,
						y:thisScroll.y
					};
					var scrollContent=config.getScrollWrapper().find(" > *"),style=scrollContent.attr('style');
					thisScroll.destroy();
					thisScroll=null;
					scrollContent.attr('style',style);
				}				
			},
			unlockScroll:function(){
				if(isLocked){
					setTimeout(function(){
						isLocked=false;
						enableScroll();
						thisScroll.scrollTo(preLockPosition.x,preLockPosition.y,0);
					});
				}
			}
		};
	}

	utils.newId=function(){
		//		function getRandomChars(){
		return (Math.random()*Math.pow(10, 17))+''; // 10^17 random combinations . . UUID is 10^38, but this should be enought for us . . 
	//		}
	//		return getRandomChars()+getRandomChars(); //roughly the same space as UUID
	};
	
	utils.parseDate=function(value){
		var dtNum=Number(value),date;
		if(isNaN(dtNum) || dtNum == 0 || !dtNum){
			date=new Date(value);
		}else{
			date=new Date(dtNum);
		}
		return isNaN(date)?null:date;
	};
	utils.exportDate=function(date){
		date=date||new Date();
		return date.getTime()+'';
	};

})();