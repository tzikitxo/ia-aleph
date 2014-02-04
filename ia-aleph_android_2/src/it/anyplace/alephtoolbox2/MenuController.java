package it.anyplace.alephtoolbox2;

import it.anyplace.alephtoolbox2.services.CurrentRosterService;
import it.anyplace.alephtoolbox2.services.PersistenceService;
import it.anyplace.alephtoolbox2.services.PersistenceService.RosterInfo;
import it.anyplace.alephtoolbox2.services.SourceDataService;
import it.anyplace.alephtoolbox2.services.SourceDataService.FactionData;
import it.anyplace.alephtoolbox2.services.SourceDataService.SectorialData;

import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.view.ViewGroup.LayoutParams;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.ImageView.ScaleType;
import android.widget.LinearLayout;
import android.widget.ListView;
import android.widget.Spinner;
import android.widget.TextView;

import com.google.common.base.Objects;
import com.google.common.base.Strings;
import com.google.common.collect.ComparisonChain;
import com.google.common.collect.Lists;
import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.Singleton;

@Singleton
public class MenuController {

    @Inject
    private Activity activity;

    @Inject
    private SourceDataService sourceDataService;
    private Button menuButton;

    @Inject
    private Provider<CurrentRosterService> currentRosterService;

    @Inject
    private Provider<UnitDetailController> unitDetailController;

    @Inject
    private Provider<AvailableUnitsController> availableUnitsController;
    @Inject
    private PersistenceService persistenceService;

    @Inject
    private void init() {
        menuButton = (Button) activity.findViewById(R.id.menuButton);
        menuButton.setOnClickListener(new OnClickListener() {

            @Override
            public void onClick(View v) {
                showMainMenu();
            }
        });
    }

    AlertDialog menuPopup;

    public void hideMenu() {
        if (menuPopup != null) {
            menuPopup.dismiss();
            menuPopup = null;
        }
    }

    public void showMainMenu() {
        hideMenu();
        View view = activity.getLayoutInflater().inflate(R.layout.main_menu, null);
        menuPopup = new AlertDialog.Builder(activity).setView(view)
                .setNegativeButton("CLOSE", new DialogInterface.OnClickListener() {

                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        hideMenu();
                    }
                }).show();
        ((Button) view.findViewById(R.id.newRosterMenuButton)).setOnClickListener(new OnClickListener() {

            @Override
            public void onClick(View v) {
                showNewRosterMenu();
            }
        });
        ((Button) view.findViewById(R.id.currentRosterOptionsMenuButton)).setOnClickListener(new OnClickListener() {

            @Override
            public void onClick(View v) {
                showRosterOptionsMenu();
            }
        });
        ((Button) view.findViewById(R.id.loadRosterMenuButton)).setOnClickListener(new OnClickListener() {

            @Override
            public void onClick(View v) {
                showLoadRosterMenu();
            }
        });
    }

    private AlertDialog.Builder prepareMenu(View view) {
        hideMenu();
        return new AlertDialog.Builder(activity).setView(view).setNegativeButton("BACK",
                new DialogInterface.OnClickListener() {

                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        showMainMenu();
                    }
                });
    }

    public void showNewRosterMenu() {
        LinearLayout view = (LinearLayout) activity.getLayoutInflater().inflate(R.layout.new_roster_menu, null);
        ListView listView = (ListView) view.findViewById(R.id.newRosterListView);
        // for (final FactionData factionData :
        // sourceDataService.getAllFactionsData()) {
        // Button button = new Button(activity);
        // button.setText(factionData.getFactionName());
        // button.setOnClickListener(new OnClickListener() {
        //
        // @Override
        // public void onClick(View v) {
        // currentRosterService.get().newRoster(factionData);
        // hideMenu();
        // }
        // });
        // view.addView(button);
        // }
        final List<FactionData> factions = Lists.newArrayList();
        for (final FactionData factionData : sourceDataService.getAllFactionsData()) {
            factions.add(factionData);
            // ImageButton button = new ImageButton(activity);
            // // button.setText(factionData.getFactionName());
            // button.setImageResource(activity.getResources().getIdentifier(
            // "unitlogo_" + factionData.getCleanFactionName(), "drawable",
            // activity.getPackageName()));
            // // button.getLayoutParams().width =
            // button.getLayoutParams().height
            // // = 32;
            // button.setLayoutParams(new LinearLayout.LayoutParams(32, 32));
            // // view.getL
            // // )
            // button.setScaleType(ScaleType.FIT_CENTER);
            // button.setOnClickListener(new OnClickListener() {
            //
            // @Override
            // public void onClick(View v) {
            // currentRosterService.get().newRoster(factionData);
            // hideMenu();
            // }
            // });
            // view.addView(button);
            for (final FactionData sectorialData : sourceDataService.getSectorialDatabyFaction(factionData
                    .getFactionName())) {
                factions.add(sectorialData);
                // button.setImageResource(activity.getResources().getIdentifier(
                // "unitlogo_" + sectorialData.getCleanSectorialName(),
                // "drawable", activity.getPackageName()));
                //
                // // button.getLayoutParams().width =
                // // button.getLayoutParams().height = 24;
                // button.setLayoutParams(new LinearLayout.LayoutParams(24,
                // 24));
                // button.setScaleType(ScaleType.FIT_CENTER);
                // button.setOnClickListener(new OnClickListener() {
                //
                // @Override
                // public void onClick(View v) {
                // currentRosterService.get().newRoster(sectorialData);
                // hideMenu();
                // }
                // });
            }
        }
        listView.setAdapter(new ArrayAdapter<FactionData>(activity, R.layout.new_roster_menu_record, factions) {

            @Override
            public View getView(int position, View convertView, ViewGroup parent) {
                if (convertView == null) {
                    convertView = LayoutInflater.from(activity).inflate(R.layout.new_roster_menu_record, null);
                }
                FactionData factionData = getItem(position);

                ((TextView) convertView.findViewById(R.id.newRosterMenuFactionName)).setText(Strings
                        .nullToEmpty(factionData.isSectorial() ? factionData.getSectorialName() : factionData
                                .getFactionName()));

                ((ImageView) convertView.findViewById(R.id.newRosterMenuFactionIcon)).setImageResource(activity
                        .getResources().getIdentifier("unitlogo_" + factionData.getCleanFactionOrSectorialName(),
                                "drawable", activity.getPackageName()));
                return convertView;
            }

        });
        listView.setOnItemClickListener(new OnItemClickListener() {

            @Override
            public void onItemClick(AdapterView<?> arg0, View arg1, int index, long arg3) {
                FactionData factionData = factions.get(index);
                currentRosterService.get().newRoster(factionData);
                hideMenu();
            }
        });
        menuPopup = prepareMenu(view).show();
    }

    public void showLoadRosterMenu() {
        LinearLayout view = (LinearLayout) activity.getLayoutInflater().inflate(R.layout.load_roster_menu, null);
        ListView listView = (ListView) view.findViewById(R.id.saverRostersListView);

        final List<RosterInfo> savedRostesInfo = Lists.newArrayList(persistenceService.getAllRosterInfo());
        Collections.sort(savedRostesInfo, new Comparator<RosterInfo>() {

            @Override
            public int compare(RosterInfo lhs, RosterInfo rhs) {
                return -ComparisonChain.start().compare(lhs.getDateMod(), rhs.getDateMod()).result();
            }
        });

        listView.setAdapter(new ArrayAdapter<RosterInfo>(activity, R.layout.load_roster_menu_record, savedRostesInfo) {

            @Override
            public View getView(int position, View convertView, ViewGroup parent) {
                if (convertView == null) {
                    convertView = LayoutInflater.from(activity).inflate(R.layout.load_roster_menu_record, null);
                }
                RosterInfo rosterInfo = getItem(position);

                ((TextView) convertView.findViewById(R.id.loadRosterMenuRecordRosterName)).setText(Strings
                        .nullToEmpty(rosterInfo.getListName()));
                ((TextView) convertView.findViewById(R.id.loadRosterMenuRecordRosterId)).setText(Strings
                        .nullToEmpty(rosterInfo.getListId()));
                ((TextView) convertView.findViewById(R.id.loadRosterMenuRecordFactionSectorialName)).setText(Objects
                        .firstNonNull(Strings.emptyToNull(rosterInfo.getSectorial()), rosterInfo.getFaction()));
                ((TextView) convertView.findViewById(R.id.loadRosterMenuRecordRosterLastMod)).setText(rosterInfo
                        .getDateModAsDate().toString());
                ((TextView) convertView.findViewById(R.id.loadRosterMenuRecordRosterSize)).setText(rosterInfo.getPcap()
                        + " pts / " + rosterInfo.getModelCount() + " models");

                ((ImageView) convertView.findViewById(R.id.loadRosterMenuRecordFactionIcon)).setImageResource(activity
                        .getResources().getIdentifier("unitlogo_" + rosterInfo.getCleanFactionorSectorial(),
                                "drawable", activity.getPackageName()));
                return convertView;
            }

        });
        listView.setOnItemClickListener(new OnItemClickListener() {

            @Override
            public void onItemClick(AdapterView<?> arg0, View arg1, int index, long arg3) {
                RosterInfo rosterInfo = savedRostesInfo.get(index);
                currentRosterService.get().loadRoster(rosterInfo.getListId());
                hideMenu();
            }
        });
        menuPopup = prepareMenu(view).show();
    }

    public void showRosterOptionsMenu() {
        LinearLayout view = (LinearLayout) activity.getLayoutInflater().inflate(R.layout.roster_opions_menu, null);
        // for (final FactionData factionData :
        // sourceDataService.getAllFactionsData()) {
        // Button button = new Button(activity);
        // button.setText(factionData.getFactionName());
        // button.setOnClickListener(new OnClickListener() {
        //
        // @Override
        // public void onClick(View v) {
        // currentRosterService.get().newRoster(factionData);
        // hideMenu();
        // }
        // });
        // view.addView(button);
        // }
        final Spinner spinner = (Spinner) view.findViewById(R.id.currentRosterPointLimitSpiner);
        // Create an ArrayAdapter using the string array and a default spinner
        // layout
        ArrayAdapter<Integer> adapter = new ArrayAdapter<Integer>(activity, android.R.layout.simple_spinner_item,
                Arrays.asList(50, 100, 150, 200, 250, 300, 350, 400, 450, 500));
        // adapter.
        spinner.setAdapter(adapter);
        spinner.setSelection(currentRosterService.get().getPointCap() / 50 - 1);
        // Specify the layout to use when the list of choices appears
        // adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        // Apply the adapter to the spinner
        // spinner.setAdapter(adapter);

        menuPopup = prepareMenu(view).setPositiveButton("CONFIRM", new DialogInterface.OnClickListener() {

            @Override
            public void onClick(DialogInterface dialog, int which) {
                currentRosterService.get().setPointCap((Integer) spinner.getSelectedItem());
                hideMenu();
            }
        }).show();
    }

}
