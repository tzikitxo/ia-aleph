package it.anyplace.alephtoolbox2.services;

import java.io.IOException;
import java.util.List;

import android.util.Base64;
import android.util.Log;

import com.google.common.base.Objects;
import com.google.common.base.Strings;
import com.google.common.eventbus.EventBus;
import com.google.gson.Gson;
import com.google.inject.Inject;
import com.google.inject.Singleton;

@Singleton
public class RosterDataService {

    @Inject
    private Gson gson;
    @Inject
    private EventBus eventBus;

    @Deprecated
    public RosterData parseArmyList(String armyListGsonStr) {
        RosterData armyList = gson.fromJson(armyListGsonStr, RosterData.class);
        armyList.setSectorial(Strings.emptyToNull(armyList.getSectorial()));
        // TODO validation
        return armyList;
    }

    public RosterData deserializeRosterData(String rosterDataStr) {
        try {
            String jsonStr = new String(Base64.decode(rosterDataStr, Base64.DEFAULT));
            RosterData rosterData = gson.fromJson(jsonStr, RosterData.class);
            // TODO validation
            return rosterData;
        } catch (Exception ex) {
            eventBus.post(new IOException("Error deserializing roster data", ex));
            Log.w("RosterDataService", "Error deserializing roster data", ex);
            return null;
        }
    }

    public String serializeRosterData(RosterData rosterData) {
        String jsonStr = gson.toJson(rosterData);
        String base64 = Base64.encodeToString(jsonStr.getBytes(), Base64.NO_WRAP);
        return base64;
    }

    public static class RosterData {
        private String faction, sectorial, listId, listName;
        private Long dateMod;
        private Integer pcap;
        private Boolean includeMercs = false;
        private List<Model> models;

        // includeMercs':booleanIncludeMercs,
        // 'models':modelList,
        // 'listId':listId,
        // 'listName':listName,
        // 'dateMod': String((new Date()).getTime()),
        // 'groupMarks':groupMarks,
        // 'combatGroupSize':combatGroupSize,
        // 'specop':specop,
        // 'mercenaryFactions':factionName=='Mercenary Company'
        // ?mercenaryFactions:null

        public String getCleanFactionorSectorial() {
            return Objects.firstNonNull(Strings.emptyToNull(sectorial), faction).toLowerCase()
                    .replaceAll("[^a-z0-9]+", "_").replaceAll("(^_|_$)", "");
        }

        public String getFaction() {
            return faction;
        }

        public String getListId() {
            return listId;
        }

        public void setListId(String listId) {
            this.listId = listId;
        }

        public String getListName() {
            return listName;
        }

        public void setListName(String listName) {
            this.listName = listName;
        }

        public Long getDateMod() {
            return dateMod;
        }

        public void setDateMod(Long dateMod) {
            this.dateMod = dateMod;
        }

        public void setFaction(String faction) {
            this.faction = faction;
        }

        public String getSectorial() {
            return sectorial;
        }

        public void setSectorial(String sectorial) {
            this.sectorial = sectorial;
        }

        public Integer getPcap() {
            return pcap;
        }

        public void setPcap(Integer pcap) {
            this.pcap = pcap;
        }

        public Boolean getIncludeMercs() {
            return includeMercs;
        }

        public void setIncludeMercs(Boolean includeMercs) {
            this.includeMercs = includeMercs;
        }

        public List<Model> getModels() {
            return models;
        }

        public void setModels(List<Model> models) {
            this.models = models;
        }

        public static class Model {
            private String isc, code, recordid;

            public String getIsc() {
                return isc;
            }

            public void setIsc(String isc) {
                this.isc = isc;
            }

            public String getCode() {
                return code;
            }

            public void setCode(String code) {
                this.code = code;
            }

            public String getRecordid() {
                return recordid;
            }

            public void setRecordid(String recordid) {
                this.recordid = recordid;
            }

        }

    }

}
