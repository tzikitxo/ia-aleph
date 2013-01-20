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
    
	var configScrollerWrapper=$('#configPopupScrollerWrapper');
	var configPopup=$('#configPopup');
    
	$('<div class="configPopupButton closeButton configPopupEntry"/>').text(messages.get('config.saveAndClose')).bind('click',function(){
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
			utils.updateAllScroll();          
		}
	});
	
	// CURRENT LIST CONFIG
     
	var combatGroupSizeValueField;
	$('<div  class="configPopupEntry"/>').append(messages.get('config.combatGroupSize')).append(combatGroupSizeValueField=$('<span />').text(armyList.combatGroupSize).editable(function(value){
		var newValue=Number(value);
		if(newValue&&newValue>0){
			armyList.combatGroupSize=newValue;
			return newValue;
		}else{
			return armyList.combatGroupSize;
		}
	})).appendTo(configScrollerWrapper).bind('click',function(){
		combatGroupSizeValueField.trigger('click');
	});
     
	var pointCapValueField;
	$('<div  class="configPopupEntry"/>').append(messages.get('config.pointCap')).append(pointCapValueField=$('<span />').text(armyList.getPointCap()).editable(function(value){
		var newValue=Number(value);
		if(newValue&&newValue>0){
			armyList.setPointCap(newValue);
			return newValue;
		}else{
			return armyList.getPointCap();
		}
	})).appendTo(configScrollerWrapper).bind('click',function(){
		pointCapValueField.trigger('click');
	});
     
	var configScroller=configwindow.configScroller=utils.createScroll({
		getScrollWrapper:function(){
			return $('#configPopupScrollWrapper');
		},
		getAvailableHeight:function(){
			//                    return $(window).height()-$('#savedLists').outerHeight(true)+this.getExpectedHeight();
			//            return $(window).height()-40; // should be 38
			return $(window).height()
			-($('#configPopup').outerHeight(true)-$('#configPopupScrollWrapper').height());
		},
		getExpectedHeight:function(){
			return $('#configPopupScrollerWrapper').outerHeight(false);
		},
		name:'configScroller',
		iScrollConfig:{
			vScrollbar:true
		}
	});
    
	configwindow.showConfigWindow=function(){
		//BEGIN init
		combatGroupSizeValueField.text(armyList.combatGroupSize);
		pointCapValueField.text(armyList.getPointCap());
		//END init
		configPopup.show();
		configScroller.updateScroll();
	};
    
}());
	 