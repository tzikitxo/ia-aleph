package it.anyplace.alephtoolbox2;

import it.anyplace.alephtoolbox2.services.CurrentListService;
import it.anyplace.alephtoolbox2.services.DataService.UnitData;
import android.app.Activity;
import android.widget.TextView;

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
	
	private TextView unitDetailIscView;
	

	@Inject
	private void init() {
		unitDetailIscView = (TextView) activity.findViewById(R.id.unitDetailIsc);
		
		eventBus.register(this);
	}
	
	public void openUnitDetail(UnitData unitData){
		unitDetailIscView.setText(unitData.getIsc());
		viewFlipperController.showUnitDetailView();
	}
}
