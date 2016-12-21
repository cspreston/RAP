namespace BusinessObjects
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;

    [DataContract(Name = "DomainDataBase", Namespace = "http://www.yourcompany.com/types/")]
    public class DomainDataBaseDto
    {
        [DataMember]
        [Display(Name = "Id", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public int Id { get; set; }

        [DataMember]
        [Display(Name = "Name", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string ScreenName { get; set; }
    }
}
