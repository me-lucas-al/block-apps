package expo.modules.appblocker.ui

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Typeface
import android.os.Bundle
import android.view.Gravity
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import expo.modules.appblocker.R

class BlockActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val blockedPackage = intent.getStringExtra(EXTRA_PACKAGE).orEmpty()
    setContentView(buildContent(resolveLabel(blockedPackage)))
  }

  @Deprecated("Back navigation must not return to the blocked app")
  override fun onBackPressed() = goHome()

  private fun buildContent(appLabel: String): LinearLayout {
    val padding = (24 * resources.displayMetrics.density).toInt()
    return LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER
      setPadding(padding, padding, padding, padding)
      addView(titleView())
      addView(messageView(appLabel))
      addView(homeButton())
    }
  }

  private fun titleView() = TextView(this).apply {
    text = getString(R.string.app_blocker_blocked_title)
    textSize = 24f
    setTypeface(typeface, Typeface.BOLD)
    gravity = Gravity.CENTER
  }

  private fun messageView(appLabel: String) = TextView(this).apply {
    text = getString(R.string.app_blocker_blocked_message, appLabel)
    gravity = Gravity.CENTER
    setPadding(0, 16, 0, 32)
  }

  private fun homeButton() = Button(this).apply {
    text = getString(R.string.app_blocker_back_home)
    setOnClickListener { goHome() }
  }

  private fun goHome() {
    val home = Intent(Intent.ACTION_MAIN)
      .addCategory(Intent.CATEGORY_HOME)
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    startActivity(home)
    finish()
  }

  private fun resolveLabel(packageName: String): String = try {
    packageManager.getApplicationLabel(packageManager.getApplicationInfo(packageName, 0)).toString()
  } catch (notFound: PackageManager.NameNotFoundException) {
    packageName
  }

  companion object {
    private const val EXTRA_PACKAGE = "blockedPackage"

    fun createIntent(context: Context, blockedPackage: String): Intent =
      Intent(context, BlockActivity::class.java)
        .putExtra(EXTRA_PACKAGE, blockedPackage)
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
  }
}
