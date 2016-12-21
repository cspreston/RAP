namespace BusinessObjects
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Threading.Tasks;
    using Tools;

    public static partial class CoreMapper
    {
        #region Address BO
        public static AddressDto ToDto(this Address item)
        {
            if (item == null) return null;

            return new AddressDto
            {
                Id = item.Id,
                Name = item.Name,
                City = item.City,
                PostCode = item.PostCode,
                CountryId = item.CountryId,
                CountryName = item.Country.Name,
                CountryCode = item.Country.IsoCode,
                Features = item.Features,
                IsActive = item.IsActive,
                InactiveDate = item.InactiveDate,
                CreateDate = item.CreateDate,
                UpdateDate = item.UpdateDate,
            };
        }
        public static IList<AddressDto> ToDto(this IEnumerable<Address> items)
        {
            if (items == null) return null;
            return items.Select(c => c.ToDto()).ToList();
        }

        public static void FromDto(this Address item, AddressDto dto)
        {
            item.Name = dto.Name;
            item.City = dto.City;
            item.PostCode = dto.PostCode;
            item.CountryId = dto.CountryId;
            item.Features = dto.Features;
            item.IsActive = dto.IsActive;
            item.InactiveDate = dto.InactiveDate;
            item.CreateDate = dto.CreateDate;
            item.UpdateDate = dto.UpdateDate;
        }
      
        public static Address FromDto(this AddressDto item)
        {
            if (item == null) return null;

            return new Address
            {
                Id = item.Id,
                Name = item.Name,
                City = item.City,
                PostCode = item.PostCode,
                CountryId = item.CountryId,
                Features = item.Features,
                IsActive = item.IsActive,
                InactiveDate = item.InactiveDate,
                CreateDate = item.CreateDate,
                UpdateDate = item.UpdateDate,
            };
        }
        public static IList<Address> FromDtos(this IEnumerable<AddressDto> dtos)
        {
            if (dtos == null) return null;
            return dtos.Select(c => c.FromDto()).ToList();
        }
        #endregion

        #region  Role BO
        public static RoleDto ToDto(this Role item)
        {
            if (item == null) return null;

            return new RoleDto
            {
                Id = item.Id,
                Name = item.Name,
            };
        }
        public static IList<RoleDto> ToDtos(this IEnumerable<Role> items)
        {
            if (items == null) return null;
            return items.Select(c => c.ToDto()).ToList();
        }

        public static Role FromDto(this RoleDto item)
        {
            if (item == null) return null;

            return new Role
            {
                Id = item.Id,
                Name = item.Name
            };
        }
        public static IList<Role> FromDtos(this IEnumerable<RoleDto> items)
        {
            if (items == null) return null;
            return items.Select(c => c.FromDto()).ToList();
        }
        #endregion

        #region  Country BO
        public static CountryDto ToDto(this Country item)
        {
            if (item == null) return null;

            return new CountryDto
            {
                Id = item.Id,
                Name = item.Name,
                IsoCode = item.IsoCode
            };
        }
        public static IList<CountryDto> ToDtos(this IEnumerable<Country> items)
        {
            if (items == null) return null;
            return items.Select(c => c.ToDto()).ToList();
        }
       
        public static Country FromDto(this CountryDto item)
        {
            if (item == null) return null;

            return new Country
            {
                Id = item.Id,
                Name = item.Name,
                IsoCode = item.IsoCode
            };
        }
        public static IList<Country> FromDtos(this IEnumerable<CountryDto> items)
        {
            if (items == null) return null;
            return items.Select(c => c.FromDto()).ToList();
        }
        #endregion

        #region DomainDataBase BO
        public static DomainDataBaseDto ToDto(this DomainDataBase item)
        {
            if (item == null) return null;
            return new DomainDataBaseDto
            {
                Id = item.Id,
                ScreenName = item.ScreenName
            };
        }
        public static IList<DomainDataBaseDto> ToDtos(this IEnumerable<DomainDataBase> items)
        {
            if (items == null) return null;
            return items.Select(c => c.ToDto()).ToList();
        }
        #endregion

        #region  User BO
        public static UserDto ToDto(this User item)
        {
            if (item == null) return null;
            UserDto dto = new UserDto();
            dto.Id = item.Id;
            dto.UserName = item.UserName;
            dto.FirstName = item.UserProfile.FirstName;
            dto.LastName = item.UserProfile.LastName;
            dto.Email = item.Email;
            dto.DataBaseId = item.DataBaseId;
            dto.DataBase = item.DataBase != null ? item.DataBase.ScreenName : string.Empty;
            dto.Type = item.Type;
            dto.RawPassword = item.RawPassword;
            dto.CreateDate = item.UserProfile.CreateDate;
            dto.ClientIds = dto.ClientIds?? new List<string>();
            dto.ClientIds = item.UserCompanies.Where(t=>t.Company!=null).Where(t => t.Company.Type == CompanyType.Client && t.IsActive).Select(t => t.CompanyId).ToList();
            if (string.IsNullOrEmpty(dto.TenantId))
            {
                
                var tenat = item.UserCompanies.FirstOrDefault(t => t.Company.Type == CompanyType.Tenant);
                if (tenat != null)
                {
                    dto.TenantId = tenat.CompanyId;
                    dto.TenantName = tenat.Company.Name;
                }
                else {
                    var tenatC = item.DataBase.Companies.Where(t => t.Type == CompanyType.Tenant).FirstOrDefault();
                    if (tenatC != null)
                    {
                        dto.TenantId = tenatC.Id;
                        dto.TenantName = tenatC.Name;
                    }
                }
            };
            return dto;
        }
        public static IList<UserDto> ToDtos(this IEnumerable<User> items)
        {
            if (items == null) return null;
            return items.Select(c => c.ToDto()).ToList();
        }


        public static UserDto ToDto(this User item, bool withProfile = false, bool withAddress = false, bool withUserCompanies = false)
        {
            if (item == null) return null;
            UserDto dto = new UserDto();
            dto.Id = item.Id;
            dto.UserName = item.UserName;
            dto.Email = item.Email;
            dto.DataBaseId = item.DataBaseId;
            dto.Type = item.Type;
            dto.LastUsedCompanyId = item.LastUsedCompanyId;
            dto.FirstName = item.UserProfile.FirstName;
            dto.LastName = item.UserProfile.LastName;
            dto.DataBase = item.DataBase.ScreenName;
            if (withProfile)
                dto.UserProfile = item.UserProfile.ToDto(withAddress);
            if (withUserCompanies)
                dto.UserCompanies = item.UserCompanies.ToDtos();
            
            return dto;
        }
    
        public static IList<UserDto> ToDtos(this IEnumerable<User> items, bool withProfile = false, bool withAddress = false, bool withUserCompanies = false)
        {
            if (items == null) return null;
            return items.Select(c => ToDto(c, withProfile, withAddress, withUserCompanies)).ToList();
        }

        public static void FromDto(this User item, UserDto dto, bool withProfile = false, bool withAddress = false, bool withUserCompanies = false)
        {
            item.Id = dto.Id;
            item.UserName = dto.UserName;
            item.Email = dto.Email;
            item.EmailConfirmed = string.IsNullOrEmpty(dto.Email) ? false : true;
            item.Type = dto.Type;
            item.LastUsedCompanyId = dto.LastUsedCompanyId;
            if (withProfile)
            {
                item.UserProfile = item.UserProfile ?? new UserProfile();
                item.UserProfile.FromDto(dto.UserProfile, withAddress);
            }
            if (withUserCompanies)
                item.UserCompanies = dto.UserCompanies.FromDtos(true, true);
        }

        public static User FromDto(this UserDto dto, bool withProfile = false, bool withAddress = false, bool withUserCompanies = false)
        {
            if (dto == null) return null;
            User item = new User();
            item.Id = dto.Id;
            item.UserName = dto.UserName;
            item.Email = dto.Email;
            item.Type = dto.Type;
            item.LastUsedCompanyId = dto.LastUsedCompanyId;
            if (withProfile)
            {
                item.UserProfile = item.UserProfile ?? new UserProfile();
                item.UserProfile = dto.UserProfile.FromDto(withAddress);
            }
            if (withUserCompanies)
            {
                item.UserCompanies = item.UserCompanies ?? new  List<UserCompany>();
                item.UserCompanies = dto.UserCompanies.FromDtos(false, false);
            }
            return item;
        }
        public static IList<User> FromDtos(this IEnumerable<UserDto> dtos, bool withProfile = false, bool withAddress = false, bool withUserCompanies = false)
        {
            if (dtos == null) return null;
            return dtos.Select(c => c.FromDto(withProfile, withAddress, withUserCompanies: withUserCompanies)).ToList();
        }
        #endregion

        #region  ERP_Company BO

        public static CompanyDto ToDto(this Company item, bool withUserCompanies = false)
        {
            if (item == null) return null;
            CompanyDto dto = new CompanyDto();
            dto.Id = item.Id;
            dto.Name = item.Name;
            return dto;
        }
        public static IList<CompanyDto> ToDtos(this IEnumerable<Company> items, bool withUserCompanies = false)
        {
            if (items == null) return null;
            return items.Select(c => ToDto(c, withUserCompanies)).ToList();
        }

        public static void FromDto(this Company item, CompanyDto dto, bool withUserCompanies = false)
        {
            item.Id = dto.Id;
            item.Name = dto.Name;
            if (withUserCompanies)
            {
                foreach (var element in item.UserCompanies.ToArray())
                {
                    var userCompany = dto.UserCompanies.FirstOrDefault(x => x.CompanyId == element.CompanyId && x.UserId == element.UserId);
                    if (userCompany != null)
                    {
                        element.FromDto(userCompany);
                        element.IsActive = true;
                        element.InactiveDate = null;
                    }
                    else
                    {
                        element.IsActive = false;
                        element.InactiveDate = DateTime.Now;
                    }
                }

                //Add new
                foreach (var element in dto.UserCompanies.Where(x => !item.UserCompanies.Any(t => t.CompanyId == x.CompanyId && t.UserId == x.UserId)).ToList())
                {
                    element.IsActive = true;
                    element.InactiveDate = null;
                    item.UserCompanies.Add(element.FromDto(false, false));
                }
            }
        }

        public static Company FromDto(this CompanyDto dto, bool withUserCompanies = false)
        {
            if (dto == null) return null;
            Company item = new Company();
            item.Id = dto.Id;
            item.Name = dto.Name;
            if (withUserCompanies)
            {
                item.UserCompanies = dto.UserCompanies.FromDtos(true, true);
            }
            return item;
        }
        public static IList<Company> FromDtos(this IEnumerable<CompanyDto> dtos, bool withUserCompanies = false)
        {
            if (dtos == null) return null;
            return dtos.Select(c => c.FromDto(withUserCompanies)).ToList();
        }
        #endregion

        #region  UserCompany BO

        public static UserCompanyDto ToDto(this UserCompany item, bool withCompany = false, bool withUser = false)
        {
            if (item == null) return null;
            UserCompanyDto dto = new UserCompanyDto();
            dto.CompanyId = item.CompanyId;
            dto.UserId = item.UserId;

            if (withCompany)
                dto.Company = item.Company.ToDto();
            if (withUser)
                dto.User = item.User.ToDto();
            return dto;
        }

        public static IList<UserCompanyDto> ToDtos(this IEnumerable<UserCompany> items, bool withCompany = false, bool withUser = false)
        {
            if (items == null) return null;
            return items.Select(c => ToDto(c, withCompany: withCompany, withUser: withUser)).ToList();
        }

        public static void FromDto(this UserCompany item, UserCompanyDto dto, bool withCompany = false, bool withUser = false)
        {
            item.CompanyId = dto.CompanyId;
            item.UserId = dto.UserId;

            if (withCompany)
            {
                item.Company.FromDto(dto.Company);
            }
            if (withUser)
            {
                item.User.FromDto(dto.User);
            }
        }

        public static UserCompany FromDto(this UserCompanyDto dto, bool withCompany = false, bool withUser = false)
        {
            if (dto == null) return null;
            UserCompany item = new UserCompany();
            item.CompanyId = dto.CompanyId;
            item.UserId = dto.UserId;

            if (withCompany)
            {
                item.Company.FromDto(dto.Company);
            }
            if (withUser)
            {
                item.User.FromDto(dto.User);
            }
            return item;
        }

        public static IList<UserCompany> FromDtos(this IEnumerable<UserCompanyDto> dtos, bool withCompany = false, bool withUser = false)
        {
            if (dtos == null) return null;
            return dtos.Select(c => c.FromDto(withCompany: withCompany, withUser: withUser)).ToList();
        }

        #endregion

        #region  UserProfile BO
        public static UserProfileDto ToDto(this UserProfile item, bool withAddress = false)
        {
            if (item == null) return null;
            UserProfileDto dto = new UserProfileDto();
            dto.Id = item.Id;
            dto.UserId = item.UserId;
            dto.AddressId = item.AddressId;
            dto.GlobalizationId = item.GlobalizationId;
            dto.Title = item.Title;
            dto.FirstName = item.FirstName;
            dto.LastName = item.LastName;
            dto.AddressId = item.AddressId;
            dto.CreateDate = item.CreateDate;

            if (withAddress)
                dto.Address = item.Address.ToDto();
            return dto;
        }
        public static IList<UserProfileDto> ToDtos(this IEnumerable<UserProfile> items, bool withAddress = false)
        {
            if (items == null) return null;
            return items.Select(c => c.ToDto(withAddress)).ToList();
        }

        public static void FromDto(this UserProfile item, UserProfileDto dto, bool withAddress = false)
        {
            item.UserId = dto.UserId;
            item.AddressId = dto.AddressId;
            item.GlobalizationId = dto.GlobalizationId;
            item.Title = dto.Title;
            item.FirstName = dto.FirstName;
            item.LastName = dto.LastName;
            
            if (withAddress)
            {
                item.Address = item.Address ?? new Address();
                item.Address.FromDto(dto.Address);
            }
        }

        public static UserProfile FromDto(this UserProfileDto dto, bool withAddress = false)
        {
            if (dto == null) return null;
            UserProfile item = new UserProfile();
            item.Id = dto.Id;
            item.UserId = dto.UserId;
            item.AddressId = dto.AddressId;
            item.GlobalizationId = dto.GlobalizationId;
            item.Title = dto.Title;
            item.FirstName = dto.FirstName;
            item.LastName = dto.LastName;
            
            if (withAddress)
            {
                item.Address = item.Address ?? new Address();
                item.Address.FromDto(dto.Address);
            }
            return item;
        }
        public static IList<UserProfile> FromDtos(this IEnumerable<UserProfileDto> dtos, bool withAddress = false)
        {
            if (dtos == null) return null;
            return dtos.Select(c => c.FromDto(withAddress)).ToList();
        }
        #endregion

        #region UserSession BO
        public static UserSessionDto ToDto(this UserSession item)
        {
            if (item == null) return null;
            return new UserSessionDto
            {
                Id = item.Id,
                UserId = item.UserId,
                UserName = item.User.UserName,
                DatabaseId = item.User.DataBaseId,
                TenantDatabase =item.User.DataBaseId.HasValue? item.User.DataBase.ScreenName:string.Empty,
                SessionId = item.SessionId,
                ClientIp = item.ClientIp,
                ClientAgent = item.ClientAgent,
                LoggedIn     = item.LoggedIn,
                LoggedInDate = item.LoggedInDate,
                LoggedOutDate = item.LoggedOutDate
            };
        }
        public static IList<UserSessionDto> ToDtos(this IEnumerable<UserSession> items)
        {
            if (items == null) return null;
            return items.Select(c => c.ToDto()).ToList();

        }
        #endregion
    }
}