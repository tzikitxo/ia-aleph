package it.anyplace.alephtoolbox2.services;

import it.anyplace.alephtoolbox2.services.RosterDataService.ArmyList;
import it.anyplace.alephtoolbox2.services.RosterDataService.ArmyList.ArmyListUnit;
import it.anyplace.alephtoolbox2.services.SourceDataService.FactionData;
import it.anyplace.alephtoolbox2.services.SourceDataService.UnitData;

import java.util.List;
import java.util.UUID;

import android.util.Log;

import com.google.common.base.Function;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.google.common.eventbus.EventBus;
import com.google.inject.Inject;
import com.google.inject.Singleton;

@Singleton
public class CurrentRosterService {
    @Inject
    private EventBus eventBus;
    @Inject
    private SourceDataService dataService;

    private String currentFaction, currentSectorial;

    private Integer pointCap;
    private Boolean includeMercenaryUnits;

    private List<UnitRecord> unitRecords;

    private transient Integer totalCost;
    private transient Double totalSwc;

    // private ArmyList armyList;
    public enum RosterLoadEvent {
        INSTANCE
    }

    public enum RosterUpdateEvent {
        INSTANCE
    }

    @Inject
    private void init() {
        eventBus.register(this);
    }

    // @Subscribe
    // public void loadFaction(LoadFactionEvent loadFactionEvent){
    //
    // }
    // @Subscribe
    // public void handleUnitDetailChildUnitSelectedEvent(
    // UnitDetailChildUnitSelectedEvent unitDetailChildUnitSelectedEvent) {
    // addUnit(unitDetailChildUnitSelectedEvent.getUnitData());
    // }

    public void addUnit(UnitData unitData) {
        UnitRecord newUnitRecord = new UnitRecord(unitData.getIsc(), unitData.getCode(), UUID.randomUUID().toString(),
                unitData);
        unitRecords.add(newUnitRecord);
        validateList();
        eventBus.post(RosterUpdateEvent.INSTANCE);
    }

    public void validateList() {
        // TODO
        totalSwc = 0.0;
        totalCost = 0;
        for (UnitRecord unitRecord : unitRecords) {
            totalSwc += unitRecord.getUnitData().getSwcNum();
            totalCost += unitRecord.getUnitData().getCostNum();
        }
    }

    public void loadArmyList(ArmyList armyList) {
        this.pointCap = armyList.getPcap();
//        this.includeMercenaryUnits = armyList.getIncludeMercs();
        setFaction(armyList.getFaction(), armyList.getSectorial(), armyList.getIncludeMercs());
        unitRecords = Lists.newArrayList(Iterables.transform(armyList.getModels(),
                new Function<ArmyListUnit, UnitRecord>() {

                    @Override
                    public UnitRecord apply(ArmyListUnit armyListUnit) {

                        return new UnitRecord(armyListUnit.getIsc(), armyListUnit.getCode(),
                                armyListUnit.getRecordid(), dataService.getUnitDataByIscCode(armyListUnit.getIsc(),
                                        armyListUnit.getCode()));
                    }
                }));
        validateList();
        eventBus.post(RosterLoadEvent.INSTANCE);
    }

//    public void loadFaction(String faction, String sectorial, Boolean includeMercenaryUnits) {
//        setFaction(faction, sectorial, includeMercenaryUnits);
//        eventBus.post(Events.FactionLoadEvent.INSTANCE);
//    }

    private void setFaction(String faction, String sectorial, Boolean includeMercenaryUnits) {
        Log.i("CurrentListService", "loadFaction " + faction + " - " + sectorial);
        currentFaction = faction;
        currentSectorial = sectorial;
        this.includeMercenaryUnits = includeMercenaryUnits;
    }

    public void newRoster(FactionData factionData) {
        clearList();
        setFaction(factionData.getFactionName(), factionData.getSectorialName(), false);
        validateList();
        eventBus.post(RosterLoadEvent.INSTANCE);
    }

    private void clearList() {
        unitRecords = Lists.newArrayList();
    }

    public void resetList() {
        clearList();
        validateList();
        eventBus.post(RosterUpdateEvent.INSTANCE);
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

    public Integer getPointTotal() {
        return totalCost;
    }

    public Double getSwcTotal() {
        return totalSwc;
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

        @Override
        public int hashCode() {
            final int prime = 31;
            int result = 1;
            result = prime * result + getOuterType().hashCode();
            result = prime * result + ((id == null) ? 0 : id.hashCode());
            return result;
        }

        @Override
        public boolean equals(Object obj) {
            if (this == obj)
                return true;
            if (obj == null)
                return false;
            if (getClass() != obj.getClass())
                return false;
            UnitRecord other = (UnitRecord) obj;
            if (!getOuterType().equals(other.getOuterType()))
                return false;
            if (id == null) {
                if (other.id != null)
                    return false;
            } else if (!id.equals(other.id))
                return false;
            return true;
        }

        private CurrentRosterService getOuterType() {
            return CurrentRosterService.this;
        }

    }

    public Integer getSwcCap() {
        return getPointCap() / 50;
    }

    public Integer getPointLeft() {
        return getPointCap() - getPointTotal();
    }

    public Double getSwcLeft() {
        return getSwcCap() - getSwcTotal();
    }

    public void removeUnitRecord(final UnitRecord unitRecord) {
        unitRecords.remove(unitRecord);
        validateList();
        eventBus.post(RosterUpdateEvent.INSTANCE);
    }

}
