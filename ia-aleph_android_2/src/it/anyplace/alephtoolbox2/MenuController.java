package it.anyplace.alephtoolbox2;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;

import com.google.inject.Inject;
import com.google.inject.Singleton;

@Singleton
public class MenuController {

	@Inject
	private Activity activity;

	private Button menuButton;

	@Inject
	private void init() {
		menuButton = (Button) activity.findViewById(R.id.menuButton);
		menuButton.setOnClickListener(new OnClickListener() {

			@Override
			public void onClick(View v) {
				showMenu();
			}
		});
	}

	AlertDialog menuPopup;

	public void hideMenu() {
		if (menuPopup != null) {
			menuPopup.dismiss();
			menuPopup = null;
		}
	}

	public void showMenu() {
		menuPopup = new AlertDialog.Builder(activity)
				.setView(
						activity.getLayoutInflater().inflate(
								R.layout.main_menu, null))
				.setNegativeButton("CLOSE",
						new DialogInterface.OnClickListener() {

							@Override
							public void onClick(DialogInterface dialog,
									int which) {
								hideMenu();
							}
						}).show();
		// PopupMenu popup = new PopupMenu(activity, menuButton);
		// MenuInflater inflater = popup.getMenuInflater();
		// inflater.inflate(R.layout.main_menu, popup.getMenu());
		// popup.show();
	}

}
