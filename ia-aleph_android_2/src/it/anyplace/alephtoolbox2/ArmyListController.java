package it.anyplace.alephtoolbox2;

import it.anyplace.alephtoolbox2.services.ArmyListService;
import it.anyplace.alephtoolbox2.services.CurrentRosterService;
import it.anyplace.alephtoolbox2.services.CurrentRosterService.ArmyListLoadEvent;
import it.anyplace.alephtoolbox2.services.CurrentRosterService.ArmyListUpdateEvent;
import it.anyplace.alephtoolbox2.services.CurrentRosterService.UnitRecord;
import it.anyplace.alephtoolbox2.services.DataService;

import java.util.List;

import android.app.Activity;
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
	private CurrentRosterService currentListService;
	// @Inject
	// private UnitDetailController unitDetailController;
	@Inject
	private DataService dataService;

	private ListView mainRosterList;
	private TextView currentRosterInfo;
	@Inject
	private ViewFlipperController viewFlipperController;

	public interface ArmyListUnitSelectedEvent {
		public UnitRecord getUnitRecord();
	}

	@Inject
	private void init() {
		mainRosterList = (ListView) activity.findViewById(R.id.mainRosterList);
		currentRosterInfo = (TextView) activity
				.findViewById(R.id.currentRosterInfo);
		eventBus.register(this);

		mainRosterList.setOnItemClickListener(new OnItemClickListener() {

			@Override
			public void onItemClick(AdapterView<?> adapterView, View arg1,
					int index, long arg3) {
				final UnitRecord unitRecord = currentListService
						.getUnitRecords().get(index);
				// unitDetailController.openUnitDetail(unitRecord.getUnitData());
				eventBus.post(new ArmyListUnitSelectedEvent() {

					@Override
					public UnitRecord getUnitRecord() {
						return unitRecord;
					}
				});
			}
		});
	}

	@Subscribe
	public void handleArmyListLoadEvent(ArmyListLoadEvent event) {
		loadArmylist();
	}

	@Subscribe
	public void handleArmyListUpdateEvent(ArmyListUpdateEvent event) {
		loadArmylist();
//		viewFlipperController.showArmyListView();
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

				// UnitData unitData = dataService.getUnitDataByIscCode(
				// unitRecord.getIsc(), unitRecord.getCode());

				((TextView) convertView.findViewById(R.id.armyListRecordCost))
						.setText(unitRecord.getUnitData().getCost());
				((TextView) convertView.findViewById(R.id.armyListRecordSwc))
						.setText(unitRecord.getUnitData().getSwc());

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

		updateRosterInfo();
		// for(ArmyListUnit model:armylist.getModels()){
		// mainRosterList
		// }

	}

	private void updateRosterInfo() {
		currentRosterInfo.setText("points: "
				+ currentListService.getPointTotal() + "/"
				+ currentListService.getPointCap() + " ("
				+ currentListService.getPointLeft() + ")" + " swc: "
				+ currentListService.getSwcTotal() + "/"
				+ currentListService.getSwcCap() + " ("
				+ currentListService.getSwcLeft() + ")");
	}
}
