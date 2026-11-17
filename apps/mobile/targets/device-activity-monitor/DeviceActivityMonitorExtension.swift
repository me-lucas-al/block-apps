import DeviceActivity

class DeviceActivityMonitorExtension: DeviceActivityMonitor {
    override func intervalDidStart(for activity: DeviceActivityName) {
        super.intervalDidStart(for: activity)
        ShieldApplier().applyShieldsForCurrentMoment()
    }

    override func intervalDidEnd(for activity: DeviceActivityName) {
        super.intervalDidEnd(for: activity)
        ShieldApplier().applyShieldsForCurrentMoment()
    }
}
