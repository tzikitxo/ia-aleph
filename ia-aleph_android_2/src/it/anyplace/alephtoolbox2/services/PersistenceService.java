package it.anyplace.alephtoolbox2.services;

import it.anyplace.alephtoolbox2.services.RosterDataService.RosterData;

import java.math.BigInteger;
import java.util.Date;
import java.util.List;
import java.util.Random;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.provider.BaseColumns;
import android.util.Log;

import com.google.common.collect.Lists;
import com.google.gson.Gson;
import com.google.inject.Inject;
import com.google.inject.Singleton;

@Singleton
public class PersistenceService {

    @Inject
    private RosterDataService rosterDataService;

    @Inject
    private Context context;

    @Inject
    private Gson gson;

    private SavedRostersDbHelper savedRostersDbHelper;

    // private SQLiteDatabase sqLiteDatabase;

    @Inject
    private void init() {
        savedRostersDbHelper = new SavedRostersDbHelper(context);
    }

    private final Random random = new Random();

    public String newId() {
        return new BigInteger(130, random).toString(32).replaceFirst("(.{16}).*", "$1");
    }

    public void saveRosterData(RosterData rosterData) {
        String rosterDataStr = rosterDataService.serializeRosterData(rosterData), rosterInfoStr = gson
                .toJson(new RosterInfo(rosterData)), rosterId = rosterData.getListId();
        ContentValues values = new ContentValues();
        values.put(SavedRosterRecord.COLUMN_NAME_ROSTER_ID, rosterId);
        values.put(SavedRosterRecord.COLUMN_NAME_ROSTER_INFO, rosterInfoStr);
        values.put(SavedRosterRecord.COLUMN_NAME_ROSTER_DATA, rosterDataStr);
        Log.i("PersistenceService", "saving roster = " + rosterInfoStr);
        SQLiteDatabase sqLiteDatabase = savedRostersDbHelper.getWritableDatabase();
        Cursor cursor = sqLiteDatabase.query(SavedRosterRecord.TABLE_NAME,
                new String[] { SavedRosterRecord.COLUMN_NAME_ROSTER_ID }, "rosterId=?", new String[] { rosterId },
                null, null, null);
        boolean alreadyPresent = cursor.moveToFirst();
        cursor.close();
        if (alreadyPresent) {
            updateRosterData(sqLiteDatabase, values, rosterId);
        } else {
            insertRosterData(sqLiteDatabase, values);
        }

    }

    private void insertRosterData(SQLiteDatabase sqLiteDatabase, ContentValues values) {
        sqLiteDatabase.insert(SavedRosterRecord.TABLE_NAME, null, values);
    }

    private void updateRosterData(SQLiteDatabase sqLiteDatabase, ContentValues values, String rosterId) {
        sqLiteDatabase.update(SavedRosterRecord.TABLE_NAME, values, "rosterId=?", new String[] { rosterId });
    }

    public Iterable<RosterInfo> getAllRosterInfo() {
        Log.i("PersistenceService", "getAllRosterInfo");
        SQLiteDatabase sqLiteDatabase = savedRostersDbHelper.getReadableDatabase();
        Cursor cursor = sqLiteDatabase.query(SavedRosterRecord.TABLE_NAME,
                new String[] { SavedRosterRecord.COLUMN_NAME_ROSTER_INFO }, null, null, null, null, null);
        List<RosterInfo> list = Lists.newArrayList();
        while (cursor.moveToNext()) {
            list.add(gson.fromJson(cursor.getString(0), RosterInfo.class));
        }
        cursor.close();
        return list;
    }

    public RosterData getRosterDataById(String rosterId) {
        Log.i("PersistenceService", "getRosterDataById = " + rosterId);
        SQLiteDatabase sqLiteDatabase = savedRostersDbHelper.getReadableDatabase();
        Cursor cursor = sqLiteDatabase.query(SavedRosterRecord.TABLE_NAME,
                new String[] { SavedRosterRecord.COLUMN_NAME_ROSTER_DATA }, "rosterId=?", new String[] { rosterId },
                null, null, null);
        cursor.moveToFirst();
        String rosterDataStr = cursor.getString(0);
        cursor.close();
        return rosterDataService.deserializeRosterData(rosterDataStr);
    }

    public static class RosterInfo extends RosterData {
        private Integer modelCount;

        public RosterInfo(RosterData rosterData) {
            setFaction(rosterData.getFaction());
            setSectorial(rosterData.getSectorial());
            setListId(rosterData.getListId());
            setListName(rosterData.getListName());
            setDateMod(rosterData.getDateMod());
            setIncludeMercs(rosterData.getIncludeMercs());
            setPcap(rosterData.getPcap());
            modelCount = rosterData.getModels().size();
        }

        public Integer getModelCount() {
            return modelCount;
        }

        public Date getDateModAsDate() {
            return new Date(getDateMod());
        }


    }

    private static abstract class SavedRosterRecord implements BaseColumns {
        public static final String TABLE_NAME = "savedrosters";
        public static final String COLUMN_NAME_ROSTER_ID = "rosterid";
        public static final String COLUMN_NAME_ROSTER_INFO = "rosterinfo";
        public static final String COLUMN_NAME_ROSTER_DATA = "rosterdata";
    }

    private static class SavedRostersDbHelper extends SQLiteOpenHelper {

        public static final int DATABASE_VERSION = 2;
        public static final String DATABASE_NAME = "SavedRosters.db";
        public static final String SQL_CREATE_ENTRIES = "CREATE TABLE savedrosters (rosterid VARCHAR(255) PRIMARY KEY,rosterinfo TEXT,rosterdata TEXT)",
                SQL_DELETE_ENTRIES = "DROP TABLE IF EXISTS savedrosters";

        public SavedRostersDbHelper(Context context) {
            super(context, DATABASE_NAME, null, DATABASE_VERSION);
        }

        public void onCreate(SQLiteDatabase db) {
            db.execSQL(SQL_CREATE_ENTRIES);
        }

        public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
            db.execSQL(SQL_DELETE_ENTRIES);
            onCreate(db);
        }

        public void onDowngrade(SQLiteDatabase db, int oldVersion, int newVersion) {
            onUpgrade(db, oldVersion, newVersion);
        }
    }

}
