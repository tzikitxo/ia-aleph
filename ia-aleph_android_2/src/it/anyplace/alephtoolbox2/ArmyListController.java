package it.anyplace.alephtoolbox2;

import it.anyplace.alephtoolbox2.beans.Events;
import it.anyplace.alephtoolbox2.services.ArmyListService;
import it.anyplace.alephtoolbox2.services.ArmyListService.ArmyList.ArmyListUnit;
import it.anyplace.alephtoolbox2.services.CurrentListService;
import it.anyplace.alephtoolbox2.services.CurrentListService.UnitRecord;

import java.util.List;

import android.app.Activity;
import android.widget.ArrayAdapter;
import android.widget.ListView;

import com.google.common.base.Function;
import com.google.common.collect.Lists;
import com.google.common.eventbus.EventBus;
import com.google.common.eventbus.Subscribe;
import com.google.inject.Inject;
import com.google.inject.Singleton;

@Singleton
public class ArmyListController {

	@Inject
	private Activity activity;

	@Inject
	private EventBus eventBus;
	@Inject
	private ArmyListService armylistService;
	@Inject
	private CurrentListService currentListService;
	@Inject
	private UnitDetailController unitDetailController;
	

	private ListView mainRosterList;
	
	@Inject
	private void init(){
		mainRosterList = (ListView) activity.findViewById(R.id.mainRosterList);		
		eventBus.register(this);
	}
	

	@Subscribe
	public void updateArmylist(Events.ArmyListLoadEvent event) {
		loadArmylist();
	}
	
	private void loadArmylist() {
//		reset();
		List<UnitRecord> unitRecords = currentListService.getUnitRecords();
		ArrayAdapter<String> adapter = new ArrayAdapter<String>(activity,
				android.R.layout.simple_list_item_1, Lists.transform(
						unitRecords,
						new Function<UnitRecord, String>() {

							@Override
							public String apply(UnitRecord model) {
								return model.getIsc();
							}
						}));
		mainRosterList.setAdapter(adapter);
		// for(ArmyListUnit model:armylist.getModels()){
		// mainRosterList
		// }

	}
}
