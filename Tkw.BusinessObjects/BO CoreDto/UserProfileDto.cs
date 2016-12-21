namespace BusinessObjects
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;

    [DataContract(Name = "UserProfile", Namespace = "http://www.yourcompany.com/types/")]
    public class UserProfileDto
    {
        [DataMember]
        public int Id { get; set; }

        [DataMember]
        public string UserId { get; set; }

        [DataMember]
        public int? AddressId { get; set; }

        [DataMember]
        public int? GlobalizationId { get; set; }

        [DataMember]
        [EnumDataType(typeof(UserTitle))]
        public UserTitle Title { get; set; }

        [DataMember]
        public string FirstName { get; set; }

        [DataMember]
        public string LastName { get; set; }    

        [DataMember]
        public bool IsActive { get; set; }

        [DataMember]
        public DateTime? InactiveDate { get; set; }

        [DataMember]
        public DateTime? UpdateDate { get; set; }

        [DataMember]
        public DateTime? CreateDate { get; set; }

        [DataMember]
        public AddressDto Address { get; set; }
    }
}
