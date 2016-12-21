using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Tools
{
    public static class UrlHelper
    {
        public static string AddParameterToUrl(string url, string key, string value)
        {
            if (url == null)
                url = string.Empty;

            var sep = (url.IndexOf('?') > -1) ? '&' : '?';
            return url + sep + key + '=' + value;
        }
    }
}
