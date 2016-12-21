namespace Tools
{
    using System;
    using System.Collections.Generic;
    using System.Globalization;
    using System.IO;
    using System.Linq;
    using System.Security.Claims;
    using System.Threading;
    using System.Web;
    using System.Xml;

    public class Helper : IDisposable
    {
        public bool IsRoot()
        {
            var identity = Thread.CurrentPrincipal.Identity;
            if (identity == null || !identity.IsAuthenticated)
                return false;
            ClaimsPrincipal currentClaimsPrincipal = Thread.CurrentPrincipal as ClaimsPrincipal;
            if (currentClaimsPrincipal == null)
                return false;
            return currentClaimsPrincipal.IsInRole(Tools.DefaultValues.ROLE_ROOT);
        }

        public bool IsCompanyAdministrator()
        {
            var identity = Thread.CurrentPrincipal.Identity;
            if (identity == null || !identity.IsAuthenticated)
                return false;
            ClaimsPrincipal currentClaimsPrincipal = Thread.CurrentPrincipal as ClaimsPrincipal;
            if (currentClaimsPrincipal == null)
                return false;
            return currentClaimsPrincipal.IsInRole(Tools.DefaultValues.TENANT);
        }

        public string GetUserId()
        {
            var principal = (ClaimsPrincipal)Thread.CurrentPrincipal;
            if (principal != null && principal.Identity != null && principal.Identity.IsAuthenticated)
            {
                return principal.Claims.Any(x => x.Type == "UserId") ? principal.Claims.FirstOrDefault(x => x.Type == "UserId").Value : string.Empty;
            }
            else
                return string.Empty;
        }

        public string GetLastUsedCompanyId()
        {
            var principal = (ClaimsPrincipal)Thread.CurrentPrincipal;
            if (principal != null && principal.Identity != null && principal.Identity.IsAuthenticated)
            {
                return principal.Claims.Any(x => x.Type == "LastUsedCompanyId") ? principal.Claims.FirstOrDefault(x => x.Type == "LastUsedCompanyId").Value : string.Empty;
            }
            else
                return string.Empty;
        }

        public static string GetClientIp()
        {
            if (HttpContext.Current != null && HttpContext.Current.Request != null)
            {
                var ip = HttpContext.Current.Request.Params["HTTP_X_FORWARDED_FOR"];
                if (string.IsNullOrEmpty(ip) || ip.Equals("unknown", StringComparison.OrdinalIgnoreCase))
                {
                    ip = HttpContext.Current.Request.Params["REMOTE_ADDR"];
                }
                if (ip.Contains(":"))
                    ip = ip.Split(':')[0];
                return ip;
            }
            else
                return string.Empty;
        }

        public static string GetClientAgent()
        {
            if (HttpContext.Current != null && HttpContext.Current.Request != null)
                return
                       string.Concat(HttpContext.Current.Request.Browser.Type, ",", HttpContext.Current.Request.Browser.Browser, ",", HttpContext.Current.Request.Browser.Version) ?? string.Empty;
            else
                return string.Empty;
        }

        public static string GetClientHttpReferer()
        {
            if (HttpContext.Current != null && HttpContext.Current.Request != null)
                return HttpContext.Current.Request.Params["HTTP_REFERER"];
            else
                return string.Empty;
        }

        public string GetTenantDatabase()
        {
            var principal = (ClaimsPrincipal)Thread.CurrentPrincipal;
            if (principal != null && principal.Identity != null && principal.Identity.IsAuthenticated)
            {
                return principal.Claims.Any(x => x.Type == "DataBase") ? principal.Claims.FirstOrDefault(x => x.Type == "DataBase").Value : string.Empty;
            }
            else
                return string.Empty;
        }

        public int? GetTenantDatabaseId()
        {
            var principal = (ClaimsPrincipal)Thread.CurrentPrincipal;
            if (principal != null && principal.Identity != null && principal.Identity.IsAuthenticated)
            {
                return principal.Claims.Any(x => x.Type == "DataBaseId") ? Convert.ToInt32(principal.Claims.FirstOrDefault(x => x.Type == "DataBaseId").Value) : (int?)null;
            }
            else
                return (int?)null;
        }

        public string GetCurrentCulture()
        {
            var principal = (ClaimsPrincipal)Thread.CurrentPrincipal;
            if (principal != null && principal.Identity != null && principal.Identity.IsAuthenticated)
            {
                var result = principal.Claims.Any(x => x.Type == "Culture") ? principal.Claims.FirstOrDefault(x => x.Type == "Culture").Value : string.Empty;
                return result = string.IsNullOrEmpty(result) ? Tools.DefaultValues.DEFAULT_CULUTURE : result;
            }
            else
                return string.Empty;
        }

        public string GetUserSessionId()
        {
            var principal = (ClaimsPrincipal)Thread.CurrentPrincipal;
            if (principal != null && principal.Identity != null && principal.Identity.IsAuthenticated)
            {
                return principal.Claims.Any(x => x.Type == "SessionId") ? principal.Claims.FirstOrDefault(x => x.Type == "SessionId").Value : string.Empty;
            }
            else
                return string.Empty;
        }

        public static string GetConnectionString(string name)
        {
            string returnValue = string.Empty;
            XmlDocument doc = new XmlDocument();
            XmlTextReader reader = new XmlTextReader(System.AppDomain.CurrentDomain.BaseDirectory + Tools.DefaultValues.APPSETTINGSFILE);
            try
            {
                doc.Load(reader);
                XmlNode conn = doc.SelectSingleNode("/settings/connections/connection[@Name=\"" + name + "\"]");
                returnValue = string.Format(Tools.DefaultValues.CONNECTION
                    , conn.Attributes["Server"].Value
                    , conn.Attributes["InitialCatalog"].Value
                    , conn.Attributes["UserId"].Value
                    , conn.Attributes["Password"].Value
                    );
            }
            catch (System.IO.IOException)
            {
            }
            finally
            {
                reader.Close();
            }
            if (string.IsNullOrEmpty(returnValue))
                throw new InvalidOperationException(String.Format("No {0} connection found in configuration", name));
            return returnValue;
        }

        public static string GetUserIP()
        {
            string visitorsIPAddr = string.Empty;
            if (HttpContext.Current.Request.ServerVariables["HTTP_X_FORWARDED_FOR"] != null)
            {
                visitorsIPAddr = HttpContext.Current.Request.ServerVariables["HTTP_X_FORWARDED_FOR"].ToString();
            }
            else if (HttpContext.Current.Request.UserHostAddress.Length != 0)
            {
                visitorsIPAddr = HttpContext.Current.Request.UserHostAddress;
            }
            return visitorsIPAddr;
        }

        private static string _version = string.Empty;

        public static string GetVersion
        {
            get
            {
                if (string.IsNullOrEmpty(_version))
                {
                    string path = HttpContext.Current.Server.MapPath("~/App_Data/"); ;
                    using (var file = System.IO.File.OpenText(path + "Versions.txt"))
                    {
                        _version = file.ReadLine().TrimEnd().TrimStart();
                        file.Close();
                    }
                }
                return _version;
            }
        }

        public static string SetFileNameVersion(string path)
        {
            if (System.IO.File.Exists(path))
            {
                int i = 1;
                while (true)
                {
                    string temppath = path.Insert(path.LastIndexOf('.'), string.Format("[{0}]", i++));
                    if (!System.IO.File.Exists(temppath))
                        return temppath;
                }
            }
            else
            {
                return path;
            }
        }

        public static void Copy(string sourceDirectory, string targetDirectory)
        {
            DirectoryInfo diSource = new DirectoryInfo(sourceDirectory);
            DirectoryInfo diTarget = new DirectoryInfo(targetDirectory);

            CopyAll(diSource, diTarget);
        }

        public static void CopyAll(DirectoryInfo source, DirectoryInfo target)
        {
            //if (Directory.Exists(target.FullName))
            //{
            //    string[] files = Directory.GetFiles(target.FullName);
            //    string[] dirs = Directory.GetDirectories(target.FullName);

            //    foreach (string file in files)
            //    {
            //        File.SetAttributes(file, FileAttributes.Normal);
            //        File.Delete(file);
            //    }

            //    foreach (string dir in dirs)
            //    {
            //        Directory.Delete(dir, true);
            //    }
            //}

            //if (Directory.Exists(target.FullName))
            //    Directory.Delete(target.FullName, true);
            //Directory.CreateDirectory(target.FullName);

            // Copy each file into the new directory.
            foreach (FileInfo fi in source.GetFiles())
            {
                fi.CopyTo(Path.Combine(target.FullName, fi.Name), true);
            }

            // Copy each subdirectory using recursion.
            foreach (DirectoryInfo diSourceSubDir in source.GetDirectories())
            {
                DirectoryInfo nextTargetSubDir = target.CreateSubdirectory(diSourceSubDir.Name);
                CopyAll(diSourceSubDir, nextTargetSubDir);
            }
        }



        public static string GetFileType(string name)
        {
            string patternImage = @"^.*\.(jpg|jpeg|JPEG|JPG|gif|GIF|png|PNG)$";
            string patternfile = @"^.*\.(pdf|doc|docx|txt)$";
            if (System.Text.RegularExpressions.Regex.IsMatch(name, patternImage))
            {
                return "image";
            }
            if (System.Text.RegularExpressions.Regex.IsMatch(name, patternfile))
            {
                return "pdf";
            }
            return "html";
        }

        #region IDisposable
        public void Dispose()
        {
            GC.SuppressFinalize(this);
        }
        #endregion
    }
}