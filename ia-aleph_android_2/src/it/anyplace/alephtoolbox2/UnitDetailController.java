package it.anyplace.alephtoolbox2;

import it.anyplace.alephtoolbox2.services.CurrentRosterService;
import it.anyplace.alephtoolbox2.services.CurrentRosterService.RosterLoadEvent;
import it.anyplace.alephtoolbox2.services.SourceDataService;
import it.anyplace.alephtoolbox2.services.SourceDataService.UnitData;

import java.util.Collection;
import java.util.List;

import android.app.Activity;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.AdapterView.OnItemLongClickListener;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import com.androidquery.AQuery;
import com.google.common.base.Joiner;
import com.google.common.base.Objects;
import com.google.common.base.Strings;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.google.common.eventbus.EventBus;
import com.google.common.eventbus.Subscribe;
import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.Singleton;

@Singleton
public class UnitDetailController {

    @Inject
    private CurrentRosterService sessionService;

    @Inject
    private SourceDataService unitDataService;
    @Inject
    private Activity activity;
    @Inject
    private ViewFlipperController viewFlipperController;
    @Inject
    private EventBus eventBus;
    @Inject
    private Provider<CurrentRosterService> currentRosterService;

    private TextView unitDetailName, unitDetailCode, unitDetailCostAndSwc, unitDetailType, unitDetailMov, unitDetailCc,
            unitDetailBs, unitDetailPh, unitDetailWip, unitDetailArm, unitDetailBts, unitDetailW, unitDetailSpecs;
    private ImageView unitDetailImage;
    private ListView unitDetailChildsListView;
    private List<UnitData> childs = Lists.newArrayList();

    // public interface UnitDetailChildUnitSelectedEvent {
    // public UnitData getUnitData();
    // }

    @Inject
    private void init() {
        unitDetailName = (TextView) activity.findViewById(R.id.unitDetailName);
        unitDetailCode = (TextView) activity.findViewById(R.id.unitDetailCode);
        unitDetailCostAndSwc = (TextView) activity.findViewById(R.id.unitDetailCostAndSwc);
        // unitDetailSwc = (TextView) activity.findViewById(R.id.unitDetailSwc);
        unitDetailType = (TextView) activity.findViewById(R.id.unitDetailType);
        unitDetailMov = (TextView) activity.findViewById(R.id.unitDetailMov);
        unitDetailCc = (TextView) activity.findViewById(R.id.unitDetailCc);
        unitDetailBs = (TextView) activity.findViewById(R.id.unitDetailBs);
        unitDetailPh = (TextView) activity.findViewById(R.id.unitDetailPh);
        unitDetailWip = (TextView) activity.findViewById(R.id.unitDetailWip);
        unitDetailArm = (TextView) activity.findViewById(R.id.unitDetailArm);
        unitDetailBts = (TextView) activity.findViewById(R.id.unitDetailBts);
        unitDetailW = (TextView) activity.findViewById(R.id.unitDetailW);
        unitDetailSpecs = (TextView) activity.findViewById(R.id.unitDetailSpecs);
        unitDetailImage = (ImageView) activity.findViewById(R.id.unitDetailImage);
        unitDetailChildsListView = (ListView) activity.findViewById(R.id.unitDetailChildsListView);
        eventBus.register(this);

        unitDetailChildsListView.setOnItemClickListener(new OnItemClickListener() {

            // private long lastClickTime = 0;

            @Override
            public void onItemClick(AdapterView<?> arg0, View view, int index, long arg3) {
                final UnitData newUnit = childs.get(index);
                // long thisClickedTime = System.currentTimeMillis();
                if (lastClickedUnit == newUnit
                // && (thisClickedTime - lastClickTime) < 1000
                ) {
                    addUnit(newUnit);
                } else {
                    lastClickedUnit = newUnit;
                    // lastClickTime = thisClickedTime;
                    // selectedIndex = index;
                    // unitDetailChildsListView.setSelection(index);
                    loadUnitDetail(newUnit);
                }
            }
        });
        unitDetailChildsListView.setOnItemLongClickListener(new OnItemLongClickListener() {

            @Override
            public boolean onItemLongClick(AdapterView<?> arg0, View arg1, int index, long arg3) {
                UnitData newUnit = childs.get(index);
                if (lastClickedUnit != newUnit) {
                    loadUnitDetail(newUnit);
                }
                addUnit(newUnit);
                return true;
            }

        });
    }

    private UnitData lastClickedUnit;

    private void addUnit(final UnitData newUnit) {
        Toast.makeText(activity,
                activity.getResources().getString(R.string.app_toast_addedUnit, newUnit.getName(), newUnit.getCode()),
                activity.getResources().getInteger(R.integer.toastDelay)).show();
        currentRosterService.get().addUnit(newUnit);
        // eventBus.post(new UnitDetailChildUnitSelectedEvent() {
        //
        // @Override
        // public UnitData getUnitData() {
        // return newUnit;
        // }
        // });
    }

    // private int selectedIndex = -1;

    // @Subscribe
    // public void handleArmyListUnitSelectedEvent(
    // ArmyListUnitSelectedEvent armyListUnitSelectedEvent) {
    // openUnitDetail(armyListUnitSelectedEvent.getUnitRecord().getUnitData());
    // }
    //
    // @Subscribe
    // public void handleAvailableUnitsUnitSelectedEvent(
    // AvailableUnitsUnitSelectedEvent availableUnitsUnitSelectedEvent) {
    // openUnitDetail(availableUnitsUnitSelectedEvent.getUnitData()
    // .getDefaultChild());
    // }

    @Subscribe
    public void loadFaction(RosterLoadEvent event) {
        Collection<UnitData> allAvailableUnits = unitDataService.getAvailableUnitData();
        if (!allAvailableUnits.isEmpty()) {
            loadUnitDetail(allAvailableUnits.iterator().next());
        }
    }

    // public void loadUnitDetail(UnitData unitData) {
    // loadUnitDetail(unitData, true);
    // }

    private UnitData currentUnitData;

    public void loadUnitDetail(UnitData unitData) {
        boolean changedIsc = (currentUnitData == null || !Objects.equal(currentUnitData.getIsc(), unitData.getIsc()));
        unitDetailCode.setText(Strings.nullToEmpty(unitData.getCode()));
        unitDetailCostAndSwc.setText(Strings.nullToEmpty(unitData.getCost()) + (unitData.getSwcNum() != 0 ? ("  " + unitData.getSwc()) : ""));
        unitDetailSpecs.setText(Joiner.on(", ").join(unitData.getSpec()));
        if (changedIsc) {
            unitDetailName.setText(unitData.getName());
            // unitDetailSwc.setText(unitData.getSwc());
            unitDetailType.setText(unitData.getType());
            unitDetailMov.setText(unitData.getMov());
            unitDetailCc.setText(unitData.getCc());
            unitDetailBs.setText(unitData.getBs());
            unitDetailPh.setText(unitData.getPh());
            unitDetailWip.setText(unitData.getWip());
            unitDetailArm.setText(unitData.getArm());
            unitDetailBts.setText(unitData.getBts());
            unitDetailW.setText(unitData.getW());

            childs = Lists.newArrayList(unitData.getParent().getChilds());
            Log.i("UnitDetailController", "child units = " + childs);

            unitDetailChildsListView.setAdapter(new ArrayAdapter<UnitData>(activity, R.layout.unit_detail_child_record,
                    childs) {

                @Override
                public View getView(int position, View convertView, ViewGroup parent) {
                    if (convertView == null) {
                        convertView = LayoutInflater.from(activity).inflate(R.layout.unit_detail_child_record, null);
                    }
                    UnitData unitData = getItem(position);

                    ((TextView) convertView.findViewById(R.id.unitDetailChildRecordCode)).setText(unitData
                            .getDisplayCode());

                    ((TextView) convertView.findViewById(R.id.unitDetailChildRecordSwc)).setText(unitData.getSwc());
                    ((TextView) convertView.findViewById(R.id.unitDetailChildRecordCost)).setText(unitData.getCost());

                    Joiner joiner = Joiner.on(", ");
                    ((TextView) convertView.findViewById(R.id.unitDetailChildRecordWeapons)).setText(joiner
                            .join(Iterables.concat(unitData.getAllBsw(), unitData.getAllCcw())));
                    // ((TextView) convertView
                    // .findViewById(R.id.unitDetailChildRecordCcw))
                    // .setText(joiner.join(unitData.getChildCcw()));
                    ((TextView) convertView.findViewById(R.id.unitDetailChildRecordSpec)).setText(joiner.join(unitData
                            .getChildSpec()));

                    return convertView;
                }

            });
            unitDetailChildsListView.setSelection(childs.indexOf(unitData));
        }

        if (currentUnitData == null || !unitData.getCbcode().equals(currentUnitData.getCbcode())) {
            unitDetailImage.setImageResource(R.drawable.missing_logo_big);
            if (!unitData.getCbcode().isEmpty()) {
                String cbCode = unitData.getCbcode().get(0);// TODO slideshow
                final String url = "http://www.infinitythegame.com/infinity/catalogo/" + cbCode + "-recorte.png";
                new AQuery(activity).id(unitDetailImage).image(url);
            }
        }
        currentUnitData = unitData;
    }

    public void openUnitDetail(UnitData unitData) {
        loadUnitDetail(unitData);
        viewFlipperController.showUnitDetailView();
    }
}
