package it.anyplace.alephtoolbox2;

import it.anyplace.alephtoolbox2.beans.Events;
import it.anyplace.alephtoolbox2.services.CurrentListService;
import it.anyplace.alephtoolbox2.services.DataService;
import it.anyplace.alephtoolbox2.services.DataService.UnitData;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
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

import com.google.common.base.Predicate;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.google.common.eventbus.EventBus;
import com.google.common.eventbus.Subscribe;
import com.google.inject.Inject;
import com.google.inject.Singleton;

@Singleton
public class AvailableUnitsController {
	final List<String> types = Arrays.asList("LI", "MI", "HI", "WB", "SK",
			"REM", "TAG");

	@Inject
	private DataService unitDataService;
	@Inject
	private CurrentListService sessionService;
	@Inject
	private Activity activity;
	@Inject
	private UnitDetailController unitDetailController;

	@Inject
	private EventBus eventBus;

	private ListView unitListView, typeListView;

	@Inject
	private void init() {
		unitListView = (ListView) activity.findViewById(R.id.unitListView);
		typeListView = (ListView) activity.findViewById(R.id.typeListView);

		typeListView.setAdapter(new ArrayAdapter<String>(activity,
				android.R.layout.simple_list_item_1, types));
		typeListView.setOnItemClickListener(new OnItemClickListener() {

			@Override
			public void onItemClick(AdapterView<?> arg0, View arg1, int index,
					long arg3) {
				typeFilter = types.get(index);
				Log.i("AvailableUnitsController", "filtering units by type = "
						+ typeFilter);
				showAvailableUnits();
			}
		});
		unitListView.setOnItemClickListener(new OnItemClickListener() {

			@Override
			public void onItemClick(AdapterView<?> adapterView, View arg1,
					int index, long arg3) {
				UnitData selectedUnit = availableUnitsForType.get(index);
				// String
				// isc=((ArrayAdapter<String>)adapterView).getItem(index);
				// typeFilter = types.get(index);
				Log.i("AvailableUnitsController", "selected unit = "
						+ selectedUnit.getIsc());
				unitDetailController.openUnitDetail(selectedUnit
						.getDefaultChild());
			}
		});

		eventBus.register(this);
	}

	private String typeFilter = types.get(0);

	@Subscribe
	public void loadFaction(Events.FactionLoadEvent event) {
		loadAllAvailableUnits();
	}

	private List<UnitData> availableUnitsForType;

	private void showAvailableUnits() {
		availableUnitsForType = Lists.newArrayList(Iterables.filter(
				allAvailableUnits, new Predicate<UnitData>() {

					@Override
					public boolean apply(UnitData unitData) {
						return unitData.getType().equals(typeFilter);
					}
				}));
		Collections.sort(availableUnitsForType, new Comparator<UnitData>() {

			@Override
			public int compare(UnitData a, UnitData b) {
				return a.getMinCost().compareTo(b.getMinCost());
			}
		});

		Log.i("AvailableUnitsController",
				"showAvailableUnits, availableUnitsForType = "
						+ availableUnitsForType.size());
		ArrayAdapter<UnitData> adapter = new ArrayAdapter<UnitData>(activity,
				R.layout.availableunits_record, availableUnitsForType) {

			@Override
			public View getView(int position, View convertView, ViewGroup parent) {
				if (convertView == null) {
					convertView = LayoutInflater.from(activity).inflate(
							R.layout.availableunits_record, null);
				}
				UnitData unitData = getItem(position);
				((TextView) convertView.findViewById(R.id.unitListRecordIsc))
						.setText(unitData.getIsc());

				((ImageView) convertView.findViewById(R.id.unitListRecordIcon))
						.setImageResource(activity.getResources()
								.getIdentifier(
										"unitlogo_" + unitData.getCleanIsc(),
										"drawable", activity.getPackageName()));
				return convertView;
			}

		};
		unitListView.setAdapter(adapter);
	}

	private Collection<UnitData> allAvailableUnits = Lists.newArrayList();

	private void loadAllAvailableUnits() {
		allAvailableUnits = unitDataService.getAvailableUnitData();
		showAvailableUnits();
	}

}
