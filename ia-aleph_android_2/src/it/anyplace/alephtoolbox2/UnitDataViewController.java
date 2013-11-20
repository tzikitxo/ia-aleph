package it.anyplace.alephtoolbox2;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import it.anyplace.alephtoolbox2.beans.UnitData;
import it.anyplace.alephtoolbox2.services.DataService;
import android.app.Activity;
import android.content.Context;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.AdapterView.OnItemSelectedListener;
import android.widget.ArrayAdapter;
import android.widget.ListView;

import com.google.common.base.Function;
import com.google.common.base.Predicate;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.google.inject.Inject;
import com.google.inject.Singleton;

@Singleton
public class UnitDataViewController {
	final List<String> types = Arrays.asList("LI", "MI", "HI", "WB", "SK",
			"REM", "TAG");

	@Inject
	private DataService unitDataService;
	@Inject
	private Activity activity;

	private ListView unitListView, typeListView;

	@Inject
	private void init() {
		unitListView = (ListView) activity.findViewById(R.id.unitListView);
		typeListView = (ListView) activity.findViewById(R.id.typeListView);
		initTypeList();

		loadUnitList("Aleph");
	}

	private String typeFilter = types.get(0);

	private void initTypeList() {
		typeListView.setAdapter(new ArrayAdapter<String>(activity,
				android.R.layout.simple_list_item_1, types));
		typeListView.setOnItemClickListener(new OnItemClickListener() {

			@Override
			public void onItemClick(AdapterView<?> arg0, View arg1, int index,
					long arg3) {
				typeFilter = types.get(index);
				Log.i("UD", "filtering units by type = " + typeFilter);
				showAvailableUnits();
			}

			// @Override
			// public void onItemSelected(AdapterView<?> arg0, View arg1,
			// int index, long arg3) {
			// typeFilter = types.get(index);
			// Log.i("UD", "filtering units by type = " + typeFilter);
			// showAvailableUnits();
			// }
			//
			// @Override
			// public void onNothingSelected(AdapterView<?> arg0) {
			// // TODO Auto-generated method stub
			//
			// }

		});
	}

	private void showAvailableUnits() {

		List<UnitData> availableUnitsForType = Lists.newArrayList(Iterables
				.filter(allAvailableUnits, new Predicate<UnitData>() {

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

		Log.i("UD", "showAvailableUnits, availableUnitsForType = "
				+ availableUnitsForType.size());
		ArrayAdapter<String> adapter = new ArrayAdapter<String>(activity,
				android.R.layout.simple_list_item_1, Lists.transform(
						availableUnitsForType,
						new Function<UnitData, String>() {

							@Override
							public String apply(UnitData unit) {
								return unit.getIsc();
							}
						}));
		unitListView.setAdapter(adapter);
	}

	private Collection<UnitData> allAvailableUnits = Lists.newArrayList();

	private void loadUnitList(String factionName) {
		allAvailableUnits = unitDataService.getUnitDataByFaction(factionName);
		showAvailableUnits();

	}
}
