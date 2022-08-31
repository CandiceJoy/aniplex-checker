@ECHO OFF
cls

WHERE node -v
IF %ERRORLEVEL% NEQ 0 (
	powershell -Command "Invoke-WebRequest https://nodejs.org/dist/v18.8.0/node-v18.8.0-x64.msi -OutFile node.msi"
	node.msi
)

WHERE npm -v
IF %ERRORLEVEL% NEQ 0 (
	echo "Node found but NPM wasn't; not sure what to do"
	pause
	exit
)

if not exist node_modules (
    npm install
)

npm start
