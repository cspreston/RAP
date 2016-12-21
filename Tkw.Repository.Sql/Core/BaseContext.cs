using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data.Common;
using System.Data.Entity;
using System.Data.Entity.Validation;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using BusinessObjects;
using Common;

namespace Repository.Sql
{
    public class BaseContext : IdentityDbContext<User>, IRepositoryContext
    {
        #region Variables
        private const string ProviderName = "System.Data.SqlClient";
        private static string ConnectionString = "";
        private string _userId;
        public string UserId
        {
            get
            {
                if (string.IsNullOrEmpty(_userId))
                {
                    using (var helper = new Tools.Helper())
                        _userId = helper.GetUserId();
                }
                return _userId;
            }
            set
            {
                _userId = value;
            }
        }
        #endregion

        #region properties
        public string Provider
        {
            get { return BaseContext.ProviderName; }
        }
        #endregion

        public BaseContext()
            : base(ConnectionString, throwIfV1Schema: false)
        {
        }

        public BaseContext(string dbConnectionString) :
            base(dbConnectionString)
        {
            ConnectionString = dbConnectionString;
            //Configure();
            //if (!Database.Exists() || !Database.CompatibleWithModel(true))
            //    Configure();
        }

        private void Configure()
        {
            Database.SetInitializer<BaseContext>(new MigrateDatabaseToLatestVersion<BaseContext, BaseContextConfiguration>());
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.Entity<IdentityRole>().ToTable("Roles");
            modelBuilder.Entity<IdentityUserRole>().ToTable("UserRoles");
            modelBuilder.Entity<IdentityUserLogin>().ToTable("UserLogins");
            modelBuilder.Entity<IdentityUserClaim>().ToTable("UserClaims");
            modelBuilder.Configurations.Add(new RoleConfiguration());
            modelBuilder.Configurations.Add(new UserConfiguration());
            modelBuilder.Configurations.Add(new DomainDataBaseConfiguration());
            modelBuilder.Configurations.Add(new UserProfileConfiguration());
            modelBuilder.Configurations.Add(new AddressConfiguration());
            modelBuilder.Configurations.Add(new CountryConfiguration());
            modelBuilder.Configurations.Add(new GlobalizationConfiguration());
            modelBuilder.Configurations.Add(new UserSessionConfiguration());
            modelBuilder.Configurations.Add(new SubscriptionConfiguration());
            modelBuilder.Configurations.Add(new UserSubscriptionConfiguration());
            modelBuilder.Configurations.Add(new CompanyConfiguration());
            modelBuilder.Configurations.Add(new UserCompanyConfiguration());
        }

        public void Commit()
        {
            foreach (var dbEntityEntry in this.ChangeTracker.Entries<BusinessObjects.BaseDate>()
                            .Where(a => a.State == EntityState.Added || a.State == EntityState.Modified || a.State == EntityState.Deleted))
                UpdateBaseDateValues(dbEntityEntry.Entity, dbEntityEntry.State);
            try
            {


                this.SaveChanges();
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public Task CommitAsync()
        {
            foreach (var dbEntityEntry in this.ChangeTracker.Entries<BusinessObjects.BaseDate>()
                            .Where(a => a.State == EntityState.Added || a.State == EntityState.Modified || a.State == EntityState.Deleted))
                UpdateBaseDateValues(dbEntityEntry.Entity, dbEntityEntry.State);
            return this.SaveChangesAsync();
        }

        public Task CommitAsync(CancellationToken cancellationToken)
        {
            foreach (var dbEntityEntry in this.ChangeTracker.Entries<BusinessObjects.BaseDate>()
                            .Where(a => a.State == EntityState.Added || a.State == EntityState.Modified || a.State == EntityState.Deleted))
                UpdateBaseDateValues(dbEntityEntry.Entity, dbEntityEntry.State);

            return this.SaveChangesAsync(cancellationToken);
        }

        public void Rollback()
        {
            this.Dispose();
        }

        private void UpdateBaseDateValues(BusinessObjects.BaseDate entity, EntityState state)
        {
            if (state == EntityState.Added && !entity.InactiveDate.HasValue)
            {
                entity.CreateDate = !entity.CreateDate.HasValue ? DateTime.Now.ToUniversalTime() : entity.CreateDate.Value.ToUniversalTime();
                entity.UpdateDate = !entity.UpdateDate.HasValue ? DateTime.Now.ToUniversalTime() : entity.UpdateDate.Value.ToUniversalTime();
                entity.CreatedBy = string.IsNullOrEmpty(entity.CreatedBy) ? UserId : entity.CreatedBy;
                entity.UpdatedBy = string.IsNullOrEmpty(entity.UpdatedBy) ? UserId : entity.UpdatedBy;
                entity.IsActive = true;
            }
            if (state == EntityState.Modified && !entity.InactiveDate.HasValue)
            {
                entity.UpdateDate = !entity.UpdateDate.HasValue ? DateTime.Now.ToUniversalTime() : entity.UpdateDate.Value;
                entity.UpdatedBy = string.IsNullOrEmpty(entity.UpdatedBy) ? UserId : entity.UpdatedBy;
                entity.IsActive = true;
            }
            if (state == EntityState.Deleted)
            {
                entity.InactiveDate = DateTime.Now.ToUniversalTime();
                entity.IsActive = false;
                entity.UpdatedBy = string.IsNullOrEmpty(entity.UpdatedBy) ? UserId : entity.UpdatedBy;
            }
        }

        #region Collections
        new public DbSet<Role> Roles { get; set; }
        public DbSet<DomainDataBase> DomainDataBases { get; set; }
        public DbSet<UserProfile> UserProfiles { get; set; }
        public DbSet<Country> Countries { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<Address> Addresses { get; set; }
        public DbSet<Globalization> Globalizations { get; set; }
        public DbSet<Subscription> Subscriptions { get; set; }
        public DbSet<UserSubscription> UserSubscriptions { get; set; }
        public DbSet<UserCompany> UserCompanies { get; set; }
        #endregion
    }
}