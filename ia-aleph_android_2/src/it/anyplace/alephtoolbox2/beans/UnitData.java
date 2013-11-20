package it.anyplace.alephtoolbox2.beans;

import java.util.Collections;
import java.util.List;

import com.google.common.base.Function;
import com.google.common.collect.Collections2;
import com.google.common.collect.Iterators;

public class UnitData {

	private String mov, army, wip, bts, isc, name, bs, note, cube, type, ph,
			cc, arm, irr, w, ava;
	private List<String> cbcode, bsw, ccw, spec;
	private List<UnitChildData> childs;

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

	public List<UnitChildData> getChilds() {
		return childs;
	}

	public Integer getMinCost() {
		return Collections.min(Collections2.transform(getChilds(),
				new Function<UnitChildData, Integer>() {

					@Override
					public Integer apply(UnitChildData child) {
						return child.getCostInt();
					}
				}));
	}

	public static class UnitChildData {
		private String code, cost, codename, swc, note;
		private List<String> cbcode, spec, bsw, ccw;

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

		public String getNote() {
			return note;
		}

		public List<String> getCbcode() {
			return cbcode;
		}

		public List<String> getSpec() {
			return spec;
		}

		public List<String> getBsw() {
			return bsw;
		}

		public List<String> getCcw() {
			return ccw;
		}

		public Integer getCostInt() {
			return Integer.valueOf(getCost());
		}

	}
}
