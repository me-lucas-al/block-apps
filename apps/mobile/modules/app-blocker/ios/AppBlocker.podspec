Pod::Spec.new do |spec|
  spec.name           = 'AppBlocker'
  spec.version        = '0.1.0'
  spec.summary        = 'Blocks apps and sites on iOS with the Screen Time API'
  spec.description    = 'Blocks apps and sites on iOS with the Screen Time API'
  spec.author         = 'block-apps'
  spec.homepage       = 'https://github.com/me-lucas-al/block-apps'
  spec.license        = { :type => 'MIT' }
  spec.platforms      = { :ios => '16.0' }
  spec.source         = { :git => '' }
  spec.static_framework = true

  spec.dependency 'ExpoModulesCore'

  spec.frameworks = 'FamilyControls', 'ManagedSettings', 'DeviceActivity', 'SwiftUI'

  spec.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }

  spec.source_files = '**/*.swift'
  spec.exclude_files = 'BlockingCore/Package.swift', 'BlockingCore/Tests/**/*'
end
