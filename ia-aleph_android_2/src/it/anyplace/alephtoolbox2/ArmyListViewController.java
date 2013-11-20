package it.anyplace.alephtoolbox2;

import it.anyplace.alephtoolbox2.beans.ArmyList;
import it.anyplace.alephtoolbox2.beans.ArmyList.ArmyListUnit;
import it.anyplace.alephtoolbox2.services.ArmylistService;
import android.app.Activity;
import android.widget.ArrayAdapter;
import android.widget.ListView;

import com.google.common.base.Function;
import com.google.common.collect.Lists;
import com.google.inject.Inject;
import com.google.inject.Singleton;

@Singleton
public class ArmyListViewController {

	@Inject
	private Activity activity;

	@Inject
	private ArmylistService armylistService;
	

	private ListView mainRosterList;
	
	@Inject
	private void init(){
		mainRosterList = (ListView) activity.findViewById(R.id.mainRosterList);
		
		loadArmylist();
	}
	
	private void loadArmylist() {
//		reset();
		ArmyList armylist = armylistService.getArmylist();
		ArrayAdapter<String> adapter = new ArrayAdapter<String>(activity,
				android.R.layout.simple_list_item_1, Lists.transform(
						armylist.getModels(),
						new Function<ArmyListUnit, String>() {

							@Override
							public String apply(ArmyListUnit model) {
								return model.getIsc();
							}
						}));
		mainRosterList.setAdapter(adapter);
		// for(ArmyListUnit model:armylist.getModels()){
		// mainRosterList
		// }

	}
}
