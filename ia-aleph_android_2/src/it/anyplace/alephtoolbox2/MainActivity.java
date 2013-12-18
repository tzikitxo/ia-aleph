package it.anyplace.alephtoolbox2;

import java.util.Arrays;

import com.google.common.base.Function;
import com.google.common.collect.Lists;
import com.google.common.eventbus.EventBus;
import com.google.gson.Gson;
import com.google.inject.Binder;
import com.google.inject.Guice;
import com.google.inject.Inject;
import com.google.inject.Injector;
import com.google.inject.Module;

import it.anyplace.alephtoolbox2.services.RosterDataService;
import it.anyplace.alephtoolbox2.services.SourceDataService;
import it.anyplace.alephtoolbox2.services.CurrentRosterService;
import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ListView;
import android.widget.ViewFlipper;

public class MainActivity extends Activity {

	 @Inject
	 private RosterDataService armyListService;
	 @Inject
	 private CurrentRosterService currentListService;
	// @Inject
	// private UnitDataViewController unitDataViewController;
	
	
	
	@Inject
	private EventBus eventBus;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.main_view);

		Injector injector = Guice.createInjector(new Module() {

			@Override
			public void configure(Binder binder) {
				binder.bind(Context.class).toInstance(MainActivity.this);
				binder.bind(Activity.class).toInstance(MainActivity.this);
				binder.bind(Gson.class).asEagerSingleton();
				binder.bind(EventBus.class).asEagerSingleton();
			}
		});
		injector.injectMembers(this);
		
//		List<Class> controllers=Lists.newArrayList()
//		injector.
		// init components
		injector.getInstance(ViewFlipperController.class);
		injector.getInstance(CurrentRosterController.class);
		injector.getInstance(AvailableUnitsController.class);
		injector.getInstance(UnitDetailController.class);
		injector.getInstance(MenuController.class);
		
		//begin
		final String armylistData = "{'pcap':200,'faction':'Panoceania','includeMercs':false,'models':[{'isc':'Cutters','code':'Default','recordid':'26341055822558700'},{'isc':'Bagh-Mari','code':'Shotgun','recordid':'58486073673702776'},{'isc':'Lieutenant Stephen Rao','code':'Default','recordid':'71578364423476160'},{'isc':'Fusiliers','code':'Default','recordid':'15866463608108460'},{'isc':'Fusiliers','code':'Default','recordid':'94999620621092620'},{'isc':'Order Sergeants','code':'Spitfire','recordid':'64432820701040330'},{'isc':'Order Sergeants','code':'TO Sniper','recordid':'2207046304829418.8'}],'listId':'3542035631835460.5','id':'3542035631835460.5','listName':'','dateMod':'1384377643000','groupMarks':[],'combatGroupSize':10,'specop':null,'mercenaryFactions':null}";
		currentListService.loadArmyList(armyListService.parseArmyList(armylistData));
//		injector.getInstance(CurrentListService.class).loadFaction("Aleph", null);
	}

}
