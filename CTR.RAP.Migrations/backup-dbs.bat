@echo off
cls

rem Set these variables to the desired values

set SqlServer=WIN8
set InstanceName=MSSQLSERVER2016
set Username=sa
set Password=RapSecret
set LocalFolder=E:\Data\Backups

echo Getting current date and time...
echo.
for /f %%a in ('sqlcmd -S %SqlServer% -U %Username% -P %Password% -Q "SET NOCOUNT ON select ltrim(convert(date, getdate()))" -h -1') do set CurrentDate=%%a
for /f %%a in ('sqlcmd -S %SqlServer% -U %Username% -P %Password% -Q "SET NOCOUNT ON select right('00' + ltrim(datepart(hour, getdate())), 2)" -h -1') do set CurrentHour=%%a
for /f %%a in ('sqlcmd -S %SqlServer% -U %Username% -P %Password% -Q "SET NOCOUNT ON select right('00' + ltrim(datepart(minute, getdate())), 2)" -h -1') do set CurrentMinute=%%a
for /f %%a in ('sqlcmd -S %SqlServer% -U %Username% -P %Password% -Q "SET NOCOUNT ON select right('00' + ltrim(datepart(second, getdate())), 2)" -h -1') do set CurrentSecond=%%a

for %%d in (
    "RAP#ARS Cleanup Restore Rebuild"
    "RAP#ARS Restoration Specialists"
    "RAP#ARS Services"
    "RAP#Baxter Restoration"
    "RAP#Carrara"
    "RAP#Carroll Solutions"
    "RAP#Catastrophe Services Inc"
    "RAP#Cera Restoration"
    "RAP#Cleanup & Total Restoration"
    "RAP#Concraft Inc."
    "RAP#Core"
    "RAP#CoreStaging"
    "RAP#Demo Company 100"
    "RAP#Disaster One"
    "RAP#Dummy"
    "RAP#Enviro Clean Restore"
    "RAP#Giertsens"
    "RAP#Harbro"
    "RAP#HarenLaughlin Restoration"
    "RAP#JR Johnson"
    "RAP#KB Construction"
    "RAP#Kowalski"
    "RAP#Maxons"
    "RAP#Mike test"
    "RAP#Parker Young"
    "RAP#Purofirst of Metropolitan Washington"
    "RAP#RAP Training"
    "RAP#Shane Cunningham"
    "RAP#Sharp, Robins & Popwell"
    "RAP#South River Restoration (MD)"
    "RAP#VanDam and Krusinga Building and Restoration"
    "RAP#Woodard Cleaning and Restoration"
) do (
    echo.
    echo Backing up %%~d to %LocalFolder%
    echo.
    SqlCmd -S %SqlServer% -U %Username% -P %Password% -Q "Backup Database [%%~d] To Disk='%LocalFolder%\%%~d-%CurrentDate%_%CurrentHour%%CurrentMinute%%CurrentSecond%.bak'"
)


