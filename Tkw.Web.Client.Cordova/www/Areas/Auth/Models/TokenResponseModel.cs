using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Web.Client.Net.Areas.Auth.Models
{
    public class TokenResponse
    {
        public string UserId { get; set; }
        public string UserName { get; set; }
        public string UserCulture { get; set; }
        public string Token_Type { get; set; }
        public string Access_Token { get; set; }
    }
}