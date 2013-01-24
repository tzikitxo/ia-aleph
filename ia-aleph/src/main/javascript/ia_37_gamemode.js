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
    var currentGame;
    
    function clearCurrentGame(){
        currentGame={
            inactiveModelsByRecordId:{
                
        }
        };
    }
    clearCurrentGame();
        
    game.isEnabled=function(){
        return gameModeEnabled;
    };
        
    game.enableGameMode=function(){
        $('#rootContainer').addClass('gameMode');
        gameModeEnabled=true;
        utils.updateAllScroll();
        buildGameControlScreen();
    };
    game.disableGameMode=function(){
        $('#rootContainer').removeClass('gameMode');
        gameModeEnabled=false;
        utils.updateAllScroll();
        $('#gameModeContainer').empty();
    };
        
    var gameModeContainer=$('#gameModeContainer');
        
    function buildGameControlScreen(){
        gameModeContainer.empty()
        .append('<div class="listStatus" ><span class="remainingOrders" /><span class="remainingPoints" /><span class="lossPercentage" />%</div>');
        
        updateGameControlScreen();
    }
    
    function updateGameControlScreen(){
        var modelList=armylist.getListRecordsAsList();
        var remainingOrders=0,remainingPoints=0;
        $.each(modelList,function(x,listRecord){
            if(!currentGame.inactiveModelsByRecordId[listRecord.id]){
                remainingPoints+=listRecord.model.get('cost'); //todo check for baggage, shasvastii, etc
                remainingOrders+=listRecord.model.parent.isPseudoUnit?0:1; //todo better check
            }
        });
        var pointLoss=armylist.pointCount-remainingPoints, lossPercentage=pointLoss/armylist.pointCount*100;
        $('.remainingOrders',gameModeContainer).text(remainingOrders);
        $('.remainingPoints',gameModeContainer).text(remainingPoints);
        $('.lossPercentage',gameModeContainer).text(lossPercentage);
    }
    
})();