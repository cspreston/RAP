namespace Repository.Sql
{
    using System;
    using System.Data.Common;
    using System.Data.Entity;
    using System.Data.Entity.Validation;
    using System.Linq;
    using System.Threading;
    using System.Threading.Tasks;
    using Common;
    using BusinessObjects;

    public partial class TenantContext : DbContext, IRepositoryContext
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
            get { return TenantContext.ProviderName; }
        }
        #endregion

        public TenantContext()
            : base(ConnectionString)
        {
        }

        public TenantContext(string dbConnectionString) :
            base(dbConnectionString)
        {
            ConnectionString = dbConnectionString;
            if (!Database.Exists(dbConnectionString))
            {
                Database.Initialize(true);
            }
            Configure();
        }

        private void Configure()
        {
            Database.SetInitializer<TenantContext>(new MigrateDatabaseToLatestVersion<TenantContext, TenantContextConfiguration>());
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Configurations.Add(new ActorConfiguration());
            modelBuilder.Configurations.Add(new DomainAddressConfiguration());
            modelBuilder.Configurations.Add(new BuildingConfiguration());
            modelBuilder.Configurations.Add(new BuildingTypeConfiguration());
            modelBuilder.Configurations.Add(new FileBucketTypeConfiguration());
            modelBuilder.Configurations.Add(new BuildingPlanConfiguration());
            modelBuilder.Configurations.Add(new BuildingImageConfiguration());
            modelBuilder.Configurations.Add(new HotspotDisplayTypeConfiguration());
            modelBuilder.Configurations.Add(new HotspotActionTypeConfiguration());
            modelBuilder.Configurations.Add(new HotspotConfiguration());
            modelBuilder.Configurations.Add(new PricingInfoConfiguration());
            modelBuilder.Configurations.Add(new ContactInfoConfiguration());
            modelBuilder.Configurations.Add(new ActorBuildingConfiguration());
            modelBuilder.Configurations.Add(new BuildingDisasterInfoConfiguration());
            modelBuilder.Configurations.Add(new BuildingFileConfiguration());
            modelBuilder.Configurations.Add(new ClientConfiguration());
            modelBuilder.Configurations.Add(new ActorPermissionConfiguration());
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
                this.Entry(entity).State = EntityState.Modified;
                this.Entry(entity).Reload();
                entity.InactiveDate = DateTime.Now.ToUniversalTime();
                entity.IsActive = false;
                entity.UpdatedBy = string.IsNullOrEmpty(entity.UpdatedBy) ? UserId : entity.UpdatedBy;
            }
        }

        #region Collections
        public DbSet<DomainAddress> DomainAddresses { get; set; }
        public DbSet<Actor> Actors { get; set; }
        public DbSet<Building> Buildings { get; set; }
        public DbSet<ConstructionType> ConstructionTypes { get; set; }
        public DbSet<BuildingType> BuildingTypes { get; set; }
        public DbSet<FileBucketTypes> FileBucketTypes { get; set; }

        public DbSet<FileBuckets> FileBuckets { get; set; }
        public DbSet<Files> Files { get; set; }
        public DbSet<Hotspot> Hotspots { get; set; }
        public DbSet<HotspotActionType> HotspotActionTypes { get; set; }
        public DbSet<HotspotDisplayType> HotspotDisplayTypes { get; set; }
        public DbSet<BuildingImage> BuildingImages { get; set; }
        public DbSet<BuildingPlan> BuildingPlans { get; set; }
        public DbSet<BuildingFile> BuildingFiles { get; set; }
        public DbSet<BuildingDisasterInfo> BuildingDisasterInfos { get; set; }
        public DbSet<PricingInfo> PricingInfos { get; set; }
        public DbSet<ContactInfo> ContactsInfo { get; set; }
        public DbSet<Client> Clients { get; set; }
        public DbSet<ActorPermission> ActorPermissions { get; set; }
        #endregion
    }
}
