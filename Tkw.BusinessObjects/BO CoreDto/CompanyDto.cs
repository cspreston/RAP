namespace BusinessObjects
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;
    using System.Linq;

    [DataContract(Name = "Company", Namespace = "http://www.yourcompany.com/types/")]
    public class CompanyDto
    {
        [DataMember]
        public virtual string Id { get; set; }

        [DataMember]
        public virtual string TenantId { get; set; }

        [DataMember]
        public virtual string DataBase { get; set; }

        [DataMember]
        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string Name { get; set; }

        [DataMember]
        public string Phone { get; set; }

        [DataMember]
        public string Address { set; get; }

        [DataMember]
        [EmailAddress]
        public string Email { get; set; }

        [DataMember]
        public string City { get; set; }
        [DataMember]
        public string State { get; set; }
        [DataMember]
        public string Zip { get; set; }

        [DataMember]
        public string Website { get; set; }

        [DataMember]
        public string UserName { get; set; }

        [DataMember]
        public DateTime? CreateDate { get; set; }

        #region Navigation Properties

        public virtual ICollection<UserCompanyDto> UserCompanies { get; set; }

        public virtual UserDto User { get; set; }

        #endregion
    }
}