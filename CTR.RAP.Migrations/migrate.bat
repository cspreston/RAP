ECHO OFF
SETLOCAL ENABLEEXTENSIONS
SET me=%~n0
SET parent=%~dp0

for %%a in (%*) do (
    call set "%%~1=%%~2"
    shift
)

IF "%--env%"=="" (SET --env=Debug)
IF "%--task%"=="" (SET --task=migrate)

SET migrator="%parent%..\packages\FluentMigrator.1.6.2\tools\migrate.exe"
SET target="%parent%bin\%--env%\CTR.RAP.Migrations.dll"

%migrator% --conn "Data Source=(local);Initial Catalog=RAP#Cleanup & Total Restoration;Integrated Security=true;" --provider sqlserver2014 --assembly %target% --task %--task% --verbose true
%migrator% --conn "Data Source=(local);Initial Catalog=RAP#RAP Training;Integrated Security=true;" --provider sqlserver2014 --assembly %target% --task %--task% --verbose true

