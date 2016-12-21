namespace Common
{
    using BusinessObjects;
    using Common;
    using Independent;
    using Microsoft.AspNet.Identity;
    using Microsoft.AspNet.Identity.EntityFramework;
    using Microsoft.AspNet.Identity.Owin;
    using Microsoft.Owin;
    using Microsoft.Owin.Security;
    using System;
    using System.Data.Entity;
    using System.Threading.Tasks;

    public partial class UserManager : UserManager<User>
    {
        public UserManager()
            : base(new UserStore<User>(RepositoryFactory.GetContext(Service.MasterDatabaseNameSpace) as DbContext))
        {
            var provider = new Microsoft.Owin.Security.DataProtection.DpapiDataProtectionProvider("Click2Pay");
            //this.UserTokenProvider = new DataProtectorTokenProvider<User>(provider.Create("ASP.NET Identity"));
            this.UserTokenProvider = new EmailTokenProvider<User, string>();
            this.RegisterTwoFactorProvider("PhoneCode", new PhoneNumberTokenProvider<User>
            {
                MessageFormat = BusinessObjects.Resources.Tkw.R2FMessageFormat
            });
            this.RegisterTwoFactorProvider("EmailCode", new EmailTokenProvider<User>
            {
                Subject = BusinessObjects.Resources.Tkw.R2FSubject,
                BodyFormat ="{0}"
            });
            this.UserValidator = new UserValidator<User>(this)
            {
                AllowOnlyAlphanumericUserNames = false,
                RequireUniqueEmail = true
            };
            this.SmsService = new SmsService();
            this.EmailService = new EmailService();
            
            this.UserLockoutEnabledByDefault = true;
            this.DefaultAccountLockoutTimeSpan = TimeSpan.FromMinutes(15);
            this.MaxFailedAccessAttemptsBeforeLockout = 3;

            this.PasswordValidator = new PasswordValidator
            {
                RequiredLength = 1,
                RequireNonLetterOrDigit = false,
                RequireDigit = false,
                RequireLowercase = false,
                RequireUppercase = false
            };
        }

        public UserManager(IUserStore<User> store)
            : base(store)
        {
        }

        public static UserManager Create(IdentityFactoryOptions<UserManager> options, IOwinContext context)
        {
            var manager = new UserManager(new UserStore<User>(RepositoryFactory.GetContext(Service.MasterDatabaseNameSpace) as DbContext));
            // Configure validation logic for usernames
            manager.UserValidator = new UserValidator<User>(manager)
            {
                AllowOnlyAlphanumericUserNames = false,
                RequireUniqueEmail = true
            };
            // Configure validation logic for passwords
            manager.PasswordValidator = new PasswordValidator
            {
                RequiredLength = 1,
                RequireNonLetterOrDigit = false,
                RequireDigit = false,
                RequireLowercase = false,
                RequireUppercase = false
            };

            // Register two factor authentication providers. This application uses Phone and Emails as a 
            // step of receiving a code for verifying the user
            // You can write your own provider and plug it in here.
            manager.RegisterTwoFactorProvider("PhoneCode", new PhoneNumberTokenProvider<User>
            {
                MessageFormat = BusinessObjects.Resources.Tkw.R2FMessageFormat
            });
            manager.RegisterTwoFactorProvider("EmailCode", new EmailTokenProvider<User>
            {
                Subject = BusinessObjects.Resources.Tkw.R2FSubject,
                BodyFormat = BusinessObjects.Resources.Tkw.R2FMessageFormat
            });
            manager.SmsService = new SmsService();
           
            //manager.EmailService = new EmailService();

            var dataProtectionProvider = options.DataProtectionProvider;
            if (dataProtectionProvider != null)
            {
                manager.UserTokenProvider = new DataProtectorTokenProvider<User>(dataProtectionProvider.Create("ASP.NET Identity"));
            }
            return manager;
        }
    }
}
