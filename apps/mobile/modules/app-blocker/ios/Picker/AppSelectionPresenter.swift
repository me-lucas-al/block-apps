import FamilyControls
import SwiftUI
import UIKit

@MainActor
enum AppSelectionPresenter {
    typealias SelectionContinuation = CheckedContinuation<FamilyActivitySelection?, Never>

    static func presentPicker(
        startingFrom initialSelection: FamilyActivitySelection
    ) async throws -> FamilyActivitySelection? {
        guard let presenter: UIViewController = TopViewControllerFinder.findTopViewController() else {
            AppLogger.selection.error("No view controller available to present the picker")
            throw PickerNotPresentedError.noViewControllerAvailable
        }
        return await withCheckedContinuation { (continuation: SelectionContinuation) in
            var hostingController: UIViewController?
            var alreadyFinished: Bool = false
            let pickerView: AppSelectionPickerView = AppSelectionPickerView(
                initialSelection: initialSelection
            ) { (chosenSelection: FamilyActivitySelection?) in
                if alreadyFinished { return }
                alreadyFinished = true
                hostingController?.dismiss(animated: true) {
                    continuation.resume(returning: chosenSelection)
                }
            }
            let controller: UIHostingController<AppSelectionPickerView> = UIHostingController(rootView: pickerView)
            controller.isModalInPresentation = true
            hostingController = controller
            presenter.present(controller, animated: true)
        }
    }
}
