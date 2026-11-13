import FamilyControls
import SwiftUI

struct AppSelectionPickerView: View {
    @State private var selection: FamilyActivitySelection
    private let onFinish: (FamilyActivitySelection?) -> Void

    init(initialSelection: FamilyActivitySelection, onFinish: @escaping (FamilyActivitySelection?) -> Void) {
        _selection = State(initialValue: initialSelection)
        self.onFinish = onFinish
    }

    var body: some View {
        NavigationView {
            FamilyActivityPicker(selection: $selection)
                .navigationTitle("Escolher apps")
                .navigationBarTitleDisplayMode(.inline)
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Cancelar") { onFinish(nil) }
                    }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Concluir") { onFinish(selection) }
                    }
                }
        }
    }
}
