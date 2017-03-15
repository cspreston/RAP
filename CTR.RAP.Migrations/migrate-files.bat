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
IF "%--context%"=="" (SET --context=Test)
IF "%--tag%"=="" (SET --tag=S3FileMigration2)

SET migrator="%parent%..\packages\FluentMigrator.1.6.2\tools\migrate.exe"
SET target="%parent%bin\%--env%\CTR.RAP.Migrations.dll"

for %%d in (
    "RAP#Dummy"
    "RAP#Maxons"
    "RAP#Giertsens"
    "RAP#Cleanup & Total Restoration"
    "RAP#Kowalski"
    "RAP#Catastrophe Services Inc"
    "RAP#Parker Young"
    "RAP#Sharp, Robins & Popwell"
    "RAP#VanDam and Krusinga Building and Restoration"
    "RAP#Carroll Solutions"
    "RAP#Demo Company 100"
    "RAP#Baxter Restoration"
    "RAP#Woodard Cleaning and Restoration"
    "RAP#ARS Services"
    "RAP#Cera Restoration"
    "RAP#Carrara"
    "RAP#Mike test"
    "RAP#Disaster One"
    "RAP#Shane Cunningham"
    "RAP#HarenLaughlin Restoration"
    "RAP#Purofirst of Metropolitan Washington"
    "RAP#South River Restoration (MD)"
    "RAP#Concraft Inc."
    "RAP#Harbro"
    "RAP#JR Johnson"
    "RAP#RAP Training"
    "RAP#KB Construction"
    "RAP#ARS Restoration Specialists"
    "RAP#Enviro Clean Restore"
    "RAP#ARS Cleanup Restore Rebuild"
) do (
    %migrator% --conn "Data Source=(local);Initial Catalog=%%~d;Integrated Security=true;" --provider sqlserver2014 --assembly %target% --task %--task% --tag %--tag% --context %--context%  --verbose true
)
