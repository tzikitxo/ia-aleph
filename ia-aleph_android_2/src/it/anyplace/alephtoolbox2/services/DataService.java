package it.anyplace.alephtoolbox2.services;

import it.anyplace.alephtoolbox2.R;
import it.anyplace.alephtoolbox2.beans.UnitData;

import java.io.InputStreamReader;
import java.util.Collection;
import java.util.List;

import android.content.Context;

import com.google.common.base.Function;
import com.google.common.collect.Multimap;
import com.google.common.collect.Multimaps;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.google.inject.Inject;
import com.google.inject.Singleton;

@Singleton
public class DataService {

	@Inject
	private Gson gson;
	@Inject
	private Context context;

	private List<UnitData> allUnitDataList;
	private Multimap<String, UnitData> unitDataByFaction;

	// private Map<>

	@Inject
	private void loadData() {
		allUnitDataList = gson.fromJson(new InputStreamReader(context
				.getResources().openRawResource(R.raw.armylist_data)),
				new TypeToken<List<UnitData>>() {
				}.getType());
		unitDataByFaction=Multimaps.index(allUnitDataList, new Function<UnitData, String>() {

			@Override
			public String apply(UnitData unit) {
				return unit.getArmy();
			}
		});
	}
	
	public Collection<UnitData> getUnitDataByFaction(String faction){
		return unitDataByFaction.get(faction);
	}

}
