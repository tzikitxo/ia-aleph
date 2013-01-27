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

var game=ia.game={};

(function(){
    
	var gameModeEnabled=false;
	var currentGame=storage.unpack('game.gameModeStatus')||clearCurrentGame();
    
	function clearCurrentGame(){
		currentGame={
			inactiveModelsByRecordId:{
                
			},
			gamePhoto:'images/default_game_photo.jpg'
		};
		return currentGame;
	}
	//    clearCurrentGame();
        
	game.isEnabled=game.isGameModeEnabled=function(){
		return gameModeEnabled;
	};
        
	game.enableGameMode=function(){
		$('#rootContainer').addClass('gameMode');
		gameModeEnabled=true;
		config.set('game.gameModeEnabled',true);
		plugins.onSizeOrLayoutChanged();
		buildGameControlScreen();
	};
	game.disableGameMode=function(){
		$('#rootContainer').removeClass('gameMode');
		clearCurrentGame();
		updateGameControlScreen();
		gameModeEnabled=false;
		config.set('game.gameModeEnabled',false);
		plugins.onSizeOrLayoutChanged();
	};
    
	plugins.registerPlugin('gameModeAppLoadingPlugin',{
		afterAppLoading:function(){
			if(config.get('game.gameModeEnabled')){
				game.enableGameMode();
			}
		}
	});
    
        
	var gameModeContainer=$('#gameModeContainer');
	$('.remainingOrders',gameModeContainer).before(messages.get('game.remainingOrders'));
	$('.remainingPoints',gameModeContainer).before(messages.get('game.remainingPoints'));
	$('.lossPercentage',gameModeContainer).before(messages.get('game.lossPercentage'));
        
	function buildGameControlScreen(){
		//        gameModeContainer.empty()
		//        .append('<div class="listStatus" ><span class="remainingOrders" /><span class="remainingPoints" /><span class="lossPercentage" />%</div>');
		$('#gamePhoto').attr('src',currentGame.gamePhoto);
		updateGameControlScreen();
	}
    
	function updateGameControlScreen(){
		var warningsContainer=$('.warnings',gameModeContainer).empty();
		var modelList=armylist.getListRecordsAsList();
		var remainingOrders=0,remainingPoints=0;
		$.each(modelList,function(x,listRecord){
			if(!currentGame.inactiveModelsByRecordId[listRecord.id]){
				remainingPoints+=Number(listRecord.model.get('cost'))||0; //todo check for baggage, shasvastii, etc
				remainingOrders+=listRecord.model.parent.isPseudoUnit?0:1; //todo better check
				listRecord.row.removeClass('deadModel');
			}else{
				listRecord.row.addClass('deadModel');
			}
		});
		var pointLoss=armylist.pointCount-remainingPoints, lossPercentage=pointLoss/armylist.pointCount*100;
		$('.remainingOrders',gameModeContainer).text(remainingOrders);
		$('.remainingPoints',gameModeContainer).text(remainingPoints+' / '+armylist.pointCount);
		$('.lossPercentage',gameModeContainer).text(Math.round(lossPercentage)+' %');
		if(lossPercentage>60){ //todo consider morat, religious
			$('<div class="warning"/>').text(messages.get('game.retreatWarning')).appendTo(warningsContainer);
		}
		storage.pack('game.gameModeStatus',currentGame);
		gamePhotoScroll.updateScroll();
	}
    
	var armyListControls=$('#armyListGameModeControls');
	$('<div class="armyListControlButton activeControlButton" />').attr('title',messages.get('game.buttons.active')).bind('click',function(){
		var record=armylist.getSelectedRecord();
		delete currentGame.inactiveModelsByRecordId[record.id];
		armyListControls.removeClass('inactiveModelSelected');  
		updateGameControlScreen();
	})
	.append($('<img class="armyListControlButtonIcon" />').attr('src','images/disabled_icon.png'))
	.appendTo(armyListControls);
	$('<div class="armyListControlButton inactiveControlButton" />').attr('title',messages.get('game.buttons.dead')).bind('click',function(){
		var record=armylist.getSelectedRecord();
		currentGame.inactiveModelsByRecordId[record.id]=record.id;
		armyListControls.addClass('inactiveModelSelected');
		updateGameControlScreen();
	})
	.append($('<img class="armyListControlButtonIcon" />').attr('src','images/enabled_icon.png'))
	.appendTo(armyListControls);
    
	plugins.registerPlugin('gameModeRecordSelectionPlugin',{
		armylistRecordSelected:function(record){
			if(currentGame.inactiveModelsByRecordId[record.id]){
				armyListControls.addClass('inactiveModelSelected');
			}else{
				armyListControls.removeClass('inactiveModelSelected');                
			}
		}
	});
	
	
	var gamePhotoScroll=utils.createScroll({
		getScrollWrapper:function(){
			return   $('#gamePhotoScrollWrapper');
		},
		getAvailableHeight:function(){
			//            return $(window).height()-$('#modelInfoContainer').outerHeight(true)-21;
			return $(window).height()-$('#topBar').outerHeight(true)-$('#listStatus').height()-20;
		//                -($('#armyList .listInfo').css('display')=="none"?0:$('#armyList .listInfo').outerHeight(true)+$('#armyList .warningsBar').outerHeight(true));
		},
		getExpectedHeight:function(){
			return $('#gamePhotoScrollContent img').height();
		},
		getAvailableWidth:function(){
			//            return $(window).height()-$('#modelInfoContainer').outerHeight(true)-21;
			return $(window).width()-25-$('#rightContainer').outerWidth(true);
		//                -($('#armyList .listInfo').css('display')=="none"?0:$('#armyList .listInfo').outerHeight(true)+$('#armyList .warningsBar').outerHeight(true));
		},
		getExpectedWidth:function(){
			return $('#gamePhotoScrollContent img').width();
		},
		name:'gamePhotoScroll',
		iScrollConfig:{
			lockDirection:false,
			hScroll:true,
			vScrollbar:true,
			hScrollbar:true
		}
	});
	plugins.registerPlugin('gamePhotoScroller',{
		onSizeOrLayoutChanged:function(){
			//            if(armylistScroll){
			gamePhotoScroll.updateScroll();
		//            }
		}
	});
    
})();