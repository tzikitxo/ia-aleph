package it.anyplace.alephtoolbox2.services;

import it.anyplace.alephtoolbox2.services.RosterDataService.RosterData;
import it.anyplace.alephtoolbox2.services.RosterDataService.RosterData.Model;
import it.anyplace.alephtoolbox2.services.SourceDataService.FactionData;
import it.anyplace.alephtoolbox2.services.SourceDataService.SectorialData;
import it.anyplace.alephtoolbox2.services.SourceDataService.UnitData;

import java.util.Date;
import java.util.List;
import java.util.UUID;

import android.util.Log;

import com.google.common.base.Function;
import com.google.common.base.Objects;
import com.google.common.base.Strings;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.google.common.eventbus.EventBus;
import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.Singleton;

@Singleton
public class CurrentRosterService {
    @Inject
    private EventBus eventBus;
    @Inject
    private Provider<SourceDataService> dataService;
    @Inject
    private Provider<PersistenceService> persistenceService;

    private String currentFaction, currentSectorial;

    private Integer pointCap = 300;
    private Long dateMod;
    private Boolean includeMercenaryUnits;
    private String listId, listName;

    private List<UnitRecord> unitRecords = Lists.newArrayList();

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
        validateList();
    }

    public RosterData exportCurrentRoster() {
        RosterData rosterData = new RosterData();
        rosterData.setDateMod(dateMod);
        rosterData.setFaction(getCurrentFaction());
        rosterData.setSectorial(getCurrentSectorial());
        rosterData.setIncludeMercs(this.getIncludeMercenaryUnits());
        rosterData.setPcap(getPointCap());
        rosterData.setListId(getListId());
        rosterData.setListName(getListName());
        rosterData.setModels(Lists.newArrayList(Lists.transform(getUnitRecords(),
                new Function<UnitRecord, RosterData.Model>() {

                    @Override
                    public Model apply(UnitRecord unitRecord) {
                        Model model = new Model();
                        model.setCode(unitRecord.getCode());
                        model.setIsc(unitRecord.getIsc());
                        model.setRecordid(unitRecord.getId());
                        return model;
                    }
                })));
        return rosterData;
    }

    // public void saveCurrentRoster(){
    // persistenceService.get().saveRosterData(exportCurrentRoster());
    // //TODO synchronize remote
    // }

    // @Subscribe
    // public void loadFaction(LoadFactionEvent loadFactionEvent){
    //
    // }
    // @Subscribe
    // public void handleUnitDetailChildUnitSelectedEvent(
    // UnitDetailChildUnitSelectedEvent unitDetailChildUnitSelectedEvent) {
    // addUnit(unitDetailChildUnitSelectedEvent.getUnitData());
    // }

    public String getListName() {
        if (Strings.isNullOrEmpty(listName)) {
            listName = "";
        }
        return listName;
    }

    public void setListName(String listName) {
        this.listName = listName;
    }

    public String getListId() {
        if (Strings.isNullOrEmpty(listId)) {
            listId = persistenceService.get().newId();
        }
        return listId;
    }

    public void addUnit(UnitData unitData) {
        UnitRecord newUnitRecord = new UnitRecord(unitData.getIsc(), unitData.getCode(), UUID.randomUUID().toString(),
                unitData);
        unitRecords.add(newUnitRecord);
        afterRosterUpdate();
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

    public void loadRoster(RosterData rosterData) {
        this.pointCap = rosterData.getPcap();
        this.dateMod = rosterData.getDateMod();
        this.listName = rosterData.getListName();
        this.listId = rosterData.getListId();
        setFaction(rosterData.getFaction(), rosterData.getSectorial(), rosterData.getIncludeMercs());
        unitRecords = Lists.newArrayList(Iterables.transform(rosterData.getModels(), new Function<Model, UnitRecord>() {

            @Override
            public UnitRecord apply(Model armyListUnit) {

                return new UnitRecord(armyListUnit.getIsc(), armyListUnit.getCode(), armyListUnit.getRecordid(),
                        dataService.get().getUnitDataByIscCode(armyListUnit.getIsc(), armyListUnit.getCode()));
            }
        }));
        validateList();
        eventBus.post(RosterLoadEvent.INSTANCE);
    }

    // public void loadFaction(String faction, String sectorial, Boolean
    // includeMercenaryUnits) {
    // setFaction(faction, sectorial, includeMercenaryUnits);
    // eventBus.post(Events.FactionLoadEvent.INSTANCE);
    // }

    private void setFaction(String faction, String sectorial, Boolean includeMercenaryUnits) {
        Log.i("CurrentListService", "loadFaction " + faction + " - " + sectorial);
        currentFaction = faction;
        currentSectorial = sectorial;
        this.includeMercenaryUnits = includeMercenaryUnits;
    }

    public void newRoster(FactionData factionData) {
        clearList();
        listName = listId = null;
        setFaction(factionData.getFactionName(), factionData.getSectorialName(), false);
        afterRosterUpdate(RosterLoadEvent.INSTANCE);
    }

    // public void newRoster(SectorialData sectorialData) {
    // clearList();
    // listName = listId = null;
    // setFaction(factionData.getFactionName(), factionData.getSectorialName(),
    // false);
    // afterRosterUpdate(RosterLoadEvent.INSTANCE);
    //
    // }

    private void clearList() {
        unitRecords = Lists.newArrayList();
    }

    public void resetList() {
        clearList();
        afterRosterUpdate();
        // validateList();
        // eventBus.post(RosterUpdateEvent.INSTANCE);
    }

    public String getCurrentFaction() {
        return currentFaction;
    }

    public String getCurrentSectorial() {
        return currentSectorial;
    }

    public String getCurrentFactionOrSectorial() {
        return Objects.firstNonNull(Strings.emptyToNull(getCurrentSectorial()), getCurrentFaction());
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
        afterRosterUpdate();
    }

    public void setPointCap(Integer newPointcap) {
        if (this.pointCap != newPointcap) {
            this.pointCap = newPointcap;
            afterRosterUpdate();
        }
    }

    private void afterRosterUpdate() {
        afterRosterUpdate(RosterUpdateEvent.INSTANCE);
    }

    private void afterRosterUpdate(Object event) {
        dateMod = new Date().getTime();
        validateList();
        persistenceService.get().saveRosterData(exportCurrentRoster());
        // TODO set current roster as last modified
        eventBus.post(event);
    }

    public void loadRoster(String listId) {
        loadRoster(persistenceService.get().getRosterDataById(listId));
    }

}
