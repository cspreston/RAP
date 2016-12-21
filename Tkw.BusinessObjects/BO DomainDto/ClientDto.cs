namespace BusinessObjects
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;

    [DataContract(Name = "Client", Namespace = "http://www.yourcompany.com/types/")]
    public class ClientDto
    {
        [DataMember]
        public virtual string Id { get; set; }

        [DataMember]
        public virtual string ActorId { get; set; }
        [DataMember]
        public virtual string FirstName { get; set; }
        [DataMember]
        public virtual string LastName { get; set; }
        [DataMember]
        public virtual string PhoneNumber { get; set; }
        [DataMember]
        public virtual string Address { set; get; }
        [DataMember]
        public virtual string Email { get; set; }
        [DataMember]
        public virtual string Fax { get; set; }

        [DataMember]
        public virtual ActorDto Actor { get; set; }


        public static ClientDto Create(Client e)
        {
            return new ClientDto()
            {
                Id = e.Id,
                ActorId = e.ActorId,
                Address = e.Address,
                Email = e.Email,
                Fax=e.Fax,
                FirstName = e.FirstName,
                LastName = e.LastName,
                PhoneNumber = e.PhoneNumber
            };
        }
    }
}
