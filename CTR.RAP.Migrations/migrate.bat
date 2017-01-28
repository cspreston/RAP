ECHO OFF
SETLOCAL ENABLEEXTENSIONS
SET me=%~n0
SET parent=%~dp0
SET task=%1
SET migrator="%parent%\..\packages\FluentMigrator.1.6.2\tools\migrate.exe"
SET target="%parent%\bin\Debug\CTR.RAP.Migrations.dll"

IF "%task%"=="" (SET task="migrate")

%migrator% --conn "Data Source=(local);Initial Catalog=RAP#Cleanup & Total Restoration;Integrated Security=true;" --provider sqlserver2014 --assembly %target% --task %task% --verbose true

