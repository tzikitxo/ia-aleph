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

var config=storage=ia.config=ia.storage=utils.wrapStorage(localStorage);
var session=ia.session=utils.wrapStorage(sessionStorage);

(function(){
    
	var options={
		'units.modelSelectionMode':{
			mode:'toggleList',
			availableValues:['doubleClick','singleClick'],
			defaultValue:'doubleClick'
		},
		'armylist.touchAction':{
			mode:'toggleList',
			availableValues:['showInfo','showInfoAndChooser'],
			defaultValue:'showInfo'
		},
		'smallScreen.lastView':{
			mode:'toggleList',
			availableValues:['armylistMode','unitSelectionMode','unitDetailMode'],
			defaultValue:'armylistMode'
		},
		'main.viewMode':{
			mode:'toggleList',
			availableValues:['defaultViewMode','mobileViewMode'],
			defaultValue:'defaultViewMode'
		},
		'useCm':{
			mode:'boolean',
			defaultValue:false
		},
		'weapons.showWeapons':{
			mode:'boolean',
			defaultValue:true
		},
		'modelInfoContainer.shouldShow':{
			mode:'boolean',
			defaultValue:true
		},
		'units.smallScreen.showListAfterAdd':{
			mode:'boolean',
			defaultValue:true
		},
		'units.classicCostSwcPositioning':{
			mode:'boolean',
			defaultValue:false
		},
		'main.biggerButtons':{
			mode:'boolean',
			defaultValue:false
		},
		'game.gameModeEnabled':{
			mode:'boolean',
			defaultValue:false
		},
		'main.theme':{
			mode:'toggleList',
			availableValues:['default_default','default_big','white_default','white_big'],
			defaultValue:'default_default'
		}
	};
	
	config.toggle=function(optionName){
		var option=options[optionName],value=this.get(optionName),newValue;
		if(option.mode=='toggleList'){
			var index=$.inArray(value,option.availableValues);
			var nextIndex=(index+1)%option.availableValues.length;
			newValue=option.availableValues[nextIndex];
		}else if(option.mode=='boolean'){
			newValue=!value;
		}
		this.set(optionName,newValue);
		return newValue;
	};
	config.getDirect=config.get;
	config.get=function(optionName){
		var rawValue=this.getDirect(optionName),option=options[optionName];
                if(option && option.mode=='toggleList' && $.inArray(rawValue,option.availableValues)<0){
                    rawValue=null;
                }
		if(option && (rawValue===null || rawValue===undefined) && option.defaultValue){
			return option.defaultValue;
		}else{
			return rawValue;
		}
	};
	
})();

