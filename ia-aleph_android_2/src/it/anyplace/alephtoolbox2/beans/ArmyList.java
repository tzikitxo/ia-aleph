package it.anyplace.alephtoolbox2.beans;

import java.util.List;

public class ArmyList {
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

///data: "{"pcap":200,"faction":"Panoceania","includeMercs":false,"models":[{"isc":"Cutters","code":"Default","recordid":"26341055822558700"},{"isc":"Bagh-Mari","code":"Shotgun","recordid":"58486073673702776"},{"isc":"Lieutenant Stephen Rao","code":"Default","recordid":"71578364423476160"},{"isc":"Fusiliers","code":"Default","recordid":"15866463608108460"},{"isc":"Fusiliers","code":"Default","recordid":"94999620621092620"},{"isc":"Order Sergeants","code":"Spitfire","recordid":"64432820701040330"},{"isc":"Order Sergeants","code":"TO Sniper","recordid":"2207046304829418.8"}],"listId":"3542035631835460.5","id":"3542035631835460.5","listName":"","dateMod":"1384377643000","groupMarks":[],"combatGroupSize":10,"specop":null,"mercenaryFactions":null}"
