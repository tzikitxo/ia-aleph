package it.anyplace.alephtoolbox2.services;

import it.anyplace.alephtoolbox2.beans.Events;
import it.anyplace.alephtoolbox2.services.ArmyListService.ArmyList;
import it.anyplace.alephtoolbox2.services.ArmyListService.ArmyList.ArmyListUnit;
import it.anyplace.alephtoolbox2.services.DataService.UnitData;

import java.util.List;

import android.util.Log;

import com.google.common.base.Function;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.google.common.eventbus.EventBus;
import com.google.inject.Inject;
import com.google.inject.Singleton;

@Singleton
public class CurrentListService {
	@Inject
	private EventBus eventBus;
	@Inject
	private DataService dataService;

	private String currentFaction, currentSectorial;

	private Integer pointCap;
	private Boolean includeMercenaryUnits;

	private List<UnitRecord> unitRecords;

	// private ArmyList armyList;

	@Inject
	private void init() {
		eventBus.register(this);
	}

	// @Subscribe
	// public void loadFaction(LoadFactionEvent loadFactionEvent){
	//
	// }

	public void loadArmyList(ArmyList armyList) {
		this.pointCap = armyList.getPcap();
		this.includeMercenaryUnits = armyList.getIncludeMercs();
		loadFaction(armyList.getFaction(), armyList.getSectorial(),
				armyList.getIncludeMercs());
		unitRecords = Lists.newArrayList(Iterables.transform(
				armyList.getModels(), new Function<ArmyListUnit, UnitRecord>() {

					@Override
					public UnitRecord apply(ArmyListUnit armyListUnit) {

						return new UnitRecord(armyListUnit.getIsc(),
								armyListUnit.getCode(), armyListUnit
										.getRecordid(), dataService
										.getUnitDataByIscCode(
												armyListUnit.getIsc(),
												armyListUnit.getCode()));
					}
				}));

		eventBus.post(Events.ArmyListLoadEvent.INSTANCE);
	}

	public void loadFaction(String faction, String sectorial,
			Boolean includeMercenaryUnits) {
		Log.i("CurrentListService", "loadFaction " + faction + " - "
				+ sectorial);
		currentFaction = faction;
		currentSectorial = sectorial;
		this.includeMercenaryUnits = includeMercenaryUnits;
		eventBus.post(Events.FactionLoadEvent.INSTANCE);
	}

	public void resetList() {
		unitRecords = Lists.newArrayList();
		eventBus.post(Events.ArmyListLoadEvent.INSTANCE);
	}

	public String getCurrentFaction() {
		return currentFaction;
	}

	public String getCurrentSectorial() {
		return currentSectorial;
	}

	public Integer getPointCap() {
		return pointCap;
	}

	public Boolean getIncludeMercenaryUnits() {
		return includeMercenaryUnits;
	}

	public List<UnitRecord> getUnitRecords() {
		return unitRecords;
	}

	public class UnitRecord {
		private String isc, code, id;
		private UnitData unitData;

		public UnitRecord(String isc, String code, String id, UnitData unitData) {
			super();
			this.isc = isc;
			this.code = code;
			this.id = id;
			this.unitData = unitData;
		}

		public String getIsc() {
			return isc;
		}

		public String getCode() {
			return code;
		}

		public String getId() {
			return id;
		}

		public UnitData getUnitData() {
			return unitData;
		}

	}

}
