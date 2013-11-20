package it.anyplace.alephtoolbox2;

import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

import it.anyplace.alephtoolbox2.beans.UnitData;
import it.anyplace.alephtoolbox2.services.DataService;
import android.app.Activity;
import android.content.Context;
import android.view.View;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
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
	final List<String> types = Arrays.asList("FL", "FM", "FP", "WB", "SK",
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
	
	private String typeFilter=types.get(0);

	private void initTypeList() {
		typeListView.setAdapter(new ArrayAdapter<String>(activity,
				android.R.layout.simple_list_item_1, types));
		typeListView.setOnItemClickListener(new OnItemClickListener() {

			@Override
			public void onItemClick(AdapterView<?> arg0, View arg1, int index,
					long arg3) {
				typeFilter=types.get(index);
				showAvailableUnits();
			}

		});
	}
	
	private void showAvailableUnits(){
		
		List<UnitData> availableUnits=Lists.newArrayList(Iterables.filter(unitData, new Predicate<UnitData>(){

			@Override
			public boolean apply(UnitData unitData) {
				return unitData.getType().equals(typeFilter);
			}}));
		
		ArrayAdapter adapter = new ArrayAdapter<String>(activity,
				android.R.layout.simple_list_item_1, Lists.transform(
						availableUnits,
						new Function<UnitData, String>() {

							@Override
							public String apply(UnitData unit) {
								return unit.getIsc();
							}
						}));
		unitListView.setAdapter(adapter);
	}
	
	private Collection<UnitData> unitData=Lists.newArrayList();

	private void loadUnitList(String factionName) {
		Collection<UnitData> unitDataList = unitDataService.getUnitDataByFaction(factionName);
		showAvailableUnits();		
		
	}
}
