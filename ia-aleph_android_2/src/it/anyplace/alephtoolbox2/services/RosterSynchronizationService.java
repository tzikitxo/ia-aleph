package it.anyplace.alephtoolbox2.services;

import it.anyplace.alephtoolbox2.R;

import java.util.List;
import java.util.Map;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import org.json.JSONObject;

import android.app.Activity;
import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import com.androidquery.AQuery;
import com.androidquery.callback.AjaxCallback;
import com.androidquery.callback.AjaxStatus;
import com.google.common.base.Function;
import com.google.common.base.Strings;
import com.google.common.collect.Maps;
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
    private void init() {
        eventBus.register(this);

        int delay = activity.getResources().getInteger(R.integer.remoteSynchronization_synchronizationDelay), period = activity
                .getResources().getInteger(R.integer.remoteSynchronization_synchronizationPeriod);
        executorService.scheduleAtFixedRate(new Runnable() {

            @Override
            public void run() {
                synchronizeWithRemote();
            }

        }, delay, period, TimeUnit.SECONDS);
    }

    private String geWsUrl(String action) {
        String remoteUrl = activity.getResources().getString(R.string.remoteSynchronization_serviceUrl);
        String wsCall = remoteUrl + "?action=" + action + "&deviceId=" + getDeviceId() + "&requestId="
                + persistenceService.get().newId();
        return wsCall;
    }

    private <T> void callWs(String url, final Class<T> responseClass, final Callback<T> callback) {
        new AQuery(activity).ajax(url, JSONObject.class, new AjaxCallback<JSONObject>() {

            @Override
            public void callback(String url, JSONObject object, AjaxStatus status) {
                try {
                    if (object != null) {
                        T response = gson.fromJson(object.toString(), responseClass);
                        if (!(response instanceof RemoteResponse) || ((RemoteResponse) response).success) {
                            callback.call(response);
                            // callback.
                            // Map<String, ListDataResponse.ListDataRecord>
                            // dataMap = Maps.uniqueIndex(
                            // listDataResponse.data, new
                            // Function<ListDataResponse.ListDataRecord,
                            // String>() {
                            //
                            // @Override
                            // public String apply(
                            // RosterSynchronizationService.ListDataResponse.ListDataRecord
                            // record) {
                            // return record.key;
                            // }
                            // });
                        } else {
                            Log.w("RosterSynchronizationService", "error calling remote ws = "
                                    + (response instanceof RemoteResponse ? ((RemoteResponse) response).message : "?"));

                        }
                        // Boolean success;
                        // success = object.getBoolean("success");
                        // if (success) {
                        // JSONArray dataList=object.getJSONArray("data");
                        // Map<String,RemoteDataRecord>
                        // dataMap=Iterables.transform(dataList, new
                        // Function<JSONObject,RemoteDataRecord>)
                        // }
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
        // String wsCall = geWsUrl("listData");
        // new AQuery(activity).ajax(wsCall, JSONObject.class, new
        // AjaxCallback<JSONObject>() {
        //
        // @Override
        // public void callback(String url, JSONObject object, AjaxStatus
        // status) {
        // try {
        // if (object != null) {
        // ListDataResponse listDataResponse = gson.fromJson(object.toString(),
        // ListDataResponse.class);
        // if (listDataResponse.success) {
        // Map<String, ListDataResponse.ListDataRecord> dataMap =
        // Maps.uniqueIndex(
        // listDataResponse.data, new Function<ListDataResponse.ListDataRecord,
        // String>() {
        //
        // @Override
        // public String apply(
        // RosterSynchronizationService.ListDataResponse.ListDataRecord record)
        // {
        // return record.key;
        // }
        // });
        // } else {
        // Log.w("RosterSynchronizationService", "error calling remote ws = "
        // + listDataResponse.message);
        //
        // }
        // // Boolean success;
        // // success = object.getBoolean("success");
        // // if (success) {
        // // JSONArray dataList=object.getJSONArray("data");
        // // Map<String,RemoteDataRecord>
        // // dataMap=Iterables.transform(dataList, new
        // // Function<JSONObject,RemoteDataRecord>)
        // // }
        // }
        // } catch (Exception e) {
        // Log.w("RosterSynchronizationService", "error calling remote ws", e);
        // }
        // }
        //
        // });
    }

    private interface Callback<E> {
        public void call(E response);
    }

    private static class RemoteResponse {
        public String message;
        public boolean success;

    }

    private static class ListDataResponse extends RemoteResponse {
        public List<ListDataRecord> data;

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

}