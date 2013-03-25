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
	
	var deviceId=remote.deviceId=config.getOrInit('remote.deviceId',function(){ return utils.newId(); });
	log('device id = ',remote.deviceId);
	
	//var enabled=true
	var locked=false,uploadQueue={};
	
	function processUploadQueue(){
		var key=null,value=null;
		$.each(uploadQueue,function(akey,avalue){
			key=akey;
			value=avalue;
			return false;
		});
		if(key===null){ //no more data to sed
			locked=false;
			return;
		}else{
			delete uploadQueue[key];
			uploadData(key,value,function(){
				processUploadQueue();
			});
		}
	}
	function uploadData(key,data,callback){
		log('uploading ',key);
		utils.ajax({
			type: 'POST',
			action:'storeData',
			data: {
				"deviceId":deviceId,
				"key": key,
				"data":data
			},
			success: function(data){
				callback();
			},
			error: function(){
				callback();
			}
		});
	}
	
	
	remote.storeData=function(key,data){
		uploadQueue[key]=data;
		if(!locked){
			locked=true;
			processUploadQueue();
		}
	};
	
	
	remote.loadData=function(key,success,error){
		utils.ajax({
			action:'getData',
			data: {
				"deviceId":deviceId,
				"key": key
			},
			success: function(data){
				success(data.data);
			},
			error: error
		});
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
        
})();
