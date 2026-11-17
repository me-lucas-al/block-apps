import UIKit

enum TopViewControllerFinder {
    @MainActor
    static func findTopViewController() -> UIViewController? {
        let activeScene = UIApplication.shared.connectedScenes
            .compactMap { $0 as? UIWindowScene }
            .first { $0.activationState == .foregroundActive }
        var topViewController = activeScene?.windows.first { $0.isKeyWindow }?.rootViewController
        while let presented = topViewController?.presentedViewController {
            topViewController = presented
        }
        return topViewController
    }
}
