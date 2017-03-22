namespace BusinessObjects
{
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;
    using System.Runtime.Serialization;

    [DataContract(Name = "BuildingImage", Namespace = "http://www.yourcompany.com/types/")]
    public class BuildingImageDto
    {
        [DataMember]
        public string Id { get; set; }
        [DataMember]
        public string BuildingId { get; set; }
        [DataMember]
        public string FileId { get; set; }
        [DataMember]
        public string BucketPath { get; set; }
        [DataMember]
        public string BucketName { get; set; }
        [DataMember]
        public string FileName { set; get; }
        [DataMember]
        public string FileDescription { get; set; }
        [DataMember]
        public string Url { get; set; }
        [DataMember]
        public string ThumbUrl { get; set; }
        [DataMember]
        public string ZoomUrl { get; set; }

        public static BuildingImageDto Create(BuildingImage b)
        {
            return new BuildingImageDto()
            {
                Id = b.Id,
                BucketName = b.File.FileBucket.Name,
                BucketPath = b.File.FileBucket.PhysicalPath,
                FileName = b.File.Name,
                FileDescription = b.File.Description,
                BuildingId = b.BuildingId,
                Url = b.File.Url,
                ThumbUrl = b.File.ThumbUrl,
                ZoomUrl = b.File.ZoomUrl
            };
        }
    }

    [DataContract(Name = "FileWithBucket", Namespace = "http://www.yourcompany.com/types/")]
    public class FileWithButcketDTO
    {
        [DataMember]
        public string Id { get; set; }
        [DataMember]
        public string BucketName { get; set; }
        [DataMember]
        public string BucketPath { get; set; }
        [DataMember]
        public string FileName { get; set; }
        [DataMember]
        public string FileDescription { get; set; }
        [DataMember]
        public string FileUrl { get; set; }
        [DataMember]
        public string ThumbUrl { get; set; }
        [DataMember]
        public string ZoomUrl { get; set; }
        [DataMember]
        public string Dimensions { get; set; }


        public static FileWithButcketDTO Create(BuildingImage a)
        {
            return new FileWithButcketDTO()
            {
                Id = a.Id,
                BucketName = a.File.FileBucket.Name,
                BucketPath = a.File.FileBucket.PhysicalPath,
                FileName = a.File.Name,
                FileDescription = a.File.Description,
                FileUrl = a.File.Url,
                ThumbUrl = a.File.ThumbUrl,
                ZoomUrl = a.File.ZoomUrl,
                Dimensions = a.File.Dimensions
            };
        }
    }
}
