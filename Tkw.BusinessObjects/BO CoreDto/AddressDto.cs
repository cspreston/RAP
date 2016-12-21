namespace BusinessObjects
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;

    [DataContract(Name = "Address", Namespace = "http://www.yourcompany.com/types/")]
    public class AddressDto
    {
        [DataMember]
        [Display(Name = "Id", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public int Id { get; set; }

        [DataMember]
        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [StringLength(50, ErrorMessageResourceName = "MaxLength50", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [Display(Name = "Name1", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [RegularExpression(@"^(?!.*[ ]{2})[a-zA-Z0-9\!\@\&\(\)\+\ ]{1,99}(?!  |\s)", ErrorMessageResourceName = "ConsecutiveSpacesValidator", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string Name { get; set; }
         
        [DataMember]
        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [StringLength(50, ErrorMessageResourceName = "MaxLength50", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [Display(Name = "City", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [RegularExpression(@"^(?!.*[ ]{2})[a-zA-Z0-9\!\@\&\(\)\+\ ]{1,99}", ErrorMessageResourceName = "ConsecutiveSpacesValidator", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string City { get; set; }

        [DataMember]
        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [Display(Name = "PostCode", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [RegularExpression(@"^(?!.*[ ]{2})[a-zA-Z0-9\!\@\&\(\)\+\ ]{1,99}(?!  |\s)", ErrorMessageResourceName = "ConsecutiveSpacesValidator", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [StringLength(16, ErrorMessageResourceName = "MaxLength16", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string PostCode { get; set; }

        [DataMember]
        [Required(ErrorMessageResourceName = "IsRequired", ErrorMessageResourceType = typeof(BusinessObjects.Resources.Tkw))]
        [Display(Name = "CountryId", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public int CountryId { get; set; }
       
        [DataMember]
        [Display(Name = "CountryName", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string CountryName { get; set; }

        [DataMember]
        [Display(Name = "CountryCode", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string CountryCode { get; set; }

        [DataMember]
        [Display(Name = "Features", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public AddressFeatures Features { get; set; }

        [DataMember]
        [Display(Name = "IsActive", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public bool IsActive { get; set; }

        [DataMember]
        [Display(Name = "InactiveDate", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public global::System.Nullable<System.DateTime> InactiveDate { get; set; }

        [DataMember]
        [Display(Name = "UpdateDate", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public global::System.Nullable<System.DateTime> UpdateDate { get; set; }

        [DataMember]
        [Display(Name = "CreateDate", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public global::System.Nullable<System.DateTime> CreateDate { get; set; }

    }
}
