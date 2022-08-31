@ECHO OFF
cls

echo "Checking for node..."
WHERE node
IF %ERRORLEVEL% NEQ 0 (
	echo "Node not found; downloading..."
	powershell -Command "Invoke-WebRequest https://nodejs.org/dist/v18.8.0/node-v18.8.0-x64.msi -OutFile node-v18.8.0-x64.msi"
	echo "Installing node..."
	node-v18.8.0-x64.msi
)

echo "Checking for npm..."
WHERE npm
IF %ERRORLEVEL% NEQ 0 (
	echo "Node found but NPM wasn't; not sure what to do"
	pause
	exit
)

echo "Checking for node_modules"
if not exist node_modules (
	echo "Not found; running npm install"
    npm install
)

echo "Executing program..."
npm start
exit
