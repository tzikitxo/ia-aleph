package it.anyplace.alephtoolbox2;

import android.app.Activity;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;
import android.widget.ViewFlipper;

import com.google.inject.Inject;
import com.google.inject.Singleton;

@Singleton
public class ViewFlipperController {

	@Inject
	private Activity activity;

	private ViewFlipper mainViewFlipper;

	@Inject
	private void init(){
		// unitDataList = (ListView) this.findViewById(R.id.unitList);
				mainViewFlipper = (ViewFlipper) activity.findViewById(R.id.mainViewFlipper);

				
				// loadUnitData();

				Button leftButton = (Button) activity.findViewById(R.id.leftButton);
				leftButton.setOnClickListener(new OnClickListener() {

					@Override
					public void onClick(View v) {
						mainViewFlipper.showPrevious();

					}
				});
				Button rightButton = (Button) activity.findViewById(R.id.rightButton);
				rightButton.setOnClickListener(new OnClickListener() {

					@Override
					public void onClick(View v) {
						mainViewFlipper.showNext();

					}
				});
	}
}
