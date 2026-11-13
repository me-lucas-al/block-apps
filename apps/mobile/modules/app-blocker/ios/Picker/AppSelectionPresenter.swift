import FamilyControls
import SwiftUI
import UIKit

@MainActor
enum AppSelectionPresenter {
    static func presentPicker(startingFrom initialSelection: FamilyActivitySelection) async -> FamilyActivitySelection? {
        guard let presenter = TopViewControllerFinder.findTopViewController() else { return nil }
        return await withCheckedContinuation { continuation in
            var hostingController: UIViewController?
            var alreadyFinished = false
            let pickerView = AppSelectionPickerView(initialSelection: initialSelection) { chosenSelection in
                if alreadyFinished { return }
                alreadyFinished = true
                hostingController?.dismiss(animated: true) {
                    continuation.resume(returning: chosenSelection)
                }
            }
            let controller = UIHostingController(rootView: pickerView)
            controller.isModalInPresentation = true
            hostingController = controller
            presenter.present(controller, animated: true)
        }
    }
}
