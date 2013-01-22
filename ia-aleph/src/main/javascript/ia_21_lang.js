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

var messages=ia.messages=ia.messages||{};
var names=ia.names=ia.names||{};

(function(){
    
    // TODO optimize with preventive lang loading
    
    var defaultLang='en';
    var currentLang=null;
    
    messages.setLang=function(lang){
        config.set('lang',currentLang=lang);
    }
    messages.getDefaultLang=function(){
        return defaultLang;
    }
    messages.getLang=function(){
        var browserLang= window.navigator.userLanguage || window.navigator.language, configLang=config.get('lang');
        if(configLang && messages[configLang]){
            currentLang=configLang;
        }else if(browserLang && messages[browserLang]){
            currentLang=browserLang;
        }else{
            currentLang=defaultLang;
        }
        // shortcut loading
        messages.getLang=function(){
            return currentLang;
        }
        return currentLang;
    }
        
    messages.get=function(name){
        var lang=messages.getLang();
        if(lang&&messages[lang]&&messages[lang][name]){
            return messages[lang][name];
        }else{
            return messages[defaultLang][name]||'';
        }
    }
	
    $.each(names,function(lang,namesForLang){
        namesForLang.codename=$.extend({},namesForLang.spec,namesForLang.codename);
    });
    
    function getNames(item,name){
        if(name.join){ //if is list            
            var res=[],list=name,shouldSort=true;
            if(item=='bsw'||item=='ccw'){
                shouldSort=false;
                list=list.slice(0);
                list.sort(weapons.weaponSortFunction);
            }
            $.each(list,function(i,val){
                res.push(names.get(item,val));
            });
            if(shouldSort){
                res.sort();
            }
            return res.join(', ');
        }else{
            var lang=messages.getLang();
            if(lang&&names[lang]&&names[lang][item]&&names[lang][item][name]){
                return names[lang][item][name];
            }else if(lang!=defaultLang&&names[defaultLang]&&names[defaultLang][item]&&names[defaultLang][item][name]){
                return names[defaultLang][item][name];
            }else{
                return name;
            }
        }
    }

    var namesCache=names.namesCache={};
    names.get=function(item,name){
        return namesCache[item+'_ncache_'+name] || (namesCache[item+'_ncache_'+name]=getNames(item,name));        
    }
    
    messages.availableLocales=messages.availableLocales||[];
    
    var inchesToCm={
        "4-4":"10-10",
        "6-6":"15-15",
        "4-2":"10-5",
        "6-2":"15-5",
        "6-4":"15-10",
        "8-6":"20-15",
        "-":"-",
        "0":"0",
        "":""
    };
    var getCmFromInches=function(inches){
        var cm=inchesToCm[inches];
        if(cm!==undefined){
            return cm;
        }else{
            log('missing translation from inches : ',inches,' to cm');
            return inches+'i';
        }
    };
    names.createCmAttrForMov=function(root){
        $('.movAttr',root).each(function(){
            var attr=$(this);
            attr.clone().text(getCmFromInches(attr.text())).addClass('rangeCm').insertAfter(attr);
            attr.addClass('rangeIn');
        });
    };
    
}());
	 