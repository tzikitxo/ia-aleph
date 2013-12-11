package it.anyplace.alephtoolbox2.services;

import it.anyplace.alephtoolbox2.R;
import it.anyplace.alephtoolbox2.services.DataService.UnitData;

import java.io.InputStreamReader;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import android.content.Context;

import com.google.common.base.Function;
import com.google.common.base.Objects;
import com.google.common.base.Predicate;
import com.google.common.base.Strings;
import com.google.common.collect.Collections2;
import com.google.common.collect.ComparisonChain;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import com.google.common.collect.Multimap;
import com.google.common.collect.Multimaps;
import com.google.common.collect.Sets;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;
import com.google.inject.Inject;
import com.google.inject.Singleton;

@Singleton
public class DataService {
	public final static String DEFAULT_CHILD_CODE="Default";

	@Inject
	private Gson gson;
	@Inject
	private Context context;
	@Inject
	private CurrentRosterService sessionService;

	private List<UnitData> allUnitDataList;
	private Multimap<String, UnitData> unitDataByFaction, unitDataByIsc;

	// private Map<>

	@Inject
	private void loadData() {
		allUnitDataList = gson.fromJson(new InputStreamReader(context
				.getResources().openRawResource(R.raw.armylist_data)),
				new TypeToken<List<UnitData>>() {
				}.getType());
		for (UnitData parent : allUnitDataList) {
			for (UnitData child : parent.getChilds()) {
				child.loadFromParent(parent);
			}
			Collections.sort(parent.getChilds(),new Comparator<UnitData>(){

				@Override
				public int compare(UnitData lhs, UnitData rhs) {
					return lhs.isDefaultChild()?1:ComparisonChain.start().compare(lhs.getCostNum(), rhs.getCostNum()).result();
				}});
		}
		unitDataByFaction = Multimaps.index(allUnitDataList,
				new Function<UnitData, String>() {

					@Override
					public String apply(UnitData unit) {
						return unit.getArmy();
					}
				});
		unitDataByIsc = Multimaps.index(allUnitDataList,
				new Function<UnitData, String>() {

					@Override
					public String apply(UnitData unit) {
						return unit.getIsc();
					}
				});
	}

	// public Collection<UnitData> getUnitDataByFaction(String faction) {
	// return unitDataByFaction.get(faction);
	// }

	public Collection<UnitData> getAvailableUnitData() {
		return unitDataByFaction.get(sessionService.getCurrentFaction());
	}

	public UnitData getUnitDataByIsc(String isc) {
		Collection<UnitData> unitData = unitDataByIsc.get(isc);
		if (unitData.isEmpty()) {
			return null;
		} else if (unitData.size() == 1) {
			return unitData.iterator().next();
		} else {
			return Iterables.find(unitData, new Predicate<UnitData>() {

				@Override
				public boolean apply(UnitData unitData) {
					return unitData.getArmy().equals(
							sessionService.getCurrentFaction());
				}
			});
		}
	}

	public UnitData getUnitDataByIscCode(String isc, String code) {
		UnitData parent = getUnitDataByIsc(isc);
		return parent.getChildByCode(code);
	}

	// private final Function<GsonUnitData,UnitData>
	// gsonUnitDataTransformerFunction=new Function<GsonUnitData,UnitData>(){
	//
	// @Override
	// public UnitData apply(GsonUnitData ) {
	// return null;
	// }};

	public static class UnitData implements Cloneable {

		private String mov, army, wip, bts, isc, name, bs, note, cube, type,
				ph, cc, arm, irr, w, ava, code, codename, cost, swc;
		private List<String> cbcode, bsw, ccw, spec;
		private List<UnitData> childs;
		private transient UnitData originalChild, parent;

		public UnitData() {

		}

		protected void loadFromParent(UnitData parent) {
			this.parent = parent;
			try {
				this.originalChild = (UnitData) this.clone();
			} catch (CloneNotSupportedException e) {
				throw new RuntimeException(e);
			}

			this.mov = parent.mov;
			this.army = parent.army;
			this.wip = parent.wip;
			this.bts = parent.bts;
			this.isc = parent.isc;
			this.name = parent.name;
			this.bs = parent.bs;
			this.cube = parent.cube;
			this.type = parent.type;
			this.ph = parent.ph;
			this.cc = parent.cc;
			this.arm = parent.arm;
			this.irr = parent.irr;
			this.w = parent.w;
			this.ava = parent.ava;
			// this.cbcode = Lists.newArrayList(parent.cbcode);
			// this.bsw = Lists.newArrayList(parent.bsw);
			// this.ccw = Lists.newArrayList(parent.ccw);
			// this.spec = Lists.newArrayList(parent.spec);

			this.childs = Collections.emptyList();

			// this.cbcode.addAll(this.originalChild.cbcode);
			// this.bsw.addAll(this.originalChild.bsw);
			// this.ccw.addAll(this.originalChild.ccw);
			// this.c.addAll(this.originalChild.spec);

			this.bsw = Lists.newArrayList(Sets.newTreeSet(Iterables.concat(
					parent.bsw, this.bsw)));
			this.bsw = Lists.newArrayList(Sets.newTreeSet(Iterables.concat(
					parent.ccw, this.ccw)));
			this.spec = Lists.newArrayList(Sets.newTreeSet(Iterables.concat(
					parent.spec, this.spec)));
			this.cbcode = Lists.newArrayList(Sets.newTreeSet(Iterables.concat(
					parent.cbcode, this.cbcode)));

			this.note = parent.note + this.originalChild.note;
		}

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

		public String getCleanIsc() {
			return isc.toLowerCase().replaceAll("[^a-z0-9]+", "_")
					.replaceAll("(^_|_$)", "");
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

		public List<UnitData> getChilds() {
			return childs;
		}

		public UnitData getChildByCode(final String code) {
			return Iterables.find(getChilds(), new Predicate<UnitData>() {

				@Override
				public boolean apply(UnitData unitChildData) {
					return unitChildData.getCode().equals(code);
				}
			});
		}

		public Integer getMinCost() {
			return Collections.min(Collections2.transform(getChilds(),
					new Function<UnitData, Integer>() {

						@Override
						public Integer apply(UnitData child) {
							return child.getCostNum();
						}
					}));
		}

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

//		public Integer getCostInt() {
//			return Integer.valueOf(getCost());
//		}

		public UnitData getDefaultChild() {
			return getChildByCode(DEFAULT_CHILD_CODE);
		}
		public boolean isDefaultChild(){
			return code.equalsIgnoreCase(DEFAULT_CHILD_CODE);
		}

		public String getDisplayCode() {
			return Objects.firstNonNull(Strings.emptyToNull(codename), code);
		}

		public List<String> getChildBsw() {
			return getOriginalChild().getBsw();
		}

		public List<String> getChildCcw() {
			return getOriginalChild().getCcw();
		}

		public List<String> getChildSpec() {
			return getOriginalChild().getSpec();
		}

		private UnitData getOriginalChild() {
			return Objects.firstNonNull(originalChild, this);
		}

		public UnitData getParent() {
			return Objects.firstNonNull(parent, this);
		}

		public Double getSwcNum() {
			return Strings.isNullOrEmpty(swc) ? 0.0 : Double.valueOf(swc);
		}

		public Integer getCostNum() {
			return Strings.isNullOrEmpty(cost) ? 0 : Integer.valueOf(cost);
		}

	}
}
