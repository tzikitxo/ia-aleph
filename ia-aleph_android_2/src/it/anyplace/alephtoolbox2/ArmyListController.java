package it.anyplace.alephtoolbox2;

import it.anyplace.alephtoolbox2.beans.Events;
import it.anyplace.alephtoolbox2.services.ArmyListService;
import it.anyplace.alephtoolbox2.services.CurrentListService;
import it.anyplace.alephtoolbox2.services.CurrentListService.UnitRecord;
import it.anyplace.alephtoolbox2.services.DataService.UnitData;

import java.util.List;

import android.app.Activity;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;

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
	private void init() {
		mainRosterList = (ListView) activity.findViewById(R.id.mainRosterList);
		eventBus.register(this);

		mainRosterList.setOnItemClickListener(new OnItemClickListener() {

			@Override
			public void onItemClick(AdapterView<?> adapterView, View arg1,
					int index, long arg3) {
				UnitRecord unitRecord = currentListService.getUnitRecords()
						.get(index);
				unitDetailController.openUnitDetail(unitRecord.getUnitData());
			}
		});
	}

	@Subscribe
	public void updateArmylist(Events.ArmyListLoadEvent event) {
		loadArmylist();
	}

	private void loadArmylist() {
		// reset();
		List<UnitRecord> unitRecords = currentListService.getUnitRecords();
		// ArrayAdapter<String> adapter = new ArrayAdapter<String>(activity,
		// android.R.layout.simple_list_item_1, Lists.transform(
		// unitRecords,
		// new Function<UnitRecord, String>() {
		//
		// @Override
		// public String apply(UnitRecord model) {
		// return model.getIsc();
		// }
		// }));
		ArrayAdapter<UnitRecord> adapter = new ArrayAdapter<UnitRecord>(
				activity, R.layout.armylist_record, unitRecords) {

			@Override
			public View getView(int position, View convertView, ViewGroup parent) {
				if (convertView == null) {
					convertView = LayoutInflater.from(activity).inflate(
							R.layout.armylist_record, null);
				}
				UnitRecord unitRecord = getItem(position);
				((TextView) convertView.findViewById(R.id.armyListRecordIsc))
						.setText(unitRecord.getIsc());
				((TextView) convertView.findViewById(R.id.armyListRecordCode))
						.setText(unitRecord.getCode());

				((ImageView) convertView.findViewById(R.id.armyListRecordIcon))
						.setImageResource(activity.getResources()
								.getIdentifier(
										"unitlogo_"
												+ unitRecord.getUnitData()
														.getCleanIsc(),
										"drawable", activity.getPackageName()));
				return convertView;
			}

		};
		mainRosterList.setAdapter(adapter);
		// for(ArmyListUnit model:armylist.getModels()){
		// mainRosterList
		// }

	}
}
