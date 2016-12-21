namespace BusinessObjects
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;
    using System.Linq;

    [DataContract(Name = "UserSession", Namespace = "http://www.yourcompany.com/types/")]
    public class UserSessionDto
    {
        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [DataMember]
        [Display(Name = "Id", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public int Id { get; set; }

        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [DataMember]
        [Display(Name = "UserId", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public virtual string UserId { get; set; }

        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [DataMember]
        [Display(Name = "UserName", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public virtual string UserName { get; set; }

        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [DataMember]
        [Display(Name = "DatabaseId", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public int? DatabaseId { get; set; }

        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [DataMember]
        [Display(Name = "TenantDatabase", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string TenantDatabase { get; set; }

        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [DataMember]
        [Display(Name = "SessionId", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public virtual string SessionId { get; set; }

        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [DataMember]
        [Display(Name = "ClientIpAddress", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public virtual string ClientIp { get; set; }

        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [DataMember]
        [Display(Name = "ClientAgent", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public virtual string ClientAgent { get; set; }

        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [DataMember]
        [Display(Name = "LoggedIn", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public virtual bool LoggedIn { get; set; }

        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [DataMember]
        [Display(Name = "LoggedInDate", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public virtual global::System.Nullable<System.DateTime> LoggedInDate { get; set; }

        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [DataMember]
        [Display(Name = "LoggedOutDate", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public virtual global::System.Nullable<System.DateTime> LoggedOutDate { get; set; }
    }
}