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

var configwindow=ia.configwindow={};

(function(){
    
    
	function addButton(config){
		var button=$('<div class="configPopupButton configPopupEntry"/>').bind('click',function(){
			config.onClick();
			config.update(button);
		}).appendTo(configScrollerWrapper);
		config.update(button);
	}
	
	function addInput(config){
		var inputField=$('<input type="text" />');
		function markField(className){
			inputField.removeClass('modifiedInput').removeClass('brokenInput');
			if(className){
				inputField.addClass(className);
			}
		}
		if(config.getSize || config.size){
			inputField.attr('size',config.size||config.getSize());
		}
		config.isValid=config.isValid||function(){
			return true;
		};
		inputField
		.val(config.getValue())		
		.bind('change',function(){		
			var value=inputField.val();
			if(config.isValid(value)){
				config.onChange(value);
				inputField.val(config.getValue());
				markField();
			}else{
				markField('brokenInput');
			}
		}).bind('keyup keydown',function(){
			var value=inputField.val();
			if(config.hasChanged(value)){
				if(config.isValid(value)){					
					markField('modifiedInput');
				}else{
					markField('brokenInput');					
				}
			}
		});
		
		$('<div class="configPopupEntry"/>')
		.append(config.label)
		.append(inputField)
		.appendTo(configScrollerWrapper);
		
		return {
			updateValue:function(){
				inputField.val(config.getValue());	
			}
		};
	}
    
	var configScrollerWrapper=$('#configPopupScrollerWrapper');
	var configPopup=$('#configPopup');
    
	$('<div class="configPopupButton closeButton configPopupEntry"/>').text(messages.get('config.saveAndClose'))
	.prepend($('<img class="buttonIcon"></img>').attr('src','images/delete_icon.png'))
	.bind('click',function(){
		$('#rootContainer').show();
		//        configPopup.hide('fast');
		configPopup.hide();
		armyList.validateList();
	}).appendTo(configScrollerWrapper);
    
    
	
	addButton({
		onClick:function(){
			weapons.toggleRangeUnits();
		},
		update:function(button){
			button.text(messages.get('config.selectRange.'+weapons.getRangeUnits()));
		}
	});
    
	var localesBar=$('<div class="configPopupEntry" id="configLocaleBar" />').appendTo(configScrollerWrapper);
	$('<div class="entryLabel"/>').text(messages.get('config.chooseLocale')).appendTo(localesBar);
	$.each(messages.availableLocales,function(index,locale){
		var localeBarButton=$('<div class="configPopupButton localeBarButton" />').appendTo(localesBar)
		.bind('click',function(){
			messages.setLang(locale);
			window.location=utils.getBaseUrl(); //reload
		});
		$('<img />').attr('title',locale).attr('src','images/flag_'+locale+'.png').attr('alt',locale).appendTo(localeBarButton);
		if(messages.getLang()==locale){
			localeBarButton.addClass('selected');
		}
	});
    
	var wikiLangBar=$('<div id="wikiLangBar"  class="configPopupEntry"/>').appendTo(configScrollerWrapper);
	$('<div  class="entryLabel"/>').text(messages.get('config.chooseWikiLocale')).appendTo(wikiLangBar);
	$.each(wiki.getAvailableLangs(),function(index,lang){
		var localeBarButton=$('<div class="configPopupButton localeBarButton" />').appendTo(wikiLangBar)
		.bind('click',function(){
			$('.localeBarButton.selected',wikiLangBar).removeClass('selected');
			localeBarButton.addClass('selected');
			wiki.setLang(lang);
		//            reloadButton.show();
		});
		$('<img />').attr('title',lang).attr('src','images/flag_'+lang+'.png').attr('alt',lang).appendTo(localeBarButton);
		if(wiki.getLang()==lang){
			localeBarButton.addClass('selected');
		}
	});
	
	addButton({
		onClick:function(){
			config.toggle('armylist.touchAction');
		},
		update:function(button){
			button.text(messages.get('config.armyListTouchActionButton.text')+messages.get('config.armyListTouchActionButton.text.'+config.get('armylist.touchAction')));  
		}
	});
	
	addButton({
		onClick:function(){
			config.toggle('units.modelSelectionMode');		
		},
		update:function(button){
			button.text(messages.get('config.modelSelectionModeButton.text')+messages.get('config.modelSelectionModeButton.text.'+config.get('units.modelSelectionMode')));  
		}
	});
	
	addButton({
		onClick:function(){
			config.toggle('units.smallScreen.showListAfterAdd');		
		},
		update:function(button){
			button.text(messages.get('config.showListAfterAddButton.text')+' : '+(config.get('units.smallScreen.showListAfterAdd')?messages.get('config.yes'):messages.get('config.no')));
		}
	});
	
	addButton({
		onClick:function(){
			config.toggle('units.classicCostSwcPositioning');
		},
		update:function(button){
			button.text(messages.get('config.classicCostSwcPositioning.text')+' : '+(config.get('units.classicCostSwcPositioning')?messages.get('config.yes'):messages.get('config.no')));
			if(config.get('units.classicCostSwcPositioning')){
				$('#rootContainer').addClass('classicCostSwcPositioning').removeClass('originalCostSwcPositioning');
			}else{
				$('#rootContainer').addClass('originalCostSwcPositioning').removeClass('classicCostSwcPositioning');
			}
		}
	});
	
	addButton({
		onClick:function(){
			config.toggle('main.viewMode');
		},
		update:function(button){
			button.text(messages.get('config.viewMode.'+config.get('main.viewMode')));
			$('#rootContainer').removeClass('defaultViewMode').removeClass('mobileViewMode').addClass(config.get('main.viewMode'));
		}
	});
	
	addButton({
		onClick:function(){
			config.toggle('main.theme');
		},
		update:function(button){
			button.text(messages.get('config.mainTheme.'+config.get('main.theme')));
			utils.setTheme(config.get('main.theme'));
			plugins.onSizeOrLayoutChanged(); 
		}
	});
	
	// CURRENT LIST CONFIG
     
	var combatGroupSizeValueField=addInput({
		label:messages.get('config.combatGroupSize'),
		size:4,
		getValue:function(){
			return armyList.combatGroupSize;
		},
		onChange:function(value){
			armyList.combatGroupSize=Number(value);
		},
		hasChanged:function(value){
			return Number(value)!=armyList.combatGroupSize;
		},
		isValid:function(value){
			return value && value.match('^[0-9]*$') && !isNaN(Number(value)) && Number(value)>0;
		}
	});
     
	var pointCapValueField=addInput({
		label:messages.get('config.pointCap'),
		size:4,
		getValue:function(){
			return armyList.getPointCap();
		},
		onChange:function(value){
			armyList.setPointCap(Number(value));
		},
		hasChanged:function(value){
			return Number(value)!=armyList.getPointCap();
		},
		isValid:function(value){
			return value && value.match('^[0-9]*$') && !isNaN(Number(value)) && Number(value)>0;
		}
	});
	
	addInput({
		label:messages.get('config.deviceId'),
		getSize:function(){
			return Math.round(remote.getDeviceId().length*4/3);
		},
		getValue:function(){
			return remote.getDeviceId().replace(/([0-9]{3})/g,'$1 ');
		},
		onChange:function(value){
			value=value.replace(/ /g,'');
			remote.setDeviceId(value);
			armyList.syncFromRemote();
			return value;
		},
		hasChanged:function(value){
			return remote.getDeviceId()!=value.replace(/ /g,'');
		},
		isValid:function(value){
			return value && value.match('^[0-9 ]*$') && value.replace(/ /g,'').length>12;
		}
	});
     
	var configPopupScrollWrapper = $('#configPopupScrollWrapper'),configPopupScrollerWrapper=$('#configPopupScrollerWrapper');
	var configScroller=configwindow.configScroller=utils.createScroll({
		getScrollWrapper:function(){
			return configPopupScrollWrapper;
		},
		getAvailableHeight:function(){
			//                    return $(window).height()-$('#savedLists').outerHeight(true)+this.getExpectedHeight();
			//            return $(window).height()-40; // should be 38
			return $(window).height()
			-($('#configPopup').outerHeight(true)
				-configPopupScrollWrapper.height());
		},
		getExpectedHeight:function(){
			return configPopupScrollerWrapper.outerHeight(false);
		},
		name:'configScroller',
		iScrollConfig:{
			vScrollbar:true
		}
	});
    
	plugins.registerPlugin('configScroller',{
		onSizeOrLayoutChanged:function(){
			configScroller.updateScroll();
		}
	});
    
	configwindow.showConfigWindow=function(){
		//BEGIN init
		combatGroupSizeValueField.updateValue();
		pointCapValueField.updateValue();
		//END init
		configPopup.show();
		configScroller.updateScroll();
	};
    
}());
	 