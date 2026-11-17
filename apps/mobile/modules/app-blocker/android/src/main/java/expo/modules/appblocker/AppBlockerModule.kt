package expo.modules.appblocker

import android.content.Context
import expo.modules.appblocker.admin.DeviceAdminGateway
import expo.modules.appblocker.rules.exceptions.AnotherAccountOwnsRulesException
import expo.modules.appblocker.rules.ownership.RulesOwnedByAnotherAccountException
import expo.modules.appblocker.rules.storage.RuleStore
import expo.modules.appblocker.rules.storage.RulesInstaller
import expo.modules.appblocker.system.AccessibilityStatus
import expo.modules.appblocker.system.InstalledApps
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class AppBlockerModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("AppBlocker")

    Function("setRules") { rulesJson: String, ownerId: String, legacyOwnerId: String? ->
      try {
        RulesInstaller(RuleStore(context)).install(rulesJson, ownerId, legacyOwnerId)
      } catch (failure: RulesOwnedByAnotherAccountException) {
        throw AnotherAccountOwnsRulesException()
      }
    }

    Function("isAccessibilityEnabled") {
      AccessibilityStatus(context).isEnabled()
    }

    Function("openAccessibilitySettings") {
      AccessibilityStatus(context).openSettings()
    }

    Function("isDeviceAdminActive") {
      DeviceAdminGateway(context).isActive()
    }

    Function("requestDeviceAdmin") {
      DeviceAdminGateway(context).requestActivation()
    }

    Function("listLaunchableApps") {
      InstalledApps(context).listLaunchable()
    }
  }
}
