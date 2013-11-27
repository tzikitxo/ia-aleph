package it.anyplace.alephtoolbox2;

import it.anyplace.alephtoolbox2.services.CurrentListService;
import it.anyplace.alephtoolbox2.services.DataService.UnitData;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;

import android.app.Activity;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.AsyncTask;
import android.util.Log;
import android.widget.ImageView;
import android.widget.TextView;

import com.google.common.base.Joiner;
import com.google.common.eventbus.EventBus;
import com.google.inject.Inject;
import com.google.inject.Singleton;

@Singleton
public class UnitDetailController {

	@Inject
	private CurrentListService sessionService;
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

		eventBus.register(this);
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
	}

	public void openUnitDetail(UnitData unitData) {
		loadUnitDetail(unitData);
		viewFlipperController.showUnitDetailView();
	}
}
