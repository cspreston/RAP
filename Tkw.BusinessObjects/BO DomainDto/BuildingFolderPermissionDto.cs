namespace BusinessObjects
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;

    [DataContract(Name = "BuildingFolderPermission", Namespace = "http://www.yourcompany.com/types/")]
    public class BuildingFolderPermissionDto
    {
        [DataMember]
        public virtual string Id { get; set; }
        [DataMember]
        public virtual string ActorId { get; set; }
        [DataMember]
        public virtual string ActorName { get; set; }

        [DataMember]
        public virtual string BuildingId { get; set; }

        [DataMember]
        public virtual bool IsViewer { get; set; }

        [DataMember]
        public virtual string File { get; set; }

        [DataMember]
        public virtual bool Create { get; set; }

        [DataMember]
        public virtual bool Read { get; set; }

        [DataMember]
        public virtual bool Delete { get; set; }
        [DataMember]
        public virtual bool SetPermission { get; set; }

    }
}
