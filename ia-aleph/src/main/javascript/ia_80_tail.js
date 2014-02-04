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

};

$(function(){

    if(ia.device.hasCordova()){
        document.addEventListener("deviceready", function(){
            ia.startupFunction();
        },false);
    }else{
        ia.startupFunction();
    }
});

//for ios intent
function handleOpenURL(intentUrl) {
    ia.device.iosIntentUrl=intentUrl;
    if(ia.isReady && intentUrl){
        ia.utils.log('intentUrl = ',intentUrl);
        var listStr=intentUrl.replace(/^[^:]*[:]/,'');
        ia.utils.log('listStr = ',listStr);
        if(listStr){
            ia.armylist.loadListStr(listStr);
        }
    }
}