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

import it.anyplace.alephtoolbox2.beans.ArmyList;
import it.anyplace.alephtoolbox2.beans.ArmyList.ArmyListUnit;
import it.anyplace.alephtoolbox2.beans.UnitData;
import it.anyplace.alephtoolbox2.services.ArmylistService;
import it.anyplace.alephtoolbox2.services.DataService;
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

	// @Inject
	// private UnitDataService unitDataService;
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

		// init components
		injector.getInstance(ViewFlipperController.class);
		injector.getInstance(ArmyListViewController.class);
		injector.getInstance(UnitDataViewController.class);
	}

}
