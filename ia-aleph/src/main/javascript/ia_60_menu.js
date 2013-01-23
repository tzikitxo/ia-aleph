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

var menu=ia.menu={};

(function(){
    
    //$('#mainMenuButton').html('<img src="images/app_logo_small.png" /> MENU <img src="images/app_logo_small.png" id="menuFactionIcon"/>').bind('click',function(){
	
    $('body').bind('click',function(){
        if(isShowing){
            hideMenu();
        }
    });
    
    
    var menuScroll=utils.createScroll({
        getScrollWrapper:function(){
            return   $('#mainMenuScrollWrapper');
        },
        getAvailableHeight:function(){
            return $(window).height()
            -($('#mainMenu').outerHeight(true)-$('#mainMenuScrollWrapper').height())
            -5;
        },
        getExpectedHeight:function(){
            return $('#mainMenuScrollContent').height();
        },
        name:'mainMenuScroll',
        iScrollConfig:{
            vScrollbar:true
        }
    });
    
    var isShowing=false;
    function showMenu(){
        $('#mainMenu').slideDown('fast',function(){
            menuScroll.updateScroll();
            isShowing=true;
        });
    }
    function hideMenu(){
        $('#mainMenu').slideUp('fast');
        isShowing=false;
    }
    function toggleMenu(){
        if(isShowing){
            hideMenu();
        }else{
            showMenu();			
        }
    }
	
    $('.mainMenuButton').html('<img src="images/app_logo_small.png" /> '+messages.get('menu.menuTitle')).bind('click',function(){
        showMenu();
        return false;
    });
	
    if(device.hasCordova()){
        document.addEventListener("menubutton", function(){
            toggleMenu();
        });
    }
    
    function addMenuButton(config){
        var menuButton=$('<div class="menuButton" />').text(config.label).appendTo('#mainMenuScrollContent').bind('click',function(){
            config.handler();
            return false;
        });
        if(config.icon){
            menuButton.prepend($('<img class="menuButtonIcon" />').attr('src','images/'+config.icon+'_icon.png'));
        }
    }
    function addMenuButtons(configList){
        $.each(configList,function(index,config){
            addMenuButton(config);
        });
    }
    function hideMain(){
        $('#rootContainer').hide();
    }
    
    addMenuButtons([{
        label:messages.get('menu.close'),
        handler:function(){
            hideMenu();
        },
        icon:'close'
    },{
        label:messages.get('menu.exportList'),
        handler:function(){
            hideMenu();
            armyList.exportAndShowList();
        },
        icon:'export'
    }]);

    if(!device.hasCordova()){
        addMenuButton({
            label:messages.get('menu.printList'),
            handler:function(){
                hideMenu();
                armyList.printList();
            },
            icon:'print'
        });
    }
	
    addMenuButtons([{
        label:messages.get('menu.newList'),
        handler:function(){
            hideMenu();
            factions.showFactionMenu();
        },
        icon:'new'
    },{
        label:messages.get('menu.loadMercs'),
        handler:function(){
            hideMenu();
            units.loadMercs();
        },
        icon:'mercs'
    },{
        label:messages.get('menu.loadList'),
        handler:function(){
            hideMenu();
            armyList.showSavedListsWindow();
        },
        icon:'load'
    },
    {
        label:messages.get('menu.campaignTools'),
        handler:function(){
            hideMenu();
            campaign.showMilitarySpecialitiesControlScreen();
        },
        icon:'campaign'
    },
    {
        label:messages.get('menu.wiki'),
        handler:function(){
            hideMenu();
            wiki.searchWiki();
            hideMain();
        },
        icon:'wiki'
    },{
        label:messages.get('menu.openConfigWindow'),
        handler:function(){
            hideMenu();
            configwindow.showConfigWindow();
            hideMain();
        },
        icon:'config'
    },{
        label:messages.get('menu.donate'),
        handler:function(){
            hideMenu();
            window.open("https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=LUCCGRC73TPGW",'_blank');
        },
        icon:'donate'
    }]);

    // SMALL SCREEN MENU
    
    var currentMode,switchMode=menu.switchMode=function(newMode){
        currentMode=newMode;
        $('#rootContainer').removeClass('armylistMode').removeClass('unitDetailMode').removeClass('unitSelectionMode').addClass(newMode);
        config.set('smallScreen.lastView',newMode);
        utils.updateAllScroll();
    } 
    switchMode(config.get('smallScreen.lastView'));
    
    $('#smallScreenTopBar .armylistViewButton').text(messages.get('menu.armylistView')).bind('click',function(){
        switchMode('armylistMode');
    });
    $('#smallScreenTopBar .addModelButton').text(messages.get('menu.addModel')).bind('click',function(){
        switchMode('unitSelectionMode');
    });
    $('#smallScreenTopBar .unitDetailButton').text(messages.get('menu.unitDetail')).bind('click',function(){
        switchMode('unitDetailMode');
    });
	
//	var modes={
//		1:'armylistMode',
//		'armylistMode':1,
//		'unitSelectionMode':2,
//		2:'unitSelectionMode',
//		0:'unitDetailMode',
//		'unitDetailMode':0
//	};
//	
//	$('#rootContainer').bind('swipeleft swiperight',function(e){
//		log('swipe event : ',e);
//		var newMode=modes[(modes[currentMode]+(e.type=='swipeleft'?1:2))%3];
//		log('swiping to : ',newMode);
//		switchMode(newMode);
//	})
	
}());
	 