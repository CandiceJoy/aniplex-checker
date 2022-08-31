if not exist dist (
	mkdir dist
)

cd dist

if exist aniplex-checker (
	del /Q /S aniplex-checker
	rmdir aniplex-checker
)

mkdir aniplex-checker
copy "..\main.js" "aniplex-checker"
copy "..\package.json" "aniplex-checker"
copy "..\runme.bat" "aniplex-checker"

if exist "aniplex-checker.zip" (
	del /Q /S aniplex-checker.zip
)

zip -ru "aniplex-checker.zip" "aniplex-checker"
del /Q /S aniplex-checker
rmdir aniplex-checker
