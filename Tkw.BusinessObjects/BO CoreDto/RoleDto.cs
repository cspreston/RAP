namespace BusinessObjects
{
    using System;
    using System.Collections.Generic;
    using System.Runtime.Serialization;
    using System.ComponentModel.DataAnnotations;

    [DataContract(Name = "Role", Namespace = "http://www.yourcompany.com/types/")]
    public class RoleDto
    {
        public RoleDto()
        {
            Childs = new List<RoleDto>();
        }

        [DataMember]
        [Display(Name = "Id", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string Id { get; set; }

        [DataMember]
        [Display(Name = "Name", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string Name { get; set; }

        [DataMember]
        [Display(Name = "Activated", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public bool Activated { get; set; }

        [DataMember]
        [Display(Name = "HasChildren", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public bool HasChildren { get; set; }

        [DataMember]
        [Display(Name = "Parent", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string Parent { get; set; }

        [DataMember]
        [Display(Name = "Childs", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public List<RoleDto> Childs = new List<RoleDto>();

        [DataMember]
        [Display(Name = "RequestedUserName", ResourceType = typeof(BusinessObjects.Resources.Tkw))]
        public string RequestedUserName { get; set; }
    }
}