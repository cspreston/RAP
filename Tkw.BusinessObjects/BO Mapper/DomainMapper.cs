namespace BusinessObjects
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Threading.Tasks;
    using Tools;

    public static partial class DomainMapper
    {
        #region Address BO
        public static DomainAddressDto ToDto(this DomainAddress item)
        {
            if (item == null) return null;

            return new DomainAddressDto
            {
                Id = item.Id,
                Name = item.Name,
                City = item.City,
                PostCode = item.PostCode,
                CountryId = item.CountryId,
                CountryName = item.CountryName,
                Features = item.Features,
                IsActive = item.IsActive,
                InactiveDate = item.InactiveDate,
                CreateDate = item.CreateDate,
                UpdateDate = item.UpdateDate,
            };
        }
        public static IList<DomainAddressDto> ToDto(this IEnumerable<DomainAddress> items)
        {
            if (items == null) return null;
            return items.Select(c => c.ToDto()).ToList();
        }

        public static void FromDto(this DomainAddress item, DomainAddressDto dto)
        {
            item.Name = dto.Name;
            item.City = dto.City;
            item.PostCode = dto.PostCode;
            item.CountryId = dto.CountryId;
            item.CountryName = dto.CountryName;
            item.IsActive = dto.IsActive;
            item.Features = dto.Features;
            item.IsActive = dto.IsActive;
            item.InactiveDate = dto.InactiveDate;
            item.CreateDate = dto.CreateDate;
            item.UpdateDate = dto.UpdateDate;
        }

        public static DomainAddress FromDto(this DomainAddressDto item)
        {
            if (item == null) return null;

            return new DomainAddress
            {
                Id = item.Id,
                Name = item.Name,
                City = item.City,
                PostCode = item.PostCode,
                CountryId = item.CountryId,
                CountryName = item.CountryName,
                Features = item.Features,
                IsActive = item.IsActive,
                InactiveDate = item.InactiveDate,
            };
        }
        public static IList<DomainAddress> FromDtos(this IEnumerable<DomainAddressDto> dtos, bool domain)
        {
            if (dtos == null) return null;
            return dtos.Select(c => c.FromDto()).ToList();
        }
        #endregion

        #region  Actor BO

        public static ActorDto ToDto(this Actor item, bool withActorTracking = false)
        {
            if (item == null) return null;
            ActorDto dto = new ActorDto();
            dto.Id = item.Id;
            dto.Name = item.Name;

            return dto;
        }
        public static IList<ActorDto> ToDtos(this IEnumerable<Actor> items, bool withActorTracking = false)
        {
            if (items == null) return null;
            return items.Select(c => ToDto(c, withActorTracking)).ToList();
        }

        public static void FromDto(this Actor item, ActorDto dto, bool withActorTracking = false)
        {
            item.Id = dto.Id;
            item.Name = dto.Name;
        }

        public static Actor FromDto(this ActorDto dto, bool withActorTracking = false)
        {
            if (dto == null) return null;
            Actor item = new Actor();
            item.Id = dto.Id;
            item.Name = dto.Name;
            return item;
        }
        public static IList<Actor> FromDtos(this IEnumerable<ActorDto> dtos, bool withActorTracking = false)
        {
            if (dtos == null) return null;
            return dtos.Select(c => c.FromDto(withActorTracking)).ToList();
        }
        #endregion

        #region  Building BO
        public static BuildingDto ToDto(this Building a)
        {
            if (a == null) return null;
            BuildingDto dto = new BuildingDto();
            dto.Id = a.Id;
            dto.ActorId = a.ActorId;
            dto.ActorName = a.Actor.Name;
            dto.Name = a.Name;
            dto.Description = a.Description;
            dto.Address = a.Address;
            dto.BuildingsNo = a.BuildingsNo;
            dto.BuildingType = a.BuildingType;
            dto.ConstructionType = a.ConstructionType;
            dto.EmergencyEmail = a.EmergencyEmail;
            dto.EmergencyPhone = a.EmergencyPhone;
            dto.UnitsNo = a.UnitsNo;
            dto.FeaturedImageId = a.FeaturedImageId;
            dto.ImagesCount = a.BuildingImages != null ? a.BuildingImages.Count(t => t.IsActive) : 0;
            dto.ViewsCount = a.BuildingPlans != null ? a.BuildingPlans.Count(t => t.IsActive) : 0;
            dto.UpdateDate = a.UpdateDate.HasValue ? a.UpdateDate.Value : DateTime.MinValue;
            dto.IsOffline = a.IsOffline;
            dto.OfflineBy = a.OfflineBy;
            dto.BuildingImages = a.BuildingImages.Where(t => t.IsActive).ToList().Select(b => new BuildingImageDto
            {
                Id = b.Id,
                BucketName = b.File.FileBucket.Name,
                BucketPath = b.File.FileBucket.PhysicalPath,
                FileName = b.File.Name,
                FileDescription = b.File.Description,
                Url = b.File.Url,
                ThumbUrl = b.File.ThumbUrl,
                ZoomUrl = b.File.ZoomUrl
            }).ToList();

            return dto;
        }
        public static IList<BuildingDto> ToDtos(this IEnumerable<Building> items, bool withActorTracking = false)
        {
            if (items == null) return null;
            return items.Select(c => c.ToDto()).ToList();
        }
       
        #endregion
    }
}

