namespace BusinessObjects
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;

    [DataContract(Name = "BuildingFile", Namespace = "http://www.yourcompany.com/types/")]
    public class BuildingFileDto
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
        [DataMember]
        public virtual BuildingFileType Type { get; set; }
        public static BuildingFileDto Create(BuildingFile a)
        {
            return new BuildingFileDto()
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
