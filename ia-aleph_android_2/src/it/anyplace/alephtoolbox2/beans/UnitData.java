package it.anyplace.alephtoolbox2.beans;

import java.util.List;

public class UnitData {
	
	private String mov,army,wip,bts,isc,name,bs,note,cube,type,ph,cc,arm,irr,w,ava;
	private List<String> cbcode,bsw,ccw,spec;
	
	public String getMov() {
		return mov;
	}

	public String getArmy() {
		return army;
	}

	public String getWip() {
		return wip;
	}

	public String getBts() {
		return bts;
	}

	public String getIsc() {
		return isc;
	}

	public String getName() {
		return name;
	}

	public String getBs() {
		return bs;
	}

	public String getNote() {
		return note;
	}

	public String getCube() {
		return cube;
	}

	public String getType() {
		return type;
	}

	public String getPh() {
		return ph;
	}

	public String getCc() {
		return cc;
	}

	public String getArm() {
		return arm;
	}

	public String getIrr() {
		return irr;
	}

	public String getW() {
		return w;
	}

	public String getAva() {
		return ava;
	}

	public List<String> getCbcode() {
		return cbcode;
	}

	public List<String> getBsw() {
		return bsw;
	}

	public List<String> getCcw() {
		return ccw;
	}

	public List<String> getSpec() {
		return spec;
	}

	public static class UnitChildData{
		private String code,cost,codename,swc,spec,note;
		private List<String> cbcode,sec,bsw,ccw;
		public String getCode() {
			return code;
		}
		public String getCost() {
			return cost;
		}
		public String getCodename() {
			return codename;
		}
		public String getSwc() {
			return swc;
		}
		public String getSpec() {
			return spec;
		}
		public String getNote() {
			return note;
		}
		public List<String> getCbcode() {
			return cbcode;
		}
		public List<String> getSec() {
			return sec;
		}
		public List<String> getBsw() {
			return bsw;
		}
		public List<String> getCcw() {
			return ccw;
		}
		
	}
/*
 * "mov": "6-4",
  "army": "Aleph",
  "wip": "15",
  "cbcode": [
   "280812-0271"
  ],
  "bts": "-6",
  "isc": "Achilles",
  "name": "Achilles",
  "bs": "15",
  "note": "",
  "cube":"2",
  "type": "HI",
  "ph": "16",
  "cc": "20",
  "arm": "5",
  "irr": "",
  "w": "3",
  "ava": "1",
  "bsw": [
   "Nanopulser"
  ],
  "spec": [
   "Martial Arts L4",
   "Multiterrain",
   "ODD: Optical Disruptor",
   "Personality"
  ],
  "ccw": [
   "EXP CCW",
   "Pistol"
  ],
  "childs": [
   {
    "code": "Default",
    "cost": "80",
    "codename": "MULTI",
    "swc": "0",
    "cbcode": [],
    "spec": [],
    "bsw": [
     "MULTI Rifle"
    ],
    "ccw": [],
    "note": ""
   },
   {
    "code": "Lieutenant",
    "cost": "80",
    "codename": "",
    "swc": "0",
    "cbcode": [],
    "spec": [
     "Lieutenant"
    ],
    "bsw": [
     "MULTI Rifle"
    ],
    "ccw": [],
    "note": ""
 */
}
