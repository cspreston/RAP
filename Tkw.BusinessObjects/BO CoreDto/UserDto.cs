namespace BusinessObjects
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;
    using System.Linq;

    [DataContract(Name = "User", Namespace = "http://www.yourcompany.com/types/")]
    public class UserDto
    {
        [DataMember]
        public string Id { get; set; }

        [DataMember]
        public string UserName { get; set; }

        [DataMember]
        public string FirstName { get; set; }

        [DataMember]
        public string LastName { get; set; }

        [DataMember]
        public string TenantId { get; set; }
        [DataMember]
        public string TenantName { get; set; }

        [DataMember]
        [DataType(DataType.EmailAddress)]
        [Required]
        public string Email { get; set; }

        [DataMember]
        public UserType Type { get; set; }

        [DataMember]
        public List<string> ClientIds { get; set; }

        [DataMember]
        public DateTime? CreateDate{ get; set; }

        [DataMember]
        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [StringLength(100, ErrorMessage = "The {0} must be at least {2} characters long.", MinimumLength = 6)]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }

        [DataMember]
        [DataType(DataType.Password)]
        [Display(Name = "Confirm password")]
        [Compare("Password", ErrorMessage = "The password and confirmation password do not match.")]
        public string ConfirmPassword { get; set; }

        [DataMember]
        public int? DataBaseId { get; set; }

        [DataMember]
        public string DataBase { get; set; }
        
        [DataMember]
        public string RawPassword { get; set; }

        [DataMember]
        public bool IsActiv { get; set; }

        [DataMember]
        public int? ProfileId { get; set; }

        [DataMember]
        public UserProfileDto UserProfile { get; set; }

        [DataMember]
        public string LastUsedCompanyId { get; set; }

        public virtual CompanyDto LastUsedCompany { get; set; }
        public virtual ICollection<UserCompanyDto> UserCompanies { get; set; }

    }
}