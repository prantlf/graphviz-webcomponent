OLD_VERSION=$(shell sed 's/.*Version \([.0-9]\+\)\..*/\1/;t;d' docs/index.html)

all ::
	npm run all
	cd docs && npm run all && cd ..

upgrade-version ::
ifeq (,$(VERSION))
	@echo "Missing VERSION parameter."
	@exit 1
endif
ifeq (,$(OLD_VERSION))
	@echo "Could not detect current version."
	@exit 1
endif
	@echo "Upgrading from $(OLD_VERSION) to $(VERSION)."
	sed -i "s/Version $(OLD_VERSION)/Version $(VERSION)/" docs/index.html
	sed -i "s/@$(OLD_VERSION)/@$(VERSION)/g" src/graph.js
	sed -i "s/@$(OLD_VERSION)/@$(VERSION)/g" README.md
	git add docs/index.html src/graph.js README.md
	git commit -m 'chore: Bump version number'

update-docs ::
	git add docs/js/*.min.* docs/css/*.min.*
	git commit -m 'chore: Update GitHub pages'

update-changelog ::
	git add CHANGELOG.md
	git commit -m 'docs: Update changelog'
