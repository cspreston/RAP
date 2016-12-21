namespace Common
{
    using System.Resources;

    public static class ResourceService
    {
        public static ResourceManager TkwResource
        {
            get
            {
                return BusinessObjects.Resources.Tkw.ResourceManager;
            }
        }

        public static string LocalizeIdentityError(string error, Microsoft.AspNet.Identity.EntityFramework.IdentityUser user)
        {
            if (error == "User already in role.") return BusinessObjects.Resources.Tkw.UserAlreadyInRole;
            else if (error == "User is not in role.") return BusinessObjects.Resources.Tkw.UserIsNotInRole;
            //else if (error == "Role {0} does not exist.") return "De rol bestaat nog niet";
            //else if (error == "Store does not implement IUserClaimStore&lt;TUser&gt;.") return "";
            //else if (error == "No IUserTwoFactorProvider for '{0}' is registered.") return "";
            //else if (error == "Store does not implement IUserEmailStore&lt;TUser&gt;.") return "";
            else if (error == "Incorrect password.") return BusinessObjects.Resources.Tkw.IncorrectPassword;
            //else if (error == "Store does not implement IUserLockoutStore&lt;TUser&gt;.") return "";
            //else if (error == "No IUserTokenProvider is registered.") return "";
            //else if (error == "Store does not implement IUserRoleStore&lt;TUser&gt;.") return "";
            //else if (error == "Store does not implement IUserLoginStore&lt;TUser&gt;.") return "";
            else if (error == "User name {0} is invalid, can only contain letters or digits.") return string.Format(BusinessObjects.Resources.Tkw.InvalidUserName, user.UserName);
            //else if (error == "Store does not implement IUserPhoneNumberStore&lt;TUser&gt;.") return "";
            //else if (error == "Store does not implement IUserConfirmationStore&lt;TUser&gt;.") return "";
            else if (error.StartsWith("Passwords must be at least ")) return BusinessObjects.Resources.Tkw.PasswordLength;
            //else if (error == "{0} cannot be null or empty.") return "";
            else if (user != null && error == "Name " + user.UserName + " is already taken.") return string.Format(BusinessObjects.Resources.Tkw.UserNameIsTaken, user.UserName);
            else if (error == "User already has a password set.") return BusinessObjects.Resources.Tkw.UserHasPassword;
            //else if (error == "Store does not implement IUserPasswordStore&lt;TUser&gt;.") return "";
            else if (error == "Passwords must have at least one non letter or digit character.") return BusinessObjects.Resources.Tkw.RequireNonLetterOrDigit;
            else if (error == "UserId not found.") return BusinessObjects.Resources.Tkw.UserIdNotFound;
            else if (error == "Invalid token.") return BusinessObjects.Resources.Tkw.InvalidToken;
            else if (user != null && error == "Email '" + user.Email + "' is invalid.") return string.Format(BusinessObjects.Resources.Tkw.InvalidEmail, user.Email);
            else if (user != null && error == "User " + user.UserName + " does not exist.") return string.Format(BusinessObjects.Resources.Tkw.UserNameNotExist, user.UserName);
            else if (error == "Lockout is not enabled for this user.") return BusinessObjects.Resources.Tkw.LockoutIsNotEnabled;
            //else if (error == "Store does not implement IUserTwoFactorStore&lt;TUser&gt;.") return "";
            else if (error == "Passwords must have at least one uppercase ('A'-'Z').") return BusinessObjects.Resources.Tkw.RequireUppercase;
            else if (error == "Passwords must have at least one digit ('0'-'9').") return BusinessObjects.Resources.Tkw.RequireDigit;
            else if (error == "Passwords must have at least one lowercase ('a'-'z').") return BusinessObjects.Resources.Tkw.RequireLowercase;
            //else if (error == "Store does not implement IQueryableUserStore&lt;TUser&gt;.") return "";
            else if (user != null && error == "Email '" + user.Email + "' is already taken.") return string.Format(BusinessObjects.Resources.Tkw.EmailIsTaken, user.Email);
            //else if (error == "Store does not implement IUserSecurityStampStore&lt;TUser&gt;.") return "";
            else if (error == "A user with that external login already exists.") return BusinessObjects.Resources.Tkw.ExternalLoginAlreadyExists;
            else if (error == "An unknown failure has occured.") return BusinessObjects.Resources.Tkw.UnknownFailure;
            else if (error.Contains("one non letter or digit character") || error.Contains("least one lowercase") || error.Contains("least one uppercase") || error.Contains("at least one digit"))
                return string.Concat(BusinessObjects.Resources.Tkw.RequireUppercase, BusinessObjects.Resources.Tkw.RequireDigit, BusinessObjects.Resources.Tkw.RequireLowercase, BusinessObjects.Resources.Tkw.RequireNonLetterOrDigit);

            return error;
        }
    }
}