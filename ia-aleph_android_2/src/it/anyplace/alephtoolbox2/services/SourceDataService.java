package it.anyplace.alephtoolbox2.services;

import it.anyplace.alephtoolbox2.R;
import it.anyplace.alephtoolbox2.services.SourceDataService.FactionData;
import it.anyplace.alephtoolbox2.services.SourceDataService.SectorialData.UnitRecord;

import java.io.InputStreamReader;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import android.content.Context;
import android.util.Log;

import com.google.common.base.Function;
import com.google.common.base.Objects;
import com.google.common.base.Predicate;
import com.google.common.base.Stopwatch;
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
import com.google.inject.Provider;
import com.google.inject.Singleton;

@Singleton
public class SourceDataService {
    public final static String DEFAULT_CHILD_CODE = "Default";

    @Inject
    private Gson gson;
    @Inject
    private Context context;
    @Inject
    private Provider<CurrentRosterService> currentRosterService;

    // private static class Data{

    private List<UnitData> allUnitDataList;
    private List<FactionData> allFactionsData;
    private List<SectorialData> allSectorialData;
    private Multimap<String, UnitData> unitDataByFaction, unitDataByIsc;
    private Multimap<String, FactionData> sectorialDataByFactionName;
    // private Map<String, SectorialData> sectorialDataBySectorialName;
    private Map<String, FactionData> factionAndSectorialDataByName;

    // }
    //
    // private Data data;

    // private List<UnitData> allUnitDataList;
    // private List<FactionData> allFactionsData;
    // private List<SectorialData> allSectorialData;
    // private Multimap<String, UnitData> unitDataByFaction, unitDataByIsc;
    // private Multimap<String, FactionData> sectorialDataByFactionName;
    // // private Map<String, SectorialData> sectorialDataBySectorialName;
    // private Map<String, FactionData> factionAndSectorialDataByName;

    // private Map<>

    @Inject
    private void loadData() {
        loadDataFromJson();
    }

    private void loadDataFromJson() {
        Stopwatch stopwatch = new Stopwatch();
        stopwatch.start();
        allUnitDataList = gson.fromJson(
                new InputStreamReader(context.getResources().openRawResource(R.raw.armylist_data)),
                new TypeToken<List<UnitData>>() {
                }.getType());
        Log.d("SourceDataService", "loaded unit data from gson in " + stopwatch.stop().toString());
        stopwatch.reset().start();
        for (UnitData parent : allUnitDataList) {
            for (UnitData child : parent.getChilds()) {
                child.loadFromParent(parent);
            }
            Collections.sort(parent.getChilds(), new Comparator<UnitData>() {

                @Override
                public int compare(UnitData lhs, UnitData rhs) {
                    return lhs.isDefaultChild() ? 1 : ComparisonChain.start()
                            .compare(lhs.getCostNum(), rhs.getCostNum()).result();
                }
            });
        }
        unitDataByFaction = Multimaps.index(allUnitDataList, new Function<UnitData, String>() {

            @Override
            public String apply(UnitData unit) {
                return unit.getArmy();
            }
        });
        unitDataByIsc = Multimaps.index(allUnitDataList, new Function<UnitData, String>() {

            @Override
            public String apply(UnitData unit) {
                return unit.getIsc();
            }
        });
        allFactionsData = Lists.newArrayList(Collections2.transform(
                Arrays.asList(context.getResources().getStringArray(R.array.allFactions)),
                new Function<String, FactionData>() {

                    @Override
                    public FactionData apply(final String factionName) {
                        return new FactionDataImpl() {

                            @Override
                            public String getFactionName() {
                                return factionName;
                            }

                            @Override
                            public Collection<UnitData> getAvailableUnitsData() {
                                return unitDataByFaction.get(getFactionName());
                            }
                        };
                    }
                }));
        Log.d("SourceDataService", "processed unit data in " + stopwatch.stop().toString());
        stopwatch.start();
        allSectorialData = gson.fromJson(
                new InputStreamReader(context.getResources().openRawResource(R.raw.sectorials_data)),
                new TypeToken<List<SectorialData>>() {
                }.getType());
        List<FactionData> sectorialDataAsFactionData = Lists.newArrayList(Iterables.transform(allSectorialData,
                new Function<SectorialData, FactionData>() {

                    @Override
                    public FactionData apply(final SectorialData sectorialData) {
                        return new FactionDataImpl() {

                            private List<UnitData> unitDataList;

                            @Override
                            public String getFactionName() {
                                return sectorialData.getArmy();
                            }

                            public boolean isSectorial() {
                                return true;
                            }

                            public String getSectorialName() {
                                return sectorialData.getName();
                            }

                            @Override
                            public Collection<UnitData> getAvailableUnitsData() {
                                if (unitDataList == null) {
                                    unitDataList = Lists.newArrayList(Iterables.transform(sectorialData.getUnits(),
                                            new Function<UnitRecord, UnitData>() {

                                                @Override
                                                public UnitData apply(UnitRecord unitRecord) {
                                                    UnitData originalUnitData = getUnitDataByIsc(unitRecord.getIsc()), newUnitData = originalUnitData
                                                            .clone();
                                                    newUnitData.ava = unitRecord.getAva();
                                                    if (unitRecord.getLinkable()) {
                                                        newUnitData.spec = Lists.newArrayList(Iterables.concat(
                                                                newUnitData.spec, Arrays.asList("Linkable")));
                                                    }
                                                    return newUnitData;
                                                }
                                            }));
                                }
                                return unitDataList;
                            }
                        };
                    }
                }));
        sectorialDataByFactionName = Multimaps.index(sectorialDataAsFactionData, new Function<FactionData, String>() {

            @Override
            public String apply(FactionData sectorialData) {
                return sectorialData.getFactionName();
            }
        });
        // sectorialDataBySectorialName = Maps.uniqueIndex(allSectorialData, new
        // Function<SectorialData, String>() {
        //
        // @Override
        // public String apply(SectorialData sectorialData) {
        // return sectorialData.getName();
        // }
        // });
        factionAndSectorialDataByName = Maps.uniqueIndex(Iterables.concat(allFactionsData, sectorialDataAsFactionData),
                new Function<FactionData, String>() {

                    @Override
                    public String apply(FactionData factionData) {
                        return factionData.isSectorial() ? factionData.getSectorialName() : factionData
                                .getFactionName();
                    }
                });
        Log.d("SourceDataService", "loaded and processed sectorials in " + stopwatch.stop().toString());
    }

    // public Collection<UnitData> getUnitDataByFaction(String faction) {
    // return unitDataByFaction.get(faction);
    // }

    public List<SectorialData> getAllSectorialData() {
        return allSectorialData;
    }

    public Iterable<FactionData> getSectorialDatabyFaction(String factionName) {
        return sectorialDataByFactionName.get(factionName);
    }

    public Collection<UnitData> getAvailableUnitData() {
        // if(currentRosterService.isSectorial)
        return factionAndSectorialDataByName.get(currentRosterService.get().getCurrentFactionOrSectorial())
                .getAvailableUnitsData();
    }

    public Collection<FactionData> getAllFactionsData() {
        return allFactionsData;
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
                    return unitData.getArmy().equals(currentRosterService.get().getCurrentFaction());
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

    public static interface FactionData {
        public String getFactionName();

        public boolean isSectorial();

        public String getSectorialName();

        public String getCleanFactionName();

        public Collection<UnitData> getAvailableUnitsData();

        public String getCleanSectorialName();

        public String getCleanFactionOrSectorialName();
    }

    public static class SectorialData {
        private String army, name;
        private List<UnitRecord> units;

        public String getArmy() {
            return army;
        }

        public void setArmy(String army) {
            this.army = army;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public List<UnitRecord> getUnits() {
            return units;
        }

        public void setUnits(List<UnitRecord> units) {
            this.units = units;
        }

        public static class UnitRecord {
            private String isc, ava;
            private Boolean linkable;

            public String getIsc() {
                return isc;
            }

            public void setIsc(String isc) {
                this.isc = isc;
            }

            public String getAva() {
                return ava;
            }

            public void setAva(String ava) {
                this.ava = ava;
            }

            public boolean getLinkable() {
                return Objects.firstNonNull(linkable, false);
            }

            public void setLinkable(Boolean linkable) {
                this.linkable = linkable;
            }

        }

        public String getCleanSectorialName() {
            return cleanName(getName());
        }

        // public FactionData toFactionData() {
        // return new FactionDataImpl() {
        //
        // @Override
        // public String getFactionName() {
        // return getArmy();
        // }
        //
        // public boolean isSectorial() {
        // return true;
        // }
        //
        // public String getSectorialName() {
        // return getName();
        // }
        // };
        // }
    }

    private abstract static class FactionDataImpl implements FactionData {

        public boolean isSectorial() {
            return false;
        }

        public String getSectorialName() {
            return null;
        }

        public String getCleanFactionName() {
            return cleanName(getFactionName());
        }

        public String getCleanSectorialName() {
            return cleanName(getSectorialName());
        }

        public String getCleanFactionOrSectorialName() {
            return isSectorial() ? getCleanSectorialName() : getCleanFactionName();
        }
    }

    public static class UnitData implements Cloneable {

        private String mov, army, wip, bts, isc, name, bs, note, cube, type, ph, cc, arm, irr, w, ava, code, codename,
                cost, swc;
        private List<String> cbcode, bsw, ccw, spec;
        private List<UnitData> childs;
        private transient UnitData originalChild, parent;

        public UnitData() {

        }

        protected UnitData clone() {
            try {
                return (UnitData) super.clone();
            } catch (CloneNotSupportedException e) {
                throw new RuntimeException(e);
            }
        }

        protected void loadFromParent(UnitData parent) {
            this.parent = parent;
            // try {
            this.originalChild = (UnitData) this.clone();
            // } catch (CloneNotSupportedException e) {
            // throw new RuntimeException(e);
            // }

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

            this.bsw = Lists.newArrayList(Sets.newTreeSet(Iterables.concat(parent.bsw, this.originalChild.bsw)));
            this.bsw = Lists.newArrayList(Sets.newTreeSet(Iterables.concat(parent.ccw, this.originalChild.ccw)));
            this.spec = Lists.newArrayList(Sets.newTreeSet(Iterables.concat(parent.spec, this.originalChild.spec)));
            this.cbcode = Lists
                    .newArrayList(Sets.newTreeSet(Iterables.concat(parent.cbcode, this.originalChild.cbcode)));

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
            return cleanName(isc);
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
            return Collections.min(Collections2.transform(getChilds(), new Function<UnitData, Integer>() {

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

        // public Integer getCostInt() {
        // return Integer.valueOf(getCost());
        // }

        public UnitData getDefaultChild() {
            return getChildByCode(DEFAULT_CHILD_CODE);
        }

        public boolean isDefaultChild() {
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

        public List<String> getAllBsw() {
            return getBsw();
        }

        public List<String> getAllCcw() {
            return getCcw();
        }

        public Integer getAvaNum() {
            return Strings.isNullOrEmpty(ava) ? null : (ava.equals("T") ? Integer.MAX_VALUE : Integer.valueOf(ava));
        }

        public boolean shouldSkipModelCount() {
            return getSpec().contains("G: Synchronized") || getSpec().contains("G: Servant")
                    || getSpec().contains("Antipode");
        }

        public boolean isPseudoUnit() {
            return Objects.equal(getAvaNum(), 0) || (Objects.equal(getCostNum(), 0) && Objects.equal(getSwcNum(), 0));
        }
    }

    public static String cleanName(String name) {
        return Strings.nullToEmpty(name).toLowerCase().replaceAll("[^a-z0-9]+", "_").replaceAll("(^_|_$)", "");
    }

    public FactionData getFactionDataByName(String factionName) {
        return factionAndSectorialDataByName.get(factionName);
    }
}
