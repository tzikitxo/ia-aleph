package it.anyplace.alephtoolbox2;

import it.anyplace.alephtoolbox2.services.CurrentRosterService;
import it.anyplace.alephtoolbox2.services.CurrentRosterService.RosterLoadEvent;
import it.anyplace.alephtoolbox2.services.CurrentRosterService.RosterUpdateEvent;
import it.anyplace.alephtoolbox2.services.CurrentRosterService.UnitRecord;
import it.anyplace.alephtoolbox2.services.RosterSynchronizationService.RemoteActivityEvent;
import it.anyplace.alephtoolbox2.services.SourceDataService.UnitData;
import it.anyplace.alephtoolbox2.services.RosterDataService;
import it.anyplace.alephtoolbox2.services.SourceDataService;

import java.util.List;

import android.app.Activity;
import android.graphics.Color;
import android.transition.Visibility;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.AdapterView.OnItemLongClickListener;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import com.google.common.base.Joiner;
import com.google.common.eventbus.EventBus;
import com.google.common.eventbus.Subscribe;
import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.Singleton;

@Singleton
public class CurrentRosterController {

    @Inject
    private Activity activity;

    @Inject
    private EventBus eventBus;
    @Inject
    private RosterDataService armylistService;
    @Inject
    private CurrentRosterService currentListService;
    // @Inject
    // private UnitDetailController unitDetailController;
    @Inject
    private SourceDataService dataService;

    private ListView mainRosterList;
    private TextView currentRosterPointsInfo, currentRosterSwcInfo, currentRosterModelsInfo,
            currentRosterValidationNotes;
    private View currentRosterValidationNotesContainer;
    private ProgressBar remoteProgressBar;
    @Inject
    private ViewFlipperController viewFlipperController;
    @Inject
    private Provider<UnitDetailController> unitDetailController;

    @Inject
    private Provider<CurrentRosterService> currentRosterService;

    // public interface ArmyListUnitSelectedEvent {
    // public UnitRecord getUnitRecord();
    // }

    @Subscribe
    public void handleRemoteActivityEvent(final RemoteActivityEvent event) {
        switch (event) {
        case REMOTE_ACTIVITY_COMPLETED:
            remoteProgressBar.setVisibility(View.INVISIBLE);
            break;
        case REMOTE_ACTIVITY_IN_PROGRESS:
            remoteProgressBar.setVisibility(View.VISIBLE);
            break;
        }
    }

    @Inject
    private void init() {
        mainRosterList = (ListView) activity.findViewById(R.id.mainRosterList);
        currentRosterPointsInfo = (TextView) activity.findViewById(R.id.currentRosterPointsInfo);
        currentRosterSwcInfo = (TextView) activity.findViewById(R.id.currentRosterSwcInfo);
        currentRosterModelsInfo = (TextView) activity.findViewById(R.id.currentRosterModelsInfo);
        currentRosterValidationNotes = (TextView) activity.findViewById(R.id.currentRosterValidationNotes);
        currentRosterValidationNotesContainer = (View) activity
                .findViewById(R.id.currentRosterValidationNotesContainer);
        remoteProgressBar = (ProgressBar) activity.findViewById(R.id.remoteSynchronizationProgressbar);

        eventBus.register(this);

        mainRosterList.setOnItemClickListener(new OnItemClickListener() {

            @Override
            public void onItemClick(AdapterView<?> adapterView, View arg1, int index, long arg3) {
                final UnitRecord unitRecord = currentListService.getUnitRecords().get(index);
                unitDetailController.get().openUnitDetail(unitRecord.getUnitData());
                // unitDetailController.openUnitDetail(unitRecord.getUnitData());
                // eventBus.post(new ArmyListUnitSelectedEvent() {
                //
                // @Override
                // public UnitRecord getUnitRecord() {
                // return unitRecord;
                // }
                // });
            }
        });
        mainRosterList.setOnItemLongClickListener(new OnItemLongClickListener() {

            @Override
            public boolean onItemLongClick(AdapterView<?> arg0, View arg1, int index, long arg3) {
                UnitRecord unitRecord = currentListService.getUnitRecords().get(index);
                Toast.makeText(
                        activity,
                        activity.getResources().getString(R.string.app_toast_removedUnit,
                                unitRecord.getUnitData().getName(), unitRecord.getUnitData().getCode()),
                        activity.getResources().getInteger(R.integer.toastDelay)).show();
                currentRosterService.get().removeUnitRecord(unitRecord);
                return true;
            }
        });

    }

    @Subscribe
    public void handleArmyListLoadEvent(RosterLoadEvent event) {
        loadArmylist();
    }

    @Subscribe
    public void handleArmyListUpdateEvent(RosterUpdateEvent event) {
        loadArmylist();
        // viewFlipperController.showArmyListView();
    }

    private void loadArmylist() {
        // reset();
        List<UnitRecord> unitRecords = currentListService.getUnitRecords();
        // ArrayAdapter<String> adapter = new ArrayAdapter<String>(activity,
        // android.R.layout.simple_list_item_1, Lists.transform(
        // unitRecords,
        // new Function<UnitRecord, String>() {
        //
        // @Override
        // public String apply(UnitRecord model) {
        // return model.getIsc();
        // }
        // }));
        ArrayAdapter<UnitRecord> adapter = new ArrayAdapter<UnitRecord>(activity, R.layout.current_roster_record,
                unitRecords) {

            @Override
            public View getView(int position, View convertView, ViewGroup parent) {
                if (convertView == null) {
                    convertView = LayoutInflater.from(activity).inflate(R.layout.current_roster_record, null);
                }
                UnitRecord unitRecord = getItem(position);
                UnitData unitData = unitRecord.getUnitData();
                TextView armyListRecordIsc = ((TextView) convertView.findViewById(R.id.armyListRecordName));
                armyListRecordIsc.setText(unitData.getName());
                if (unitRecord.hasError()) {
                    armyListRecordIsc.setTextColor(Color.RED);
                } else {
                    if (unitData.isIrregular()) {
                        armyListRecordIsc.setTextColor(Color.YELLOW);
                    } else if (unitData.isSynchronizedUnit()) {
                        armyListRecordIsc.setTextColor(Color.CYAN);
                    } else {
                        armyListRecordIsc.setTextColor(Color.WHITE); // TODO get
                                                                     // default
                                                                     // color
                    }
                }
                ((TextView) convertView.findViewById(R.id.armyListRecordCode)).setText(unitData.isDefaultChild() ? ""
                        : unitData.getCode());

                // UnitData unitData = dataService.getUnitDataByIscCode(
                // unitRecord.getIsc(), unitRecord.getCode());

                ((TextView) convertView.findViewById(R.id.armyListRecordCost)).setText(unitData.isPseudoUnit() ? ""
                        : unitData.getCost());
                ((TextView) convertView.findViewById(R.id.armyListRecordSwc)).setText(unitData.isPseudoUnit() ? ""
                        : unitData.getSwc());

                ((ImageView) convertView.findViewById(R.id.armyListRecordIcon)).setImageResource(activity
                        .getResources().getIdentifier("unitlogo_" + unitRecord.getUnitData().getCleanIsc(), "drawable",
                                activity.getPackageName()));
                return convertView;
            }

        };
        mainRosterList.setAdapter(adapter);

        updateRosterInfo();
        // for(ArmyListUnit model:armylist.getModels()){
        // mainRosterList
        // }

    }

    private void updateRosterInfo() {
        currentRosterPointsInfo.setText(activity.getResources()
                .getString(R.string.app_roster_info_value, currentListService.getPointTotal(),
                        currentListService.getPointCap(), currentListService.getPointLeft()));
        currentRosterPointsInfo.setTextColor(currentListService.getPointLeft() < 0 ? Color.RED : Color.WHITE);
        currentRosterSwcInfo.setText(activity.getResources().getString(R.string.app_roster_info_value,
                currentListService.getSwcTotal(), currentListService.getSwcCap(), currentListService.getSwcLeft()));
        currentRosterSwcInfo.setTextColor(currentListService.getSwcLeft() < 0 ? Color.RED : Color.WHITE);
        currentRosterModelsInfo.setText(currentListService.getModelCount().toString());

        // currentRosterInfo.setText("points: " +
        // currentListService.getPointTotal() + "/"
        // + currentListService.getPointCap() + " (" +
        // currentListService.getPointLeft() + ")" + " swc: "
        // + currentListService.getSwcTotal() + "/" +
        // currentListService.getSwcCap() + " ("
        // + currentListService.getSwcLeft() + ")");

        if (currentListService.getValidationNotes().isEmpty()) {
            currentRosterValidationNotesContainer.setVisibility(View.GONE);
        } else {
            currentRosterValidationNotes.setText(Joiner.on(", ").join(currentListService.getValidationNotes()));
            currentRosterValidationNotesContainer.setVisibility(View.VISIBLE);
        }

    }
}
