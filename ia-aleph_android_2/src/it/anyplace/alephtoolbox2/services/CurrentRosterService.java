package it.anyplace.alephtoolbox2.services;

import it.anyplace.alephtoolbox2.R;
import it.anyplace.alephtoolbox2.services.RosterDataService.RosterData;
import it.anyplace.alephtoolbox2.services.RosterDataService.RosterData.Model;
import it.anyplace.alephtoolbox2.services.SourceDataService.FactionData;
import it.anyplace.alephtoolbox2.services.SourceDataService.UnitData;

import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import android.content.Context;
import android.util.Log;

import com.google.common.base.Function;
import com.google.common.base.Objects;
import com.google.common.base.Predicate;
import com.google.common.base.Strings;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.google.common.collect.Multimap;
import com.google.common.collect.Multimaps;
import com.google.common.eventbus.EventBus;
import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.Singleton;

@Singleton
public class CurrentRosterService {
    @Inject
    private EventBus eventBus;
    @Inject
    private Context context;
    @Inject
    private Provider<SourceDataService> dataService;
    @Inject
    private Provider<PersistenceService> persistenceService;
    @Inject
    private Provider<RosterSynchronizationService> rosterSynchronizationService;

    private String currentFaction, currentSectorial;

    private Integer pointCap = 300;
    private Long dateMod;
    private Boolean includeMercenaryUnits;
    private String listId, listName;
    private List<String> validationNotes = Lists.newArrayList();

    private List<UnitRecord> unitRecords = Lists.newArrayList();

    private transient Integer totalCost, modelCount;
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
        rosterData.setModels(Lists.newArrayList(Iterables.transform(
                Iterables.filter(getUnitRecords(), new Predicate<UnitRecord>() {

                    @Override
                    public boolean apply(UnitRecord unitRecord) {
                        return !unitRecord.getUnitData().isCompanion();
                    }
                }), new Function<UnitRecord, RosterData.Model>() {

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

    public List<String> getValidationNotes() {
        return validationNotes;
    }

    public void addUnit(UnitData unitData) {
        if (unitData.isCompanion()) {
            addUnit(dataService.get().getUnitDataByIscCode(unitData.getCompanionIsc(), unitData.getCompanionCode()));
        } else {
            UnitRecord newUnitRecord = new UnitRecord(unitData);
            unitRecords.add(newUnitRecord);
            if (unitData.hasCompanion()) {
                UnitData companionUnitData = dataService.get().getUnitDataByIscCode(unitData.getCompanionIsc(),
                        unitData.getCompanionCode());
                UnitRecord companionUnitRecord = new UnitRecord(companionUnitData);
                newUnitRecord.getCompanionUnits().add(companionUnitRecord);
                companionUnitRecord.getCompanionUnits().add(newUnitRecord);
                unitRecords.add(companionUnitRecord);
            }
            afterRosterUpdate();
        }
    }

    public void validateList() {
        validationNotes.clear();
        totalSwc = 0.0;
        totalCost = 0;
        modelCount = 0;
        // List<UnitRecord> starAvaModels=Lists.newArrayList();
        boolean hasLiutenant = false, hasHacker = false, hasTag = false, hasMnemonica = false, hasRemote = false, hasAutotoolRemote = false;

        for (UnitRecord unitRecord : unitRecords) {
            unitRecord.getValidationNotes().clear();
            totalSwc += unitRecord.getUnitData().getSwcNum();
            totalCost += unitRecord.getUnitData().getCostNum();
            if (!unitRecord.getUnitData().shouldSkipModelCount()) {
                modelCount++;
            }
            if (unitRecord.getUnitData().getSpec().contains("Lieutenant")) {
                if (!hasLiutenant) {
                    hasLiutenant = true;
                } else {
                    validationNotes.add(context.getResources().getString(R.string.armylist_warning_ltMiscount));
                }
            }
            if (unitRecord.getUnitData().getSpec().contains("Hacker")) {
                hasHacker = true;
            }
            if (unitRecord.getUnitData().getSpec().contains("G: Mnemonica")) {
                hasMnemonica = true;
            }
            if (unitRecord.getUnitData().getSpec().contains("Control Device")) {
                modelCount++;
            }
            if (unitRecord.getUnitData().getType().equals("TAG")) {
                hasTag = true;
            } else if (unitRecord.getUnitData().getType().equals("REM")) {
                if (unitRecord.getUnitData().getSpec().contains("G: Autotool")) {
                    hasAutotoolRemote = true;
                } else if (unitRecord.getUnitData().getSpec().contains("G: Servant")
                        || unitRecord.getUnitData().getSpec().contains("G: Synchronized")
                        || unitRecord.getUnitData().getSpec().contains("AI Beacon")
                        || unitRecord.getUnitData().getIsc().equals("Traktor Mul, Artillery and Support Regiment")) {
                    // no need for hacker or stuff
                } else {
                    hasRemote = true;
                }
            }
        }
        if (!hasLiutenant) {
            validationNotes.add(context.getResources().getString(R.string.armylist_warning_ltMiscount));
        }
        if (hasRemote && !(hasTag || hasHacker)) {
            validationNotes.add(context.getResources().getString(R.string.armylist_warning_remWarning));
        }
        if (hasAutotoolRemote && !(hasMnemonica || hasHacker)) {
            validationNotes.add(context.getResources().getString(R.string.armylist_warning_remAutotWarning));
        }
        Multimap<String, UnitRecord> unitRecordsByIsc = Multimaps.index(unitRecords,
                new Function<UnitRecord, String>() {

                    @Override
                    public String apply(UnitRecord unitRecord) {
                        return unitRecord.getIsc();
                    }
                });
        for (Map.Entry<String, Collection<UnitRecord>> entry : unitRecordsByIsc.asMap().entrySet()) {
            int count = entry.getValue().size();
            UnitData unitData = entry.getValue().iterator().next().getUnitData();
            Integer ava = unitData.getAvaNum();
            if (ava != null && count > ava) {
                String note = context.getResources().getString(R.string.app_validation_tooManyModels,
                        unitData.getIsc(), count, ava);
                validationNotes.add(note);
                for (UnitRecord unitRecord : entry.getValue()) {
                    unitRecord.getValidationNotes().add(note);
                }
            }
        }
        if (totalCost > getPointCap()) {
            validationNotes.add(context.getResources().getString(R.string.app_validation_tooManyPoints, totalCost,
                    getPointCap()));
        }
        if (totalSwc > getSwcCap()) {
            validationNotes.add(context.getResources().getString(R.string.app_validation_tooManySwc, totalSwc,
                    getSwcCap()));
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
        private transient List<String> validationNotes = Lists.newArrayList();
        private String isc, code, id;
        private UnitData unitData;
        private List<UnitRecord> companionUnits = Lists.newArrayList();

        public List<UnitRecord> getCompanionUnits() {
            return companionUnits;
        }

        public boolean hasError() {
            return !validationNotes.isEmpty();
        }

        public List<String> getValidationNotes() {
            return validationNotes;
        }

        public UnitRecord(UnitData unitData) {
            this(unitData.getIsc(), unitData.getCode(), persistenceService.get().newId(), unitData);
        }

        public UnitRecord(String isc, String code, String id, UnitData unitData) {

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
        unitRecords.removeAll(unitRecord.getCompanionUnits());
        // if(unitRecord.getUnitData().isCompanion()){
        // unitRecords.removeAll(unitRecord.getCompanionUnits());
        // }else if(unitRecord.getUnitData().hasCompanion()){
        // unitRecords.removeAll(unitRecord.getCompanionUnits());
        // }
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
        persistenceService.get().saveCurrentRosterData();
        rosterSynchronizationService.get().sendCurrentRosterToRemote();
        // TODO set current roster as last modified
        eventBus.post(event);
    }

    public void loadRoster(String listId) {
        loadRoster(persistenceService.get().getRosterDataById(listId));
    }

    public Long getDateMod() {
        return dateMod;
    }

    public Integer getModelCount() {
        return modelCount;
    }

}
