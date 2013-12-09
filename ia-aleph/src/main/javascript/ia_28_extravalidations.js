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


(function(){
    
    log('loading 28: extra validations');
    
    var extraValidations=[function(){
        if(units.factionName==="Panoceania"){
            if(units.sectorialName==="Military Order"){
                var errorMessage1='you can have at most one Primary Knight Order with AVA 4', errorMessage2='you can have at most two Confrere Knights';
                //       if($.inArray(errorMessage1, armyList.warnings)==-1 && $.inArray(errorMessage2, armyList.warnings) ==-1 ){
                log('testing knights ava');
                var knights=['Knights Hospitaller','Knights of Montesa','Knights Of Santiago','Knights of the Holy Sepulchre','Teutonic Knights'];
                var count={};                
                $.each(knights,function(index,knight){
                    if(armyList.listRecordsByIsc[knight]){
                        count[knight]=armyList.listRecordsByIsc[knight];
                    }else{
                        count[knight]=[];
                    }
                });
                log('counted knights: ',count);
                var aboveTwo=0,aboveOne=0,otherKnights=0;
                var aboveTwoRecords=[],otherKnightsRecords=[];
                $.each(knights,function(index,knight){
                    if(count[knight].length>2){
                        aboveTwo++;
                        aboveTwoRecords=aboveTwoRecords.concat(count[knight]);
                    }else if(count[knight].length>0){
                        if(count[knight].length>1){
                            aboveOne++;
                        }
                        otherKnights+=count[knight].length;
                        otherKnightsRecords=otherKnightsRecords.concat(count[knight]);
                    }
                });
                if(aboveTwo>1){
                    armyList.warnings.push(errorMessage1);
                    armyList.addWarning(aboveTwoRecords);
                }else if(aboveTwo==0){
                    otherKnights-=aboveOne?2:1;
                }
                if(otherKnights>2){
                    this.warnings.push(errorMessage2);
                    armyList.addWarning(otherKnightsRecords);
                }
            //    }
            }else if(units.sectorialName!="Shock Army of Acontecimento"){
                var errorMesssage='you can have at most one Knight of Order';
                //   if($.inArray(errorMesssage, armyList.warnings)==-1){
                log('testing knights ava');
                var knights=['Magister Knights','Knights of Montesa','Knights Of Santiago','Knights of the Holy Sepulchre','Teutonic Knights'];
                var count=[];
                $.each(knights,function(index,knight){
                    if(armyList.listRecordsByIsc[knight]){
                        count=count.concat(armyList.listRecordsByIsc[knight]);
                    }
                });
                log('got knights: ',count);
                if(count.length>1){
                    armyList.warnings.push(errorMesssage);
                    armyList.addWarning(count);
                }
            //       }
                
               
            }
        }            
    },function(){
        if(units.factionName==="Ariadna" && armyList.unitsByIsc['Traktor Mul, Artillery and Support Regiment']){
            log('testing traktor control');
            var ok=false;
            $.each(armyList.listRecordsById,function(index,listRecord){
                if(listRecord.model.spec['Traktor Mul Control Device']){
                    ok=true;
                    return false;
                }
            });
            if(!ok){
                this.warnings.push('missing Traktor Mul Control Device');
                armyList.addWarning(armyList.listRecordsByIsc['Traktor Mul, Artillery and Support Regiment']);
            }
        }        
    },function(){
        if(units.factionName==="Aleph"){
            log('testing proxy');
            var proxy=["Posthumans Proxy Mk.1","Posthumans Proxy Mk.2","Posthumans Proxy Mk.3"];
            var proxies=[];
            $.each(proxy,function(i,proxy){
                if(armyList.listRecordsByIsc[proxy]){
                    proxies=proxies.concat(armyList.listRecordsByIsc[proxy]);
                }
            });
            if(proxies.length==1){
                armyList.warnings.push('the minimum number of Posthuman Proxies is 2');
                armyList.addWarning(proxies);
            }
        }        
    }];
    
    var applyExtraValidations=function(armylist){
        $.each(extraValidations,function(i,fun){
            fun.call(armylist);
        });
    };
    
    var postLoadProcessing=function(){
	
        if(units.sectorialName==='Morat Aggression Force'){
            units.unitsByIsc['Yaogat Strike Infantry'].childsByCode['Lieutenant'].swc='0';
            units.unitsByIsc['Kornak Gazarot'].childsByCode['Lt'].swc='0';
        }
        if(units.sectorialName==='Shavastii Expeditionary Force'){
            units.unitsByIsc['Shasvastii Aswuangs'].childsByCode['Lieutenant'].swc='0';
            units.unitsByIsc['Shasvastii Gwailos'].childsByCode['Lieutenant'].swc='0';
            units.unitsByIsc['Shasvastii Gwailos'].childsByCode['Shotgun Lt'].swc='0';
            units.unitsByIsc['Cadmus-Naish Agent Sheskiin'].childsByCode['Lieutenant'].swc='0';
        }
        if(units.sectorialName==='Caledonian Highlander Army'){
            units.unitsByIsc['Caledonian Volunteers'].childsByCode['Lieutenant'].swc='0';
        }
        if(units.sectorialName==='Bakunin Jurisdictional Commando'){
            units.unitsByIsc['Moderators from Bakunin'].childsByCode['Lieutenant'].swc='0.5';
        }
        if(units.sectorialName==='Shock Army of Acontecimento'){
            units.unitsByIsc['Acontecimento Regulars'].childsByCode['Lieutenant'].swc='0';
        }
        if(units.factionName==='Panoceania' && units.sectorialName!=='Shock Army of Acontecimento' && units.unitsByIsc['Bagh-Mari']){
            delete units.unitsByIsc['Bagh-Mari'].childsByCode['HMG Lt'];
        }
        if(units.sectorialName==='Military Order'){
            units.unitsByIsc['Order Sergeants'].childsByCode['Auxbot'].swc='0';
            units.unitsByIsc['Order Sergeants'].childsByCode['Hacker'].swc='0.5';
            units.unitsByIsc['Order Sergeants'].childsByCode['MSV2 Spitfire'].swc='1.5';
            units.unitsByIsc['Order Sergeants'].childsByCode['TO Infiltrator'].swc='0';
            units.unitsByIsc['Order Sergeants'].childsByCode['TO Sniper'].swc='1.5';            
        // TODO fix this
        //        units.unitsByIsc['Trauma-Doc'].displayName=units.unitsByIsc['Trauma-Doc'].displayIsc=units.unitsByIsc['Trauma-Doc']['display_cache_isc']='Father-Doctor';
        //        units.unitsByIsc['Machinist'].displayName=units.unitsByIsc['Machinist'].displayIsc=units.unitsByIsc['Machinist']['display_cache_isc']='Father-Engineer';
        }
        if(units.sectorialName==='Merovingian Rapid Response Army'){
            units.unitsByIsc['Metros'].childsByCode['Lieutenant'].swc='0';
            units.unitsByIsc['Alguaciles'].childsByCode={
                'Hacker':units.unitsByIsc['Alguaciles'].childsByCode['Hacker']
            };
        }
        if(units.factionName==='Yu Jing' && units.sectorialName!='Japanese Sectorial Army' && units.unitsByIsc['Kempeitai']){
            delete units.unitsByIsc['Kempeitai'].childsByCode['Chain Comm + Shotgun'];
            delete units.unitsByIsc['Kempeitai'].childsByCode['Chain Comm'];
        }
        if(units.factionName==='Yu Jing' && units.sectorialName!='Japanese Sectorial Army' && units.unitsByIsc['Aragoto Senkenbutai']){
            delete units.unitsByIsc['Aragoto Senkenbutai'].childsByCode['Lieutenant'];
        }
        if(units.factionName==='Yu Jing' && units.sectorialName!='Japanese Sectorial Army' && units.unitsByIsc['Asuka Kisaragi']){
            delete units.unitsByIsc['Asuka Kisaragi'].childsByCode['Lt'];
        }
        if(units.factionName==='Yu Jing' && units.sectorialName!='Japanese Sectorial Army' && units.unitsByIsc['Domaru Butai']){
            delete units.unitsByIsc['Domaru Butai'].childsByCode['Lieutenant'];
        }
        if(units.factionName==='Yu Jing' && units.sectorialName!='Japanese Sectorial Army' && units.unitsByIsc['Domaru Takeshi \"Neko\" Oyama']){
            delete units.unitsByIsc['Domaru Takeshi \"Neko\" Oyama'].childsByCode['Lieutenant'];
        }
        if(units.factionName==='Yu Jing' && units.sectorialName!='Japanese Sectorial Army' && units.unitsByIsc['Oniwaban']){
            delete units.unitsByIsc['Oniwaban'].childsByCode['Lieutenant'];
        }
        if(units.factionName==='Yu Jing' && units.sectorialName!='Japanese Sectorial Army' && units.unitsByIsc['Oniwaban Shinobu Kitsune']){
            delete units.unitsByIsc['Oniwaban Shinobu Kitsune'].childsByCode['Lieutenant'];
        }
        if(units.factionName==='Yu Jing' && units.sectorialName!='Japanese Sectorial Army' && units.unitsByIsc['O-Yoroi Kidobutai']){
            delete units.unitsByIsc['O-Yoroi Kidobutai'].childsByCode['Lieutenant'];
        }
        if(units.factionName==='Ariadna' && units.sectorialName!='Caledonian Highlander Army' && units.unitsByIsc['William Wallace']){
            delete units.unitsByIsc['William Wallace'].childsByCode['Lieutenant'];
        }
    };

    plugins.registerPlugin('armylistExtras',{
        armylistPostLoadProcess: postLoadProcessing,
        armylistValidate:applyExtraValidations
    });

})();

