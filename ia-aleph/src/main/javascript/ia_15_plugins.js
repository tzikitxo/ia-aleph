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

var plugins=ia.plugins={};

(function(){
    
    var pluginsById=plugins.pluginsById={};
    var methodConfigurations={};
    
    plugins.registerPlugin=function(id,plugin){
        pluginsById[id]=plugin;
        $.each(plugin,function(name,value){
            if(typeof value == 'function'){
                addMethod(name);
            } 
        });
    };
    
    plugins.unregisterPlugin=function(id){
        delete pluginsById[id];
    };
    
    plugins.configureMethod=plugins.registerMethod=function(methodName,config){
        methodConfigurations[methodName]=config||{};
        delete plugins[methodName];
        addMethod(methodName);
    };
    
    function addMethod(methodName){
        if(plugins.methodName){
            return;
        }
        var methodConfig=methodConfigurations[methodName]||{};
        log('registering plugin method : ',methodName,' config : ',methodConfig);
        if(methodConfig.discardResult){
            plugins[methodName]=function(){
                var methodArgs=arguments;
                $.each(pluginsById,function(id,plugin){
                    if(plugin[methodName]){
                        plugin[methodName].apply(plugin,methodArgs);
                    }                    
                });
            };
        }if(methodConfig.chain){
            var chainIndex=methodConfig.chainIndex||0;
            plugins[methodName]=function(){
                var res=undefined,methodArgs=arguments;
                $.each(pluginsById,function(id,plugin){
                    if(plugin[methodName]){
                        var thisRes=plugin[methodName].apply(plugin,methodArgs);
                        res=thisRes;
                        methodArgs[chainIndex]=thisRes;
                    }
                });
                return res;
            };            
        }else{
            plugins[methodName]=function(){
                var res=undefined,methodArgs=arguments;
                $.each(pluginsById,function(id,plugin){
                    if(plugin[methodName]){
                        var thisRes=plugin[methodName].apply(plugin,methodArgs);
                        if(res===undefined){
                            res=thisRes;
                        }else if(!isNaN(res) && !isNaN(thisRes)){
                            res=Number(res)+Number(thisRes);
                        }else {
                            if(!res.push){
                                res=[res];
                            }
                            res.push(thisRes);
                        }
                    }
                });
                return res;
            };
        }
    }
    
   
})();

plugins.configureMethod('onSizeOrLayoutChanged');
$(window).resize(function() {
    if(ia.isReady){
        plugins.onSizeOrLayoutChanged();
    }
})
