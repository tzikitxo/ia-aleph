package it.anyplace.alephtoolbox2.services;

import com.google.gson.Gson;
import com.google.inject.Inject;
import com.google.inject.Singleton;

import it.anyplace.alephtoolbox2.beans.ArmyList;

@Singleton
public class ArmylistService {
	
	@Inject
	private Gson gson;
	
	private final String armylistData="{'pcap':200,'faction':'Panoceania','includeMercs':false,'models':[{'isc':'Cutters','code':'Default','recordid':'26341055822558700'},{'isc':'Bagh-Mari','code':'Shotgun','recordid':'58486073673702776'},{'isc':'Lieutenant Stephen Rao','code':'Default','recordid':'71578364423476160'},{'isc':'Fusiliers','code':'Default','recordid':'15866463608108460'},{'isc':'Fusiliers','code':'Default','recordid':'94999620621092620'},{'isc':'Order Sergeants','code':'Spitfire','recordid':'64432820701040330'},{'isc':'Order Sergeants','code':'TO Sniper','recordid':'2207046304829418.8'}],'listId':'3542035631835460.5','id':'3542035631835460.5','listName':'','dateMod':'1384377643000','groupMarks':[],'combatGroupSize':10,'specop':null,'mercenaryFactions':null}";

	// test method
	public ArmyList getArmylist(){
		return parseArmyList(armylistData);
	}
	
	private ArmyList parseArmyList(String armyListGsonStr){
		ArmyList armyList=gson.fromJson(armyListGsonStr, ArmyList.class);
		//TODO validation
		return armyList;
	}
}
