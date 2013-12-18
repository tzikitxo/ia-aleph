package it.anyplace.alephtoolbox2;

import it.anyplace.alephtoolbox2.services.CurrentRosterService;
import it.anyplace.alephtoolbox2.services.SourceDataService;
import it.anyplace.alephtoolbox2.services.SourceDataService.FactionData;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.LinearLayout;

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
        menuPopup = new AlertDialog.Builder(activity)
                .setView(activity.getLayoutInflater().inflate(R.layout.main_menu, null))
                .setNegativeButton("CLOSE", new DialogInterface.OnClickListener() {

                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        hideMenu();
                    }
                }).show();
        ((Button) activity.findViewById(R.id.newRosterMenuButton)).setOnClickListener(new OnClickListener() {

            @Override
            public void onClick(View v) {
                showNewRosterMenu();
            }
        });
    }

    public void showNewRosterMenu() {
        hideMenu();
        LinearLayout view = (LinearLayout) activity.getLayoutInflater().inflate(R.layout.new_roster_menu, null);
        for (final FactionData factionData : sourceDataService.getAllFactionsData()) {
            Button button = new Button(activity);
            button.setText(factionData.getFactionName());
            button.setOnClickListener(new OnClickListener() {

                @Override
                public void onClick(View v) {
                    currentRosterService.get().newRoster(factionData);
                }
            });
            view.addView(button);
        }

        menuPopup = new AlertDialog.Builder(activity).setView(view)
                .setNegativeButton("BACK", new DialogInterface.OnClickListener() {

                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        showMainMenu();
                    }
                }).show();
    }

}
