namespace BusinessObjects
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;

    [DataContract(Name = "BuildingFolder", Namespace = "http://www.yourcompany.com/types/")]
    public class BuildingFolderDto
    {
        [DataMember]
        public virtual string id { get; set; }
        [DataMember]
        public virtual string BuildingId { get; set; }

        [DataMember]
        public virtual string Name { get; set; }
        [DataMember]
        public virtual string ContentPath { get; set; }
        [DataMember]
        public virtual string spriteCssClass { get; set; }
        [DataMember]
        public virtual int type { get; set; }
        [DataMember]
        public virtual bool IsBucket { get; set; }
        [DataMember]
        public virtual PermissionFeature Feature { get; set; }
        [DataMember]
        public virtual bool Create { get; set; }

        [DataMember]
        public virtual bool Read { get; set; }

        [DataMember]
        public virtual bool Delete { get; set; }
        [DataMember]
        public virtual bool SetPermission { get; set; }

        [DataMember]
        public virtual DateTime? CreatedDate { get; set; }

        [DataMember]
        public virtual string CreatedBy { get; set; }
        [DataMember]
        public virtual IList<BuildingFolderDto> items { get; set; }

        [DataMember]
        public virtual bool IsVisible { get; set; }

    }
}
