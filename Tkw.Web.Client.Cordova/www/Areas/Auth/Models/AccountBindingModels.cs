namespace Web.Client.Net.Areas.Auth
{
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public class AddExternalLoginBindingModel
    {
        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [Display(Name = "ExternalAccessToken", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string ExternalAccessToken { get; set; }
    }

    public class ChangePasswordBindingModel
    {
        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [DataType(DataType.Password)]
        [Display(Name = "Password", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string OldPassword { get; set; }

        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [StringLength(100, ErrorMessageResourceName = "PasswordLength", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw), MinimumLength = 6)]
        [DataType(DataType.Password)]
        [Display(Name = "NewPassword", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string NewPassword { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "ConfirmPassword", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [Compare("NewPassword", ErrorMessageResourceName = "PasswordCompare", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string ConfirmPassword { get; set; }
    }

    public class RegisterBindingModel
    {
        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [Display(Name = "Email", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string Email { get; set; }

        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [StringLength(100, ErrorMessageResourceName = "PasswordLength", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw), MinimumLength = 6)]
        [DataType(DataType.Password)]
        [Display(Name = "Password", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string Password { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "ConfirmPassword", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [Compare("Password", ErrorMessageResourceName = "PasswordCompare", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string ConfirmPassword { get; set; }
    }

    public class RegisterExternalBindingModel
    {
        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [Display(Name = "Email", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string Email { get; set; }
    }

    public class RemoveLoginBindingModel
    {
        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [Display(Name = "LoginProvider", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string LoginProvider { get; set; }

        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [Display(Name = "ProviderKey", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string ProviderKey { get; set; }
    }

    public class SetPasswordBindingModel
    {
        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [StringLength(100, ErrorMessageResourceName = "PasswordLength", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw), MinimumLength = 6)]
        [DataType(DataType.Password)]
        [Display(Name = "Password", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string NewPassword { get; set; }

        [DataType(DataType.Password)]
        [Display(Name = "ConfirmPassword", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [Compare("NewPassword", ErrorMessageResourceName = "PasswordCompare", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string ConfirmPassword { get; set; }
    }
}
