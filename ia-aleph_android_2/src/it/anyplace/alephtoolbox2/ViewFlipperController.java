package it.anyplace.alephtoolbox2;

import java.util.Map;

import android.app.Activity;
import android.util.Log;
import android.view.GestureDetector;
import android.view.GestureDetector.SimpleOnGestureListener;
import android.view.MotionEvent;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.View.OnTouchListener;
import android.widget.Button;
import android.widget.ViewFlipper;

import com.google.common.collect.ImmutableMap;
import com.google.inject.Inject;
import com.google.inject.Singleton;

@Singleton
public class ViewFlipperController {

	@Inject
	private Activity activity;

	private ViewFlipper mainViewFlipper;
	private View unitDetailView, armyListView, availableUnitsView;
	private Button leftButton, rightButton;

	// private List<String> buttonLabels;

	private Map<View, View> swipeRightMap, swipeLeftMap;
	private Map<View, String> rightButtonLabelMap, leftButtonLabelMap;

	@Inject
	private void init() {
		unitDetailView = (View) activity.findViewById(R.id.unitDetailView);
		armyListView = (View) activity.findViewById(R.id.armyListView);
		availableUnitsView = (View) activity
				.findViewById(R.id.availableUnitsView);
		mainViewFlipper = (ViewFlipper) activity
				.findViewById(R.id.mainViewFlipper);
		String unitDetailLabel = activity
				.getString(R.string.app_main_unitdetail), armyListLabel = activity
				.getString(R.string.app_main_armylist), availableUnitsLabel = activity
				.getString(R.string.app_main_availableunits);

		swipeRightMap = ImmutableMap.of(unitDetailView, armyListView,
				armyListView, unitDetailView, availableUnitsView,
				unitDetailView);
		swipeLeftMap = ImmutableMap.of(unitDetailView, availableUnitsView,
				armyListView, availableUnitsView, availableUnitsView,
				armyListView);
		rightButtonLabelMap = ImmutableMap.of(unitDetailView, armyListLabel,
				armyListView, unitDetailLabel, availableUnitsView,
				unitDetailLabel);
		leftButtonLabelMap = ImmutableMap.of(unitDetailView,
				availableUnitsLabel, armyListView, availableUnitsLabel,
				availableUnitsView, armyListLabel);

		// mainViewFlipper.setOnTouchListener(new OnTouchListener() {
		//
		// @Override
		// public boolean onTouch(View v, MotionEvent event) {
		// Log.d("MotionEvent", "event = " + event);
		// return gestureDetector.onTouchEvent(event);
		// }
		//
		// GestureDetector gestureDetector = new GestureDetector(activity,
		// new SimpleOnGestureListener() {
		// private static final int SWIPE_THRESHOLD = 100;
		// private static final int SWIPE_VELOCITY_THRESHOLD = 100;
		//
		// @Override
		// public boolean onDown(MotionEvent e) {
		// return true;
		// }
		//
		// @Override
		// public boolean onFling(MotionEvent e1, MotionEvent e2,
		// float velocityX, float velocityY) {
		// float diffY = e2.getY() - e1.getY();
		// float diffX = e2.getX() - e1.getX();
		// Log.i("Fling event", "dx = " + diffX + " dy = "
		// + diffY + " velx = " + velocityX
		// + " velY = " + velocityY);
		// if (Math.abs(diffX) > Math.abs(diffY)) {
		// if (Math.abs(diffX) > SWIPE_THRESHOLD
		// && Math.abs(velocityX) > SWIPE_VELOCITY_THRESHOLD) {
		// if (diffX > 0) {
		// onSwipeRight();
		// } else {
		// onSwipeLeft();
		// }
		// }
		// } else {
		// if (Math.abs(diffY) > SWIPE_THRESHOLD
		// && Math.abs(velocityY) > SWIPE_VELOCITY_THRESHOLD) {
		// if (diffY > 0) {
		// onSwipeBottom();
		// } else {
		// onSwipeTop();
		// }
		// }
		// }
		// return false;
		// }
		//
		// public void onSwipeRight() {
		// shiftViewToRight();
		// }
		//
		// public void onSwipeLeft() {
		// shiftViewToLeft();
		// }
		//
		// public void onSwipeTop() {
		// }
		//
		// public void onSwipeBottom() {
		// }
		//
		// });
		//
		// });

		// buttonLabels = Arrays
		// .asList(activity.getResources().getString(
		// R.string.app_main_armylist), activity.getResources()
		// .getString(R.string.app_main_availableunits), activity
		// .getResources().getString(R.string.app_main_unitdetail));
		leftButton = (Button) activity.findViewById(R.id.leftButton);
		leftButton.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				shiftViewToLeft();

			}
		});
		rightButton = (Button) activity.findViewById(R.id.rightButton);
		rightButton.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				shiftViewToRight();

			}
		});
		updateButtonLabels();
	}

	private void shiftViewToLeft() {
		mainViewFlipper.setDisplayedChild(mainViewFlipper
				.indexOfChild(swipeLeftMap.get(mainViewFlipper
						.getChildAt(mainViewFlipper.getDisplayedChild()))));
		// mainViewFlipper.showPrevious();
		updateButtonLabels();
	}

	private void shiftViewToRight() {
		mainViewFlipper.setDisplayedChild(mainViewFlipper
				.indexOfChild(swipeRightMap.get(mainViewFlipper
						.getChildAt(mainViewFlipper.getDisplayedChild()))));
		// mainViewFlipper.showNext();
		updateButtonLabels();
	}

	private void updateButtonLabels() {
		leftButton.setText(leftButtonLabelMap.get(mainViewFlipper
				.getChildAt(mainViewFlipper.getDisplayedChild())));
		rightButton.setText(rightButtonLabelMap.get(mainViewFlipper
				.getChildAt(mainViewFlipper.getDisplayedChild())));
	}

	public void showUnitDetailView() {
		mainViewFlipper.setDisplayedChild(mainViewFlipper
				.indexOfChild(unitDetailView));
		updateButtonLabels();
	}

	public void showArmyListView() {
		mainViewFlipper.setDisplayedChild(mainViewFlipper
				.indexOfChild(armyListView));
		updateButtonLabels();
	}
}
