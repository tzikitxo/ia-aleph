package it.anyplace.alephtoolbox2;

import it.anyplace.alephtoolbox2.ArmyListController.ArmyListUnitSelectedEvent;
import it.anyplace.alephtoolbox2.AvailableUnitsController.AvailableUnitsUnitSelectedEvent;
import it.anyplace.alephtoolbox2.services.CurrentRosterService;
import it.anyplace.alephtoolbox2.services.DataService.UnitData;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.util.List;

import android.app.Activity;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.AsyncTask;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.ListView;
import android.widget.TextView;

import com.google.common.base.Joiner;
import com.google.common.collect.Iterables;
import com.google.common.collect.Lists;
import com.google.common.eventbus.EventBus;
import com.google.common.eventbus.Subscribe;
import com.google.inject.Inject;
import com.google.inject.Singleton;

@Singleton
public class UnitDetailController {

	@Inject
	private CurrentRosterService sessionService;
	@Inject
	private Activity activity;
	@Inject
	private ViewFlipperController viewFlipperController;
	@Inject
	private EventBus eventBus;

	private TextView unitDetailName, unitDetailCode, unitDetailCost,
			unitDetailSwc, unitDetailType, unitDetailMov, unitDetailCc,
			unitDetailBs, unitDetailPh, unitDetailWip, unitDetailArm,
			unitDetailBts, unitDetailW, unitDetailSpecs;
	private ImageView unitDetailImage;
	private ListView unitDetailChildsListView;
	private List<UnitData> childs = Lists.newArrayList();

	public interface UnitDetailChildUnitSelectedEvent {
		public UnitData getUnitData();
	}

	@Inject
	private void init() {
		unitDetailName = (TextView) activity.findViewById(R.id.unitDetailName);
		unitDetailCode = (TextView) activity.findViewById(R.id.unitDetailCode);
		unitDetailCost = (TextView) activity.findViewById(R.id.unitDetailCost);
		unitDetailSwc = (TextView) activity.findViewById(R.id.unitDetailSwc);
		unitDetailType = (TextView) activity.findViewById(R.id.unitDetailType);
		unitDetailMov = (TextView) activity.findViewById(R.id.unitDetailMov);
		unitDetailCc = (TextView) activity.findViewById(R.id.unitDetailCc);
		unitDetailBs = (TextView) activity.findViewById(R.id.unitDetailBs);
		unitDetailPh = (TextView) activity.findViewById(R.id.unitDetailPh);
		unitDetailWip = (TextView) activity.findViewById(R.id.unitDetailWip);
		unitDetailArm = (TextView) activity.findViewById(R.id.unitDetailArm);
		unitDetailBts = (TextView) activity.findViewById(R.id.unitDetailBts);
		unitDetailW = (TextView) activity.findViewById(R.id.unitDetailW);
		unitDetailSpecs = (TextView) activity
				.findViewById(R.id.unitDetailSpecs);
		unitDetailImage = (ImageView) activity
				.findViewById(R.id.unitDetailImage);
		unitDetailChildsListView = (ListView) activity
				.findViewById(R.id.unitDetailChildsListView);
		eventBus.register(this);

		unitDetailChildsListView
				.setOnItemClickListener(new OnItemClickListener() {

					@Override
					public void onItemClick(AdapterView<?> arg0, View arg1,
							int index, long arg3) {
						final UnitData newUnit = childs.get(index);
						eventBus.post(new UnitDetailChildUnitSelectedEvent() {

							@Override
							public UnitData getUnitData() {
								return newUnit;
							}
						});

					}
				});
	}

	@Subscribe
	public void handleArmyListUnitSelectedEvent(
			ArmyListUnitSelectedEvent armyListUnitSelectedEvent) {
		openUnitDetail(armyListUnitSelectedEvent.getUnitRecord().getUnitData());
	}

	@Subscribe
	public void handleAvailableUnitsUnitSelectedEvent(
			AvailableUnitsUnitSelectedEvent availableUnitsUnitSelectedEvent) {
		openUnitDetail(availableUnitsUnitSelectedEvent.getUnitData()
				.getDefaultChild());
	}

	public void loadUnitDetail(UnitData unitData) {
		unitDetailName.setText(unitData.getName());
		unitDetailCode.setText(unitData.getCode());
		unitDetailCost.setText(unitData.getCost());
		unitDetailSwc.setText(unitData.getSwc());
		unitDetailType.setText(unitData.getType());
		unitDetailMov.setText(unitData.getMov());
		unitDetailCc.setText(unitData.getCc());
		unitDetailBs.setText(unitData.getBs());
		unitDetailPh.setText(unitData.getPh());
		unitDetailWip.setText(unitData.getWip());
		unitDetailArm.setText(unitData.getArm());
		unitDetailBts.setText(unitData.getBts());
		unitDetailW.setText(unitData.getW());
		unitDetailSpecs.setText(Joiner.on(", ").join(unitData.getSpec()));

		unitDetailImage.setImageResource(R.drawable.missing_logo_big);
		if (!unitData.getCbcode().isEmpty()) {
			// TODO show loading screen
			String cbCode = unitData.getCbcode().get(0);// TODO slideshow
			final String url = "http://www.infinitythegame.com/infinity/catalogo/"
					+ cbCode + "-recorte.png";
			new AsyncTask<Void, Void, Bitmap>() {

				@Override
				protected Bitmap doInBackground(Void... params) {
					InputStream in;
					try {
						in = new java.net.URL(url).openStream();
						Bitmap bitmap = BitmapFactory.decodeStream(in);
						return bitmap;
					} catch (MalformedURLException e) {
						Log.w("Error loading unit icon", e);
					} catch (IOException e) {
						Log.w("Error loading unit icon", e);
					}
					return null;
				}

				protected void onPostExecute(Bitmap result) {
					unitDetailImage.setImageBitmap(result);
				}
			}.execute();
		}

		childs = Lists.newArrayList(unitData.getParent().getChilds());
		Log.i("UnitDetailController", "child units = " + childs);

		unitDetailChildsListView.setAdapter(new ArrayAdapter<UnitData>(
				activity, R.layout.unit_detail_child_record, childs) {

			@Override
			public View getView(int position, View convertView, ViewGroup parent) {
				if (convertView == null) {
					convertView = LayoutInflater.from(activity).inflate(
							R.layout.unit_detail_child_record, null);
				}
				UnitData unitData = getItem(position);

				((TextView) convertView
						.findViewById(R.id.unitDetailChildRecordCode))
						.setText(unitData.getDisplayCode());

				((TextView) convertView
						.findViewById(R.id.unitDetailChildRecordSwc))
						.setText(unitData.getSwc());
				((TextView) convertView
						.findViewById(R.id.unitDetailChildRecordCost))
						.setText(unitData.getCost());

				Joiner joiner = Joiner.on(", ");
				((TextView) convertView
						.findViewById(R.id.unitDetailChildRecordWeapons)).setText(joiner
						.join(Iterables.concat(unitData.getChildBsw(),
								unitData.getChildCcw())));
				// ((TextView) convertView
				// .findViewById(R.id.unitDetailChildRecordCcw))
				// .setText(joiner.join(unitData.getChildCcw()));
				((TextView) convertView
						.findViewById(R.id.unitDetailChildRecordSpec))
						.setText(joiner.join(unitData.getChildSpec()));

				return convertView;
			}

		});
		unitDetailChildsListView.setSelection(childs.indexOf(unitData));
	}

	public void openUnitDetail(UnitData unitData) {
		loadUnitDetail(unitData);
		viewFlipperController.showUnitDetailView();
	}
}
