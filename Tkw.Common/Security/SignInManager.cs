namespace Common
{
    using BusinessObjects;
    using Microsoft.AspNet.Identity.Owin;
    using Microsoft.Owin;
    using Microsoft.Owin.Security;
    using System.Security.Claims;
    using System.Data.Entity;
    using System.Linq;
    using System.Collections.Generic;
    using System.Globalization;
    using System.Web.SessionState;

    public class SignInManager : SignInManager<User, string>, IReadOnlySessionState
    {
        public SignInManager(UserManager userManager, IAuthenticationManager authenticationManager)
            : base(userManager, authenticationManager)
        {
        }

        public static SignInManager Create(IdentityFactoryOptions<SignInManager> options, IOwinContext context)
        {
            return new SignInManager(context.GetUserManager<UserManager>(), context.Authentication);
        }

        public override System.Threading.Tasks.Task<System.Security.Claims.ClaimsIdentity> CreateUserIdentityAsync(User user)
        {
            var userIdentity = base.CreateUserIdentityAsync(user);
            userIdentity.Result.AddClaim(new Claim("UserId", user.Id));
            userIdentity.Result.AddClaim(new Claim("DataBaseId", user.DataBaseId.HasValue ? user.DataBaseId.Value.ToString() : string.Empty));
            userIdentity.Result.AddClaim(new Claim("DataBase", user.DataBaseId.HasValue && user.DataBase != null ? user.DataBase.ScreenName : string.Empty));
            userIdentity.Result.AddClaim(new Claim("Email", user.Email != null ? user.Email : string.Empty));
            userIdentity.Result.AddClaim(new Claim("LastUsedCompanyId", GetUserCompanyId(user).ToString()));
            //userIdentity.Result.AddClaim(new Claim("SessionId", System.Web.HttpContext.Current.Session.SessionID));
            //userIdentity.Result.AddClaim(new Claim("Culture", SetUserCultureAndUICulture(user)));
            //SaveUserSession(user, System.Web.HttpContext.Current.Session.SessionID);
            return userIdentity;
        }

        private string GetUserCompanyId(User user)
        {
            if (string.IsNullOrEmpty(user.LastUsedCompanyId))
            {
                var userEmail = user.Email;
                if (!string.IsNullOrEmpty(user.Email))
                {
                    var domain = user.Email.Split('@')[1];
                    if(!string.IsNullOrEmpty(domain)){
                        using (var service = new Service())
                        {
                            //TO DO  - find User Id
                            var company = service.GetService<Common.Core.ICompanyService>().GetAll().FirstOrDefault();
                            if (company != null)
                            {
                                user.LastUsedCompanyId = company.Id;

                                service.Commit();
                            }
                        }
                    }
                }
            }
            return user.LastUsedCompanyId;
        }

        private string SetUserCultureAndUICulture(User user)
        {
            string culture = Tools.DefaultValues.DEFAULT_CULUTURE;
            if (user.UserProfile != null && user.UserProfile.Globalization != null)
                culture = user.UserProfile.Globalization.Locale;
            CultureInfo ci = CultureInfo.GetCultureInfo(culture);
            if (System.Web.HttpContext.Current != null)
                System.Web.HttpContext.Current.Session[Tools.DefaultValues.SESSION_USERCULTURE] = ci;
            return culture;
        }

        private void SaveUserSession(User user, string sessionId)
        {
            using (var service = new Service(user.DataBaseId.Value, user.Id))
            {
                var userSessionService = service.GetService<Common.Core.IUserSessionService>();
                var userSessions = userSessionService.GetAll().Where(x=>x.UserId==user.Id && x.LoggedIn).ToList();
                if (userSessions.Any())
                {
                    userSessions.ForEach(x =>
                    {
                        x.LoggedIn = false;
                        x.LoggedOutDate = System.DateTime.Now;
                        userSessionService.Update(x);
                    });
                }

                var  userSession= userSessionService.Create();
                userSession.UserId = user.Id;
                userSession.SessionId = sessionId;
                userSession.ClientIp = Tools.Helper.GetClientIp();
                userSession.ClientAgent = Tools.Helper.GetClientAgent();
                userSession.LoggedIn = true;
                userSession.LoggedInDate = System.DateTime.Now;
                userSessionService.Add(userSession);
                service.Commit();
            }
        }
    }
}