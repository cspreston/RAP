namespace Core
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using BusinessObjects;
    using Common;
    using Common.Core;
    using System.Data.Entity;
    using System.Threading.Tasks;
    using Microsoft.AspNet.Identity;
    using Microsoft.AspNet.Identity.EntityFramework;
    using Common.Domain;
    using Common.Independent;

    public partial class UserService : TkwService<User>, IUserService
    {
        public UserService(IRepository<User> repository, Service service)
            : base(repository, service)
        { }

        public override IQueryable<User> GetAll()
        {
            if (IsRoot())
                return base.GetAll();
            else
                return base.GetAll().Where(x => x.DataBaseId == _service.DatabaseId).Where(x=>x.Type!= UserType.Root);
        }
        public async Task<UserDto> CreateTenantAsync(TenantDto item, string password = null)
        {
            var _userManager = new UserManager();
            User user = await _userManager.FindByEmailAsync(item.Email);

            if (user != null)
                throw new InvalidOperationException("Email already registered");

            IdentityResult result;
            user = new User();
            user.UserProfile = new UserProfile() { IsActive = true };
            user.Email = item.Email;
            user.UserName = item.UserName;
            user.Type = UserType.Tenant;
            user.DataBase = new DomainDataBase()
            {
                ConnectionString = Tools.Encryption.Crypto.ActionEncrypt(string.Format(Tools.Helper.GetConnectionString(Tools.DefaultValues.CONNECTION_TENANT), "RAP#" + (item.Name))),
                ScreenName = "#" + item.Name
            };
            user.LastUsedCompany = new Company()
            {
                Id = Guid.NewGuid().ToString(),
                DataBase = user.DataBase,
                Name = item.Name,
                Phone = item.Phone,
                Address = item.Phone,
                Website = item.Website,
                Email = item.Email,
                City = item.City,
                State = item.State,
                Zip = item.Zip,
                IsActive = true,
                CreateDate = DateTime.Now,
                Type = CompanyType.Tenant
            };
            user.UserCompanies = new List<UserCompany>()
            {
              new UserCompany() { UserId= user.Id, CompanyId = user.LastUsedCompany.Id}
            };

            var userPass = password ?? GeneratePassword(6);
            user.RawPassword = userPass;

            result = await _userManager.UserValidator.ValidateAsync(user);
            if (!result.Succeeded)
                throw new InvalidOperationException(GetErrors(result));



            result = await _userManager.CreateAsync(user, userPass);
            if (!result.Succeeded)
                throw new InvalidOperationException(GetErrors(result));

            result = await _userManager.AddToRoleAsync(user.Id, Tools.DefaultValues.TENANT);

            if (!result.Succeeded)
                throw new InvalidOperationException(GetErrors(result));

            if (user.DataBaseId.HasValue)
            {
                using (var service = new Service(user.DataBaseId.Value, user.Id))
                {
                    Actor actor = new Actor()
                    {
                        Id = user.Id,
                        Type = ActorType.Tenant,
                        Name = item.Name,
                    };
                    service.GetService<IActorService>().Add(actor);
                    await service.CommitAsync();
                }
            }
            var response = user.ToDto();
            response.Password = userPass;
            return response;
        }

        public async Task<UserDto> CreateUserAsync(UserDto item, string password = null)
        {
            var _userManager = new UserManager();
            IdentityResult result;
            var user = new User();
            user.Id = Guid.NewGuid().ToString();
            user.UserProfile = new UserProfile() { IsActive = true, FirstName = item.FirstName, LastName = item.LastName, Title = UserTitle.Mr, CreateDate = DateTime.UtcNow };
            user.Email = item.Email;
            user.UserName = item.UserName;
            user.Type = UserType.BusinessUser;
            user.LastUsedCompanyId = item.TenantId;
            if (item.ClientIds!=null)
            {
                user.UserCompanies = new List<UserCompany>();
                user.UserCompanies.Add(new UserCompany() { UserId = user.Id, CompanyId = item.TenantId, IsActive = true });
                foreach (var s in item.ClientIds)
                    user.UserCompanies.Add(new UserCompany() { UserId = user.Id, CompanyId = s, IsActive = true });
            }

            if (IsRoot() && !string.IsNullOrEmpty(item.TenantId))
            {
                var tenant = await _service.GetService<ICompanyService>().GetAll().Include(x => x.DataBase).FirstOrDefaultAsync(x => x.Id == item.TenantId);
                if (tenant != null)
                    user.DataBaseId = tenant.DataBaseId;

            }
            if (user.DataBase == null)
            {
                user.DataBaseId = user.DataBaseId ?? _service.DatabaseId;
            }
            var userPass = password ?? GeneratePassword(6);
            user.RawPassword = userPass;

            result = await _userManager.UserValidator.ValidateAsync(user);
            if (!result.Succeeded)
                throw new InvalidOperationException(GetErrors(result));

            result = await _userManager.CreateAsync(user, userPass);
            if (!result.Succeeded)
                throw new InvalidOperationException(GetErrors(result));

            if (user.DataBaseId.HasValue)
            {
                using (var service = new Service(user.DataBaseId.Value, user.Id))
                {
                    Actor actor = new Actor()
                    {
                        Id = user.Id,
                        Type = ActorType.BusinessUser,
                        Name = user.UserName,
                    };
                    service.GetService<IActorService>().Add(actor);
                    await service.CommitAsync();
                }
            }
            item.Id = user.Id;
            return item;
        }

        #region private methods
        private string GetErrors(IdentityResult result)
        {
            string message = string.Empty;
            foreach (var error in result.Errors)
                message += "Error: " + String.Join(", ", error) + Environment.NewLine;
            return message;
        }

        private static string GeneratePassword(int length)
        {
            string NewPassword = "";
            string allowedChars = "";
            string allowedCharsNr = "1,2,3,4,5,6,7,8,9,0,";
            string allowedCharsCap = "A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,";
            string allowedCharsSm = "a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,";
            string allowedCharsSp = "!,.";

            char[] sep = { ',' };

            string[] arrTmp = allowedCharsNr.Split(sep);
            NewPassword += arrTmp[new Random().Next(0, arrTmp.Length)];

            arrTmp = allowedCharsCap.Split(sep);
            NewPassword += arrTmp[new Random().Next(0, arrTmp.Length)];

            arrTmp = allowedCharsSm.Split(sep);
            NewPassword += arrTmp[new Random().Next(0, arrTmp.Length)];

            arrTmp = allowedCharsSp.Split(sep);
            NewPassword += arrTmp[new Random().Next(0, arrTmp.Length)];
            length = length - NewPassword.Length;

            allowedChars = allowedCharsNr + allowedCharsCap + allowedCharsSm + allowedCharsSp;

            string[] arr = allowedChars.Split(sep);
            string temp = "";
            Random rand = new Random();

            for (int i = 0; i < length; i++)
            {
                temp = arr[rand.Next(0, arr.Length)];
                NewPassword += temp;
            }

            return NewPassword;
        }

       
        #endregion
    }
}