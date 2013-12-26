package it.anyplace.alephtoolbox2.services;

import it.anyplace.alephtoolbox2.R;
import it.anyplace.alephtoolbox2.services.RosterDataService.RosterData;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

import org.json.JSONObject;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.util.Base64;
import android.util.Log;

import com.androidquery.AQuery;
import com.androidquery.callback.AjaxCallback;
import com.androidquery.callback.AjaxStatus;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableMap;
import com.google.common.eventbus.EventBus;
import com.google.gson.Gson;
import com.google.inject.Inject;
import com.google.inject.Provider;
import com.google.inject.Singleton;

@Singleton
public class RosterSynchronizationService {

    private final ScheduledExecutorService executorService = Executors.newSingleThreadScheduledExecutor();

    @Inject
    private EventBus eventBus;
    @Inject
    private Activity activity;
    @Inject
    private Gson gson;
    @Inject
    private Provider<PersistenceService> persistenceService;
    @Inject
    private Provider<CurrentRosterService> currentRosterService;

    @Inject
    private void init() {
        eventBus.register(this);

    }

    private String geWsUrl(String action) {
        String remoteUrl = activity.getResources().getString(R.string.remoteSynchronization_serviceUrl);
        String wsCall = remoteUrl + "?action=" + action + "&deviceId=" + getDeviceId() + "&requestId="
                + persistenceService.get().newId();
        return wsCall;
    }

    // private String geWsUrl(String action, String key, String value) {
    // return geWsUrl(action) + "&" + key + "=" + value;
    // }
    //
    // private String geWsUrl(String action, Object value) {
    // return geWsUrl(action,"b64data",Base64.encodeToString(gson.toJson(value),
    // Base64.)
    // }

    private <T> void callWs(String url, final Class<T> responseClass, final Callback<T> callback) {
        callWs(url, Collections.<String, Object> emptyMap(), responseClass, callback);
    }

    private <T> void callWs(String url, Map<String, Object> data, final Class<T> responseClass,
            final Callback<T> callback) {
        Log.d("RosterSynchronizationService", "callWs url = " + url + " , data = " + data);
        new AQuery(activity).ajax(url, data, JSONObject.class, new AjaxCallback<JSONObject>() {

            @Override
            public void callback(String url, JSONObject object, AjaxStatus status) {
                try {
                    if (object != null) {
                        T response = gson.fromJson(object.toString(), responseClass);
                        if (!(response instanceof RemoteResponse) || ((RemoteResponse) response).success) {
                            if (callback != null) {
                                callback.call(response);
                            }
                        } else {
                            Log.w("RosterSynchronizationService", "error calling remote ws = "
                                    + (response instanceof RemoteResponse ? ((RemoteResponse) response).message
                                            : "(no response)"));

                        }
                    }
                } catch (Exception e) {
                    Log.w("RosterSynchronizationService", "error calling remote ws", e);
                }
            }

        });
    }

    private void synchronizeWithRemote() {
        callWs(geWsUrl("listData"), ListDataResponse.class, new Callback<ListDataResponse>() {

            @Override
            public void call(ListDataResponse response) {
                Log.i("RosterSynchronizationService", "listed remote data = " + response.data);
            }
        });
    }

    private void sendDataToRemote(String key, Object data) {
        callWs(geWsUrl("storeData"),
                ImmutableMap.<String, Object> of("key", key, "b64data",
                        Base64.encodeToString(gson.toJson(data).getBytes(), Base64.NO_WRAP)), RemoteResponse.class,
                new Callback<RemoteResponse>() {

                    @Override
                    public void call(RemoteResponse response) {
                        Log.i("RosterSynchronizationService", "storeData success");
                    }
                });
    }

    public void sendCurrentRosterToRemote() {
        Log.i("RosterSynchronizationService", "sendCurrentRosterToRemote");
        RosterData rosterData = currentRosterService.get().exportCurrentRoster();
        String rosterKey = "savedList." + rosterData.getListId(), lastSavedListkey = "lastSavedList";
        LastSavedListInfo lastSavedListValue = new LastSavedListInfo(rosterData);
        sendDataToRemote(rosterKey, rosterData);
        sendDataToRemote(lastSavedListkey, lastSavedListValue);

    }

    private interface Callback<E> {
        public void call(E response);
    }

    private static class LastSavedListInfo {
        public String data;
        public String dateMod;

        public LastSavedListInfo() {
        }

        public LastSavedListInfo(RosterData rosterData) {
            data = rosterData.getListId();
            dateMod = rosterData.getDateMod().toString();
        }
    }

    private static class RemoteResponse {
        public String message;
        public boolean success;
    }

    private static class ListDataResponse extends RemoteResponse {
        public Map<String,ListDataRecord> data;

        private static class ListDataRecord {
            public boolean deleted;
            public String key;
            public long dateMod;

        }
    }

    public static final String DEVICE_ID_PREFERENCE = "deviceId";

    public String getDeviceId() {
        SharedPreferences preferences = activity.getPreferences(Context.MODE_PRIVATE);
        String deviceId = preferences.getString(DEVICE_ID_PREFERENCE, null);
        if (Strings.isNullOrEmpty(deviceId)) {
            deviceId = persistenceService.get().newId();
            preferences.edit().putString(DEVICE_ID_PREFERENCE, deviceId).commit();
        }
        return deviceId;
    }

    private ScheduledFuture future;

    public void stopSynchronizationJob() {
        if (future != null) {
            Log.i("RosterSynchronizationService", "stopSynchronizationJob");
            future.cancel(true);
            future = null;
        }
    }

    public void startSynchronizationJob() {
        stopSynchronizationJob();
        int delay = activity.getResources().getInteger(R.integer.remoteSynchronization_synchronizationDelay), period = activity
                .getResources().getInteger(R.integer.remoteSynchronization_synchronizationPeriod);
        Log.i("RosterSynchronizationService", "startSynchronizationJob");
        future = executorService.scheduleAtFixedRate(new Runnable() {

            @Override
            public void run() {
                synchronizeWithRemote();
            }

        }, delay, period, TimeUnit.SECONDS);

    }

}
