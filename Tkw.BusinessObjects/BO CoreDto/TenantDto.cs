namespace BusinessObjects
{
    using System;
    using System.Collections.Generic;
    using System.Runtime.Serialization;
    using System.ComponentModel.DataAnnotations;

    [DataContract(Name = "Tenant", Namespace = "http://www.yourcompany.com/types/")]
    public class TenantDto
    {
        [DataMember]
        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string UserName { get; set; }

        [DataMember]
        public string RawPassword { get; set; }

        [DataMember]
        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string Name { get; set; }

        [DataMember]
        public string Phone { get; set; }

        [DataMember]
        public string Address { set; get; }

        [DataMember]
        public string City { get; set; }
        [DataMember]
        public string State { get; set; }
        [DataMember]
        public string Zip { get; set; }
        [DataMember]
        public string Website { get; set; }

        [DataMember]
        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [EmailAddress]
        public string Email { get; set; }

        [DataMember]
        public DateTime? CreateDate { get; set; }
    }
}
