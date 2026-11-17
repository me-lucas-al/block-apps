// swift-tools-version:5.9
import PackageDescription

let package: Package = Package(
    name: "BlockingCore",
    platforms: [.iOS(.v16), .macOS(.v13)],
    products: [
        .library(name: "BlockingCore", targets: ["BlockingCore"])
    ],
    targets: [
        .target(name: "BlockingCore"),
        .testTarget(name: "BlockingCoreTests", dependencies: ["BlockingCore"])
    ]
)
