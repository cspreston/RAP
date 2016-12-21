namespace BusinessObjects
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;

    [DataContract(Name = "BuildingDisasterInfo", Namespace = "http://www.yourcompany.com/types/")]
    public class BuildingDisasterInfoDto
    {
        [DataMember]
        public virtual string Id { get; set; }
        [DataMember]
        public virtual string BuildingId { get; set; }
        [DataMember]
        public virtual string FileId { get; set; }
        [DataMember]
        public virtual string Title { get; set; }
        [DataMember]
        public virtual string Description { get; set; }
        [DataMember]
        public FileWithButcketDTO File { get; set; }

        public static BuildingDisasterInfoDto Create(BuildingDisasterInfo a)
        {
            return new BuildingDisasterInfoDto()
            {
                Id = a.Id,
                Description = a.Description,
                Title = a.Title,
                BuildingId = a.BuildingId,
                FileId = a.FileId
            };
        }
    }
}
