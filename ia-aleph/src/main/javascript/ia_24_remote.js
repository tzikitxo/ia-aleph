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

var remote=ia.remote=ia.remote||{};
(function(){
    
	log('loading 24: remote');
	
	var deviceIdConfigkey='remote.deviceId',deviceId=config.getOrInit(deviceIdConfigkey,function(){
		return utils.newId();
	});
	log('device id = ',deviceId);
	
	remote.setDeviceId=function(newId){
		return config.set(deviceIdConfigkey,deviceId=newId);
	};
	remote.getDeviceId=function(){
		return deviceId;
	};
		
	remote.storeData=function(key,data,success,error){
		log('uploading ',key,' : ',data);
		if(typeof data !== 'object' || !data){
			data={
				data:data
			};
		}
		if(!data.dateMod){
			data.dateMod=(new Date()).toISOString();
		}
		utils.ajax({
			type: 'POST',
			action:'storeData',
			data: {
				"deviceId":deviceId,
				"key": key,
				"data":JSON.stringify(data)
			},
			success: success,
			error: error
		});
	};
	
	
	remote.loadData=function(key,success,error){
		utils.ajax({
			action:'getData',
			data: {
				"deviceId":deviceId,
				"key": key
			},
			success: function(data){
				success(JSON.parse(data.data));
			},
			error: error
		});
	};
	
	remote.deleteData=function(key,success,error){
		remote.storeData(key,{
			deleted:true
		},success,error);
	};
	
	remote.listData=function(success,error){
		utils.ajax({
			action:'listData',
			data: {
				"deviceId":deviceId
			},
			success: function(data){
				success(data.data);
			},
			error: error
		});
	};
	
	remote.listDataWithPrefix=function(prefix,success,error){
		remote.listData(function(data){
			var res={},regexp=new RegExp('^'+prefix);
			$.each(data,function(key,value){
				if(key.match(regexp)){
					res[value.key=key.replace(regexp,'')]=value;
				}
			});
			log('filtered remote data with prefix ',prefix,' : ',res);
			success(res);
		},error);
	};
        
})();
