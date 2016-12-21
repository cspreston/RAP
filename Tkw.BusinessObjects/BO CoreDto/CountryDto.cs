namespace BusinessObjects
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;

    [DataContract(Name = "Country", Namespace = "http://www.yourcompany.com/types/")]
    public class CountryDto
    {
        [DataMember]
        [Display(Name = "Id", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public int Id { get; set; }

        [DataMember]
        [Display(Name = "Name", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string Name { get; set; }

        [DataMember]
        [Display(Name = "IsoCode", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string IsoCode { get; set; }
    }
}
