package it.anyplace.alephtoolbox2.services;

import it.anyplace.alephtoolbox2.R;
import it.anyplace.alephtoolbox2.services.RosterDataService.RosterData;

import java.util.Collections;
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
import com.google.common.base.Objects;
import com.google.common.base.Predicate;
import com.google.common.base.Strings;
import com.google.common.collect.ImmutableMap;
import com.google.common.collect.Maps;
import com.google.common.eventbus.EventBus;
import com.google.common.eventbus.Subscribe;
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

    public static enum RemoteActivityEvent {
        REMOTE_ACTIVITY_IN_PROGRESS, REMOTE_ACTIVITY_COMPLETED
    }

    private int ajaxCallCount = 0;

    private void startAjaxCall() {
        if (ajaxCallCount++ == 0) {
            activity.runOnUiThread(new Runnable() {

                @Override
                public void run() {
                    eventBus.post(RemoteActivityEvent.REMOTE_ACTIVITY_IN_PROGRESS);
                }
            });
        }
    }

    private void completeAjaxCall() {
        if (--ajaxCallCount == 0) {

            activity.runOnUiThread(new Runnable() {

                @Override
                public void run() {
                    eventBus.post(RemoteActivityEvent.REMOTE_ACTIVITY_COMPLETED);
                }
            });
        }
    }

    private String geWsUrl(String action) {
        String remoteUrl = activity.getResources().getString(R.string.remoteSynchronization_serviceUrl);
        String wsCall = remoteUrl + "?action=" + action + "&deviceId=" + getDeviceId() + "&requestId="
                + persistenceService.get().newId();
        return wsCall;
    }

    private <T> void callWs(String url, final Class<T> responseClass, final Callback<T> callback) {
        callWs(url, Collections.<String, Object> emptyMap(), responseClass, callback);
    }

    private <T> void callWs(String url, Map<String, Object> data, final Class<T> responseClass,
            final Callback<T> callback) {
        Log.d("RosterSynchronizationService", "callWs url = " + url + " , data = " + data);
        startAjaxCall();
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
                    Log.w("RosterSynchronizationService", "error processing response = " + object, e);
                } finally {
                    completeAjaxCall();
                }
            }

        });
    }

    public RosterSynchronizationService loadNewListIfAvailableOnNextSynchronization() {
        this.loadNewListIfAvailable = true;
        return this;
    }

    public static final String LIST_DATA_RECORD_PREFIX = "savedList.";

    private boolean loadNewListIfAvailable = true;

    private void synchronizeWithRemote() {
        callWs(geWsUrl("listData"), ListDataResponse.class, new Callback<ListDataResponse>() {

            @Override
            public void call(ListDataResponse response) {
                Log.i("RosterSynchronizationService", "listed remote data = " + response.data);
                for (ListDataResponse.ListDataRecord record : Maps.filterKeys(response.data, new Predicate<String>() {

                    @Override
                    public boolean apply(String recordId) {
                        return recordId.startsWith(LIST_DATA_RECORD_PREFIX);
                    }
                }).values()) {
                    String rosterId = record.key.substring(LIST_DATA_RECORD_PREFIX.length());
                    RosterData rosterData = persistenceService.get().getRosterDataById(rosterId);
                    boolean updateLocal = false, deleteLocal = false, updateRemote = false;
                    if (rosterData == null) {
                        if (record.deleted) {
                            // do nothing
                        } else {
                            updateLocal = true;
                        }
                    } else {
                        if (record.dateMod > rosterData.getDateMod()) {
                            if (record.deleted) {
                                deleteLocal = true;
                            } else {
                                updateLocal = true;
                            }
                        } else if (record.dateMod < rosterData.getDateMod()) {
                            updateRemote = true;
                        }
                    }
                    if (deleteLocal) {
                        persistenceService.get().deleteRosterDataById(rosterId);
                    } else if (updateLocal) {
                        getRemoteRosterData(rosterId);
                    } else if (updateRemote) {
                        sendRosterToRemote(rosterData);
                    }
                }
                if (loadNewListIfAvailable) {
                    loadNewListIfAvailable = false;
                    eventBus.register(new Object() {

                        @Subscribe
                        public void handleRemoteActivityEvent(RemoteActivityEvent event) {
                            if (event.equals(RemoteActivityEvent.REMOTE_ACTIVITY_COMPLETED)) {
                                eventBus.unregister(this);
                                getLastSavedInfo();
                            }
                        }
                    });
                }
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

    private void getLastSavedInfo() {
        callWs(geWsUrl("getData") + "&key=" + "lastSavedList", DataResponse.class, new Callback<DataResponse>() {

            @Override
            public void call(DataResponse response) {
                LastSavedListInfo lastSavedListInfo = gson.fromJson(response.data, LastSavedListInfo.class);
                if (!Objects.equal(currentRosterService.get().getListId(), lastSavedListInfo.getRosterId())
                        && lastSavedListInfo.getDateModNum() > currentRosterService.get().getDateMod()) {
                    currentRosterService.get().loadRoster(lastSavedListInfo.getRosterId());
                }
            }
        });
    }

    private void getRemoteRosterData(String rosterId) {
        callWs(geWsUrl("getData") + "&key=" + LIST_DATA_RECORD_PREFIX + rosterId, DataResponse.class,
                new Callback<DataResponse>() {

                    @Override
                    public void call(DataResponse response) {
                        Log.i("RosterSynchronizationService", "getRemoteRosterData res = " + response);
                        RosterData remoteRosterData = gson.fromJson(response.data, RosterData.class);
                        RosterData rosterData = persistenceService.get()
                                .getRosterDataById(remoteRosterData.getListId());
                        // TODO validation of remote roster data
                        if (rosterData == null || rosterData.getDateMod() < remoteRosterData.getDateMod()) {
                            persistenceService.get().saveRosterData(remoteRosterData);
                            if (Objects.equal(remoteRosterData.getListId(), currentRosterService.get().getListId())) {
                                currentRosterService.get().loadRoster(remoteRosterData);
                            }
                        }
                    }
                });
    }

    private void sendRosterToRemote(RosterData rosterData) {
        String rosterKey = LIST_DATA_RECORD_PREFIX + rosterData.getListId();
        sendDataToRemote(rosterKey, rosterData);
    }

    public void sendCurrentRosterToRemote() {
        Log.i("RosterSynchronizationService", "sendCurrentRosterToRemote");
        RosterData rosterData = currentRosterService.get().exportCurrentRoster();
        if (!rosterData.isEmpty()) {
            sendRosterToRemote(rosterData);
            sendDataToRemote("lastSavedList", new LastSavedListInfo(rosterData));
        }
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

        public String getRosterId() {
            return data;
        }

        public Long getDateModNum() {
            return Long.valueOf(dateMod);
        }

    }

    private static class RemoteResponse {
        public String message;
        public boolean success;
    }

    private static class DataResponse extends RemoteResponse {
        public String data;
    }

    private static class ListDataResponse extends RemoteResponse {
        public Map<String, ListDataRecord> data;

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
