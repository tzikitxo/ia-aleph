package it.anyplace.alephtoolbox2;

import it.anyplace.alephtoolbox2.services.CurrentRosterService;
import it.anyplace.alephtoolbox2.services.PersistenceService;
import it.anyplace.alephtoolbox2.services.RosterDataService;
import it.anyplace.alephtoolbox2.services.RosterDataService.RosterData;
import it.anyplace.alephtoolbox2.services.RosterSynchronizationService;
import it.anyplace.alephtoolbox2.services.SourceDataService;

import java.util.Arrays;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;

import com.androidquery.util.AQUtility;
import com.google.common.base.Strings;
import com.google.common.eventbus.EventBus;
import com.google.gson.Gson;
import com.google.inject.AbstractModule;
import com.google.inject.Guice;
import com.google.inject.Inject;
import com.google.inject.Injector;

public class MainActivity extends Activity {

    @Inject
    private CurrentRosterService currentListService;
    @Inject
    private SourceDataService sourceDataService;
    @Inject
    private RosterSynchronizationService rosterSynchronizationService;
    @Inject
    private PersistenceService persistenceService;
    @Inject
    private RosterDataService rosterDataService;

    @Inject
    private EventBus eventBus;

    public void showErrorAlert(String errorMessage, Throwable exception) {
        Log.e("showErrorAlert", errorMessage, exception);
        new AlertDialog.Builder(this).setTitle("Error").setMessage(errorMessage + " " + exception)
                .setPositiveButton(android.R.string.ok, new DialogInterface.OnClickListener() {
                    public void onClick(DialogInterface dialog, int which) {
                        dialog.dismiss();
                    }
                }).setIcon(android.R.drawable.ic_dialog_alert).show();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main_view);
        // setContentView(R.layout.loading_screen);

        new AsyncTask<Void, Object, Object>() {
            // ProgressBar progressBar;
            // TextView loadingInfo;
            private ProgressDialog progressDialog;
            // private int progress;
            private Injector injector;

            @Override
            protected void onPreExecute() {
                progressDialog = ProgressDialog.show(MainActivity.this, "Aleph Toolbox is loading ...", "preparing...",
                        true);
                // progressBar = (ProgressBar)
                // findViewById(R.id.loadingProgressBar);
                // progressBar.setProgress(progress = 5);
                //
                // loadingInfo = (TextView) findViewById(R.id.loadingInfo);
                // loadingInfo.setText("preparing ...");
            }

            @Override
            protected void onProgressUpdate(Object... values) {
                progressDialog.setMessage((String) values[0]);
                Log.d("onProgressUpdate", (String) values[0]);
                // progressBar.setProgress((Integer) values[0]);
                // loadingInfo.setText((String) values[1]);
            }

            @Override
            protected Object doInBackground(Void... params) {

                // Log.d("onProgressUpdate", "initializing...");
                try {
                    publishProgress("initializing...");
                    injector = Guice.createInjector(new AbstractModule() {

                        @Override
                        public void configure() {
                            // bind(MainActivity.class).toInstance(MainActivity.this);
                            bind(Context.class).toInstance(MainActivity.this);
                            bind(Activity.class).toInstance(MainActivity.this);
                            bind(Gson.class).asEagerSingleton();
                            bind(EventBus.class).asEagerSingleton();
                        }
                    });

                    // init services
                    for (Class<?> serviceClass : Arrays.asList(PersistenceService.class, SourceDataService.class,
                            CurrentRosterService.class, RosterSynchronizationService.class)) {
                        publishProgress("loading service : " + serviceClass.getSimpleName());
                        // Log.d("onProgressUpdate", "loading service : " +
                        // serviceClass.getSimpleName());
                        injector.getInstance(serviceClass);

                    }
                    publishProgress("loading interface...");
                    return null;
                } catch (Throwable ex) {
                    return ex;
                }

            }

            @Override
            protected void onPostExecute(Object result) {
                if (result instanceof Throwable) {
                    progressDialog.dismiss();
                    showErrorAlert("error initializing app", (Throwable) result);
                } else {
                    Log.d("onProgressUpdate", "loading interface...");
                    injector.getInstance(ViewFlipperController.class);
                    injector.getInstance(CurrentRosterController.class);
                    injector.getInstance(AvailableUnitsController.class);
                    injector.getInstance(UnitDetailController.class);
                    injector.getInstance(MenuController.class);

                    injector.injectMembers(MainActivity.this);

                    progressDialog.dismiss();

                    RosterData rosterData = null;
                    Intent intent = getIntent();
                    try {
                        String listStr = intent.getData().getQueryParameter("list");
                        if (!Strings.isNullOrEmpty(listStr)) {
                            rosterData = rosterDataService.deserializeRosterData(listStr);
                        }
                    } catch (Exception ex) {
                        Log.w("MainActivity", "error parsing roster from intent = " + intent.getDataString(), ex);
                    }
                    if (rosterData == null)
                        rosterData = persistenceService.getLastSavedRoster();
                    if (rosterData != null) {
                        currentListService.loadRoster(rosterData);
                    } else {
                        currentListService.newRoster(sourceDataService.getFactionDataByName("Panoceania"));
                    }

                    rosterSynchronizationService.loadNewListIfAvailableOnNextSynchronization()
                            .startSynchronizationJob();
                }
            }

        }.execute();
    }

    @Override
    protected void onPause() {
        Log.i("MainActivity", "onPause");
        super.onPause();
        if (rosterSynchronizationService != null) {
            rosterSynchronizationService.stopSynchronizationJob();
        }
    }

    @Override
    protected void onResume() {
        Log.i("MainActivity", "onResume");
        super.onResume();
        if (rosterSynchronizationService != null) {
            rosterSynchronizationService.loadNewListIfAvailableOnNextSynchronization().startSynchronizationJob();
        }

    }

    protected void onDestroy() {
        Log.i("MainActivity", "onDestroy");
        super.onDestroy();

        // clean the file cache when root activity exit
        // the resulting total cache size will be less than 3M
        if (isTaskRoot()) {
            AQUtility.cleanCacheAsync(this);
        }
    }

}
