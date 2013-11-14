package it.anyplace.alephtoolbox2;

import java.util.Arrays;

import com.google.common.base.Function;
import com.google.common.collect.Lists;
import com.google.inject.Guice;
import com.google.inject.Injector;

import it.anyplace.alephtoolbox2.beans.ArmyList;
import it.anyplace.alephtoolbox2.beans.ArmyList.ArmyListUnit;
import it.anyplace.alephtoolbox2.services.ArmylistService;
import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ListView;
import android.widget.ViewFlipper;

public class MainActivity extends Activity {
	
	private ArmylistService  armylistService;
	
	private ListView mainRosterList;
	private ViewFlipper mainViewFlipper;

	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		
		{
			Injector injector = Guice.createInjector();
			armylistService=injector.getInstance(ArmylistService.class);
		}
		
	    setContentView(R.layout.main_view);
	    
	    mainRosterList=(ListView)this.findViewById(R.id.mainRosterList);
	    mainViewFlipper=(ViewFlipper)this.findViewById(R.id.mainViewFlipper);
	    
	    loadArmylist();

	    Button leftButton = (Button)findViewById(R.id.leftButton);
	    leftButton.setOnClickListener(new OnClickListener() {
			
			@Override
			public void onClick(View v) {
				mainViewFlipper.showPrevious();
				
			}
		});
	    Button rightButton = (Button)findViewById(R.id.rightButton);
	    rightButton.setOnClickListener(new OnClickListener() {
			
			@Override
			public void onClick(View v) {
				mainViewFlipper.showNext();
				
			}
		});
	}
	
	private void reset(){
		//mainRosterList. TODO clear
	}
	
	private void loadArmylist(){
		reset();
		ArmyList armylist = armylistService.getArmylist();
		ArrayAdapter adapter = new ArrayAdapter<String>(this, 
				android.R.layout.simple_list_item_1, 
				Lists.transform(armylist.getModels(),new Function<ArmyListUnit,String>(){

					@Override
					public String apply(ArmyListUnit model) {
							return model.getIsc();
					}}));
		mainRosterList.setAdapter(adapter);
		//		for(ArmyListUnit model:armylist.getModels()){
//			mainRosterList
//		}
		
	}

}
