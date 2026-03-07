.PHONY: setup-mac setup-mac-user doctor-mac doctor-mac-perm one-click-mac build-desktop build-ios dev-api dev-runtime demo-desktop demo-mobile deploy-api run-bridge

setup-mac:
	bash scripts/setup-macos.sh

setup-mac-user:
	bash scripts/setup-macos-userland.sh

doctor-mac:
	bash scripts/doctor-macos.sh

doctor-mac-perm:
	bash scripts/doctor-permissions-macos.sh

one-click-mac:
	bash scripts/one-click-macos.sh

build-desktop:
	bash scripts/build-desktop.sh

build-ios:
	bash scripts/build-ios.sh

dev-api:
	bash scripts/dev-api.sh

dev-runtime:
	bash scripts/dev-runtime.sh

run-bridge:
	bash scripts/run-bridge-macos.sh

demo-desktop:
	bash scripts/run-desktop-demo.sh

demo-mobile:
	bash scripts/run-mobile-demo.sh

deploy-api:
	bash scripts/deploy-local-api.sh
