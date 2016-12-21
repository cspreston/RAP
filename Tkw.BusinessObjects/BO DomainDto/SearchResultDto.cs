namespace BusinessObjects
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;

    [DataContract(Name = "Search", Namespace = "http://www.yourcompany.com/types/")]
    public class SearchResultDto
    {
        // The lists with all needed data
        // Files - All the files
        // Buildings - All the buildings
        // Clients - All the clients
        [DataMember]
        public ICollection<FileWithButcketDTO> Files;
        [DataMember]
        public ICollection<BuildingDto> Buildings;
        [DataMember]
        public ICollection<ContactInfoDto> Contacts;
    }
}
