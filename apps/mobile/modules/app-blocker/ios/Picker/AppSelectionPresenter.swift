import FamilyControls
import SwiftUI
import UIKit

@MainActor
enum AppSelectionPresenter {
    typealias SelectionContinuation = CheckedContinuation<FamilyActivitySelection?, Never>

    static func presentPicker(
        startingFrom initialSelection: FamilyActivitySelection
    ) async -> FamilyActivitySelection? {
        guard let presenter: UIViewController = TopViewControllerFinder.findTopViewController() else { return nil }
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
