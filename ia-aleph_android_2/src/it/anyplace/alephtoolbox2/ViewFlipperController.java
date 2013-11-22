package it.anyplace.alephtoolbox2;

import java.util.Arrays;
import java.util.List;

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
	private View unitDetailView;
	private Button leftButton, rightButton;

	private final List<String> buttonLabels = Arrays.asList("list info",
			"unit list", "unit detail");

	@Inject
	private void init() {
		// unitDataList = (ListView) this.findViewById(R.id.unitList);
		unitDetailView = (View) activity.findViewById(R.id.unitDetailView);

		mainViewFlipper = (ViewFlipper) activity
				.findViewById(R.id.mainViewFlipper);

		// loadUnitData();

		leftButton = (Button) activity.findViewById(R.id.leftButton);
		leftButton.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				mainViewFlipper.showPrevious();
				updateButtonLabels();

			}
		});
		rightButton = (Button) activity.findViewById(R.id.rightButton);
		rightButton.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				mainViewFlipper.showNext();
				updateButtonLabels();

			}
		});
		updateButtonLabels();
	}
	
	private void updateButtonLabels(){
		int index=mainViewFlipper.getDisplayedChild();
		leftButton.setText(buttonLabels.get((index+2)%3));
		rightButton.setText(buttonLabels.get((index+1)%3));
	}

	public void showUnitDetailView() {
		mainViewFlipper.setDisplayedChild(mainViewFlipper
				.indexOfChild(unitDetailView));
		updateButtonLabels();
	}
}