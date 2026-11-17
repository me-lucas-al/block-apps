import Foundation

struct RecordAppOpenedUseCase {
    private let activityStorage: AppActivityStorage
    private let currentDate: () -> Date

    init(
        activityStorage: AppActivityStorage = AppActivityStorage(),
        currentDate: @escaping () -> Date = { Date() }
    ) {
        self.activityStorage = activityStorage
        self.currentDate = currentDate
    }

    func recordAppOpened() {
        activityStorage.recordAppOpened(at: currentDate())
    }
}
