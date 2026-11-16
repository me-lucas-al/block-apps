struct AcceptStrictModeUseCase {
    private let acceptanceStorage: StrictModeAcceptanceStorage
    private let shieldApplier: ShieldApplier

    init(
        acceptanceStorage: StrictModeAcceptanceStorage = StrictModeAcceptanceStorage(),
        shieldApplier: ShieldApplier = ShieldApplier()
    ) {
        self.acceptanceStorage = acceptanceStorage
        self.shieldApplier = shieldApplier
    }

    func acceptStrictModeOnThisDevice() {
        acceptanceStorage.saveAcceptedOnThisDevice()
        shieldApplier.applyShieldsForCurrentMoment()
    }
}
