namespace BusinessObjects
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;

    [DataContract(Name = "ContactInfo", Namespace = "http://www.yourcompany.com/types/")]
    public class ContactInfoDto
    {
        [DataMember]
        public virtual string Id { get; set; }
        [DataMember]
        public virtual string BuildingId { get; set; }
        [DataMember]
        public virtual string Title { get; set; }
        [DataMember]
        public virtual string FirstName { get; set; }
        [DataMember]
        public virtual string LastName { get; set; }
        [DataMember]
        public virtual string Role { get; set; }
        [DataMember]
        public virtual string EmailAddress { get; set; }
        [DataMember]
        public virtual string Phone { get; set; }
        [DataMember]
        public virtual string MobilePhone { get; set; }
        [DataMember]
        public virtual string Address { get; set; }
        [DataMember]
        public virtual string SecondAddress { get; set; }
        [DataMember]
        public virtual string City { get; set; }
        [DataMember]
        public virtual string State { get; set; }
        [DataMember]
        public virtual string Zip { get; set; }

        public static ContactInfoDto Create(ContactInfo e)
        {
            return new ContactInfoDto()
            {
                Id = e.Id,
                BuildingId = e.BuildingId,
                Title = e.Title,
                FirstName = e.FirstName,
                LastName = e.LastName,
                Role = e.Role,
                EmailAddress = e.EmailAddress,
                Phone = e.Phone,
                MobilePhone = e.MobilePhone,
                Address = e.Address,
                SecondAddress = e.SecondAddress,
                City = e.City,
                State = e.State,
                Zip = e.Zip
            };
        }

    }
}
