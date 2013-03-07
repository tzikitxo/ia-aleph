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

var factions=ia.factions={};

(function(){
	
    var factionNamesList=['Panoceania','Yu Jing','Ariadna','Haqqislam','Nomads','Combined Army','Aleph','Tohaa','Mercenary Company'];
    var factionsByName={},factionForSectorial={};
	
    $.each(factionNamesList,function(i,name){
        factionsByName[name]={
            name:name,
            sectorialsByName:{},
            displayName:names.get('faction',name)
        };
    });
    //    log('loaded core factions : ',factionsByName);
    $.each(data.sectorials,function(i,sectorial){
        //        log('loading sectorial : ',sectorial);
        factionsByName[sectorial.army].sectorialsByName[sectorial.name]={
            name:sectorial.name,
            displayName:names.get('faction',sectorial.name)
        };
        factionForSectorial[sectorial.name]=sectorial.army;
    });
    log('factions : loaded ',factions);
    
    var menuScroll=utils.createScroll({
        getScrollWrapper:function(){
            return   $('#factionsMenuScrollWrapper');
        },
        getAvailableHeight:function(){
            return $(window).height()
            -($('#factionsMenu').outerHeight(true)-$('#factionsMenuScrollWrapper').height())
            -10;
        },
        getExpectedHeight:function(){
            return $('#factionsMenuScrollContent').height();
        },
        name:'factionsMenuScroll',
        iScrollConfig:{
            vScrollbar:true
        }
    });
    
    var isShowing=false;
    function showMenu(){
        $('#factionsMenu').slideDown('fast',function(){
            menuScroll.updateScroll();
            isShowing=true;
        }); 
    }
    function hideMenu(callback){
        //        hideSectorialsMenu();
        $('#factionsMenu').slideUp('fast',callback);
        isShowing=false;
    }
    
    $('body').bind('click',function(){
        if(isShowing){
            hideMenu();
        }
    });
    $('#factionsMenu').bind('click',function(){
        return false; // do nothing, only intercept click
    });
    
    
    function buildMenu(){
        factionsMenu.empty();
        
        var factionsContainer=$('<div class="factions" />').appendTo(factionsMenu);
        $.each(factionNamesList,function(i,factionName){
            var faction=factionsByName[factionName];
            $('<div class="factionButton" />')
            //            .text(faction.displayName)
            .attr('title',faction.displayName)
            .prepend($('<img></img>').attr('src',utils.buildImagePath(faction.name,'logo')))
            .appendTo(factionsContainer)
            .append($('<div class="factionName" />').text(factionName).hide())
            .bind('click',function(){
                loadAndShowFaction(faction.name);
            });
            $.each(faction.sectorialsByName,function(sectorialName,sectorial){
                $('<div class="sectorialButton" />')
                //                .text(sectorial.displayName)
                .attr('title',sectorial.displayName)
                .prepend($('<img></img>').attr('src',utils.buildImagePath(sectorialName,'logo')))
                //                .prepend($('<img></img>').attr('src',utils.buildImagePath(faction.name,'logo')))
                .appendTo(factionsContainer)
                .bind('click',function(){
                    loadAndShowFaction(faction.name,sectorialName);
                    return false;
                });
            });    
            $('<div class="menuSeparator" />').appendTo(factionsContainer);
        });
        
        var mercFactions={},mercFactionsCount=0,factionsList=[];
        function loadMercCompany(){
            $.each(mercFactions,function(factionName){
                factionsList.push(factionName);
            })
            loadAndShowFaction('Mercenary Company',factionsList);
        }
        $('.factionButton',factionsContainer).last().unbind('click').bind('click',function(){
            if($(this).hasClass('selected')){
                if(mercFactionsCount>1){
                    loadMercCompany();
                }
            }else{
                $(this).addClass('selected');
                duplicateCurrentListButton.before($('<div />').text(messages.get('factionChooser.mercenaryMessage')));
                $('.sectorialButton',factionsContainer).hide();
                $('.factionName:contains(\'Combined Army\') , .factionName:contains(\'Tohaa\')').parent('.factionButton').hide();
                $('.factionButton',factionsContainer).not('.selected').unbind('click').bind('click',function(){
                    var factionName=$('.factionName',this).text();
                    if(!mercFactions[factionName]){
                        mercFactionsCount++;
                        mercFactions[factionName]=factionName;
                        $(this).addClass('selected');
                        if(mercFactionsCount==3){
                            loadMercCompany();
                        }
                    }
                });
            }
        });
         
        var duplicateCurrentListButton=$('<div class="menuButton" />')
        .text(' '+messages.get('menu.duplicateCurrentList'))
        .prepend($('<img></img>').attr('src','images/new_icon.png'))
        .bind('click',function(){
            armyList.newListId();
            armyList.saveList();
            hideMenu();            
        }).appendTo(factionsMenu); 
        var closeButton=$('<div class="menuButton" />')
        .text(' '+messages.get('common.close'))
        .prepend($('<img></img>').attr('src','images/delete_icon.png'))
        .bind('click',function(){
            hideMenu();
        }).appendTo(factionsMenu);     
        
        if(!units.factionName){ // se non abbiamo liste caricate, non possiamo duplicarle . . 
            duplicateCurrentListButton.hide();
        }
        
        showMenu();
    }
        
    function loadAndShowFaction(factionName,sectorialName){
        armyList.clear();
        units.clear();
        if(factionName=='Mercenary Company'){
            var factions=sectorialName;
            units.loadUnitsForMercenaryCompany(factions);
        }else{
            units.loadUnits(factionName,sectorialName);
        }
        armyList.saveList();
        hideMenu();
        $('#rootContainer').show();
    }	
	
    var factionsMenu=$('#factionsMenuScrollContent');
	  
    factions.showFactionChooser=function(){
        $('#rootContainer').show();
        factions.showFactionMenu();
    }

    factions.showFactionMenu=function(){
        buildMenu();
    };
	
})();
