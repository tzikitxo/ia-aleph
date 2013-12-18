package it.anyplace.alephtoolbox2.services;

import java.util.List;

import android.content.Context;

import com.google.common.base.Strings;
import com.google.gson.Gson;
import com.google.inject.Inject;
import com.google.inject.Singleton;

@Singleton
public class RosterDataService {


    @Inject
	private Gson gson;


	public ArmyList parseArmyList(String armyListGsonStr) {
		ArmyList armyList = gson.fromJson(armyListGsonStr, ArmyList.class);
		armyList.setSectorial(Strings.emptyToNull(armyList.getSectorial()));
		// TODO validation
		return armyList;
	}
	
	public static class ArmyList {
		private String faction,sectorial;
		private Integer pcap;
		private Boolean includeMercs;
		private List<ArmyListUnit> models;
		
		public String getFaction() {
			return faction;
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

		public List<ArmyListUnit> getModels() {
			return models;
		}

		public void setModels(List<ArmyListUnit> models) {
			this.models = models;
		}

		public static class ArmyListUnit {
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
