using System.Collections.Generic;
namespace Tools
{
    public static class DefaultValues
    {
        public const string DEFAULT_USERINFO = "Root";
        public const string DEFAULT_USERPASS = "123456";
        public const string ROLE_ROOT = "Root";

        public const string APPSETTINGSFILE = "\\App_Data\\AppSettings.xml";
        public const string EMAILSETTINGSFILE = "App_Data\\EmailSettings.xml";
        public const string FILESDIRECTORY = "\\Files\\";
        public const string FILESDIRECTORYDOWNLOAD = "\\Files\\ZIP\\";
        public const string PDFTOIMG = "\\Files\\TempData\\BulkPlanInsert\\";
        public const string CONNECTION = "Server={0}; Database={1}; User ID={2}; Password={3}; Asynchronous Processing=True; Persist Security Info=True; MultipleActiveResultSets=True";
        public const string CONNECTION_TENANT = "Common.Tenant";
        public const string SESSION_USERCULTURE = "SESSION_USERCULTURE";


        public const string TENANT = "Company Admin";
        public const string CLIENT_ADMIN = "Client Admin";
        public const string BUILDING_ADMIN = "Site Admin";
        public const string BUILDING_VIEWER = "Site Viewer";

        public const string DEFAULT_CULUTURE = "en-US";

        public const string BUILDING_FILE_PLANS = "Plans";
        public const string BUILDING_FILE_IMAGES = "Images";
        public const string BUILDING_FILE_FILES = "Files";
        public const string BUILDING_FILE_DISASTERINFOS = "DisasterInfos";


        public static List<string> BuildingDefaultFolders = new List<string>()
        {
           BUILDING_FILE_PLANS,
           BUILDING_FILE_IMAGES,
           BUILDING_FILE_FILES,
           BUILDING_FILE_DISASTERINFOS
        };

        public static List<string> ExceptUrls = new List<string>()
        {
           "account",
           "home",
           "error",
           "registertenant",
           "forgotpassword",
           "resetpassword",
           "sessionend",
           "bundle",
           "script",
           "scripts",
           "content",
           "__browserlink",
           "mini-profiler-resources",
        };

    }
}
