namespace Repository.Sql
{
    using Microsoft.AspNet.Identity;
    using Microsoft.AspNet.Identity.EntityFramework;
    using System;
    using System.Collections.Generic;
    using System.Data.Entity.Migrations;
    using System.Linq;
    using BusinessObjects;
    using Tools;

    internal sealed class BaseContextConfiguration : DbMigrationsConfiguration<BaseContext>
    {
        public BaseContextConfiguration()
        {

            AutomaticMigrationsEnabled = true;
            AutomaticMigrationDataLossAllowed = true;

            //AutomaticMigrationsEnabled = true;
            //AutomaticMigrationDataLossAllowed = false;


        }

        protected override void Seed(BaseContext context)
        {
            CreateGlobalizations(context);
            CreateDatabase(context);
            CreateRootUser(context);
            CreateCountries(context);
            CreateSubscriptions(context);
            CreateDemoTenant(context);
            base.Seed(context);
        }

        private void CreateDatabase(BaseContext context)
        {
            System.Collections.Generic.List<BusinessObjects.DomainDataBase> DomainDataBases = new System.Collections.Generic.List<BusinessObjects.DomainDataBase>()
            { 
                new BusinessObjects.DomainDataBase
                    { 
                        ConnectionString = Tools.Encryption.Crypto.ActionEncrypt(string.Format(Tools.Helper.GetConnectionString(Tools.DefaultValues.CONNECTION_TENANT),"RAP#Dummy")),
                        ScreenName = "#Dummy"
                    }
            };
            context.DomainDataBases.AddOrUpdate(c => new { c.ConnectionString }, DomainDataBases.ToArray());
        }

        private void CreateRootUser(BaseContext context)
        {
            if (!context.Users.Any(x => x.UserName == DefaultValues.DEFAULT_USERINFO))
            {
                List<IdentityRole> roles = new List<IdentityRole>() { };
                IdentityRole role = context.Roles.Create();
                role.Name = DefaultValues.ROLE_ROOT;
                role.Id = Guid.NewGuid().ToString();
                roles.Add(role);

                var userManager = new UserManager<User>(new UserStore<User>(context));
                var roleManager = new RoleManager<IdentityRole>(new RoleStore<IdentityRole>(context));
                string password = DefaultValues.DEFAULT_USERPASS;
                roleManager.Create(role);
                User user = context.Users.Create();
                user.Id = Guid.NewGuid().ToString();
                user.UserName = DefaultValues.DEFAULT_USERINFO;
                user.Email = DefaultValues.DEFAULT_USERINFO;
                user.Type = UserType.Root;
                user.DataBase = context.DomainDataBases.FirstOrDefault();
                var culture = context.Globalizations.FirstOrDefault();
                user.UserProfile = new UserProfile()
                {
                    Title = UserTitle.Mr,
                    FirstName = DefaultValues.DEFAULT_USERINFO,
                    GlobalizationId = culture.Id,
                };
                if (!roleManager.RoleExists(role.Name))
                {
                    var roleresult = roleManager.Create(role);
                }
                var adminresult = userManager.Create(user, password);
                if (adminresult.Succeeded)
                {
                    var result = userManager.AddToRole(user.Id, role.Name);
                }
                //create root actor for dummy test
                using (var serviceManager = new Common.Service(user.DataBase.Id, user.Id))
                {
                    var actorService = serviceManager.GetService<Common.Domain.IActorService>();
                    if (!actorService.GetAll().Any(x => x.Id == user.Id))
                    {
                        Actor actor = new Actor()
                        {
                            Id = user.Id,
                            Type = ActorType.Tenant,
                            Name = user.UserName
                        };
                        actorService.Add(actor);
                        serviceManager.Commit();
                    }
                }
            }
        }

        private void CreateCountries(BaseContext context)
        {
            List<Country> Countries = new List<Country>()
            {
                #region  Add Country Object
                new Country{Name="Afghanistan",IsoCode="AF"},
                new Country{Name="Albania",IsoCode="AL"},
                new Country{Name="Algeria",IsoCode="DZ"},
                new Country{Name="Andorra",IsoCode="AD"},
                new Country{Name="Angola",IsoCode="AO"},
                new Country{Name="Antigua & Deps",IsoCode="AG"},
                new Country{Name="Argentina",IsoCode="AR"},
                new Country{Name="Armenia",IsoCode="AM"},
                new Country{Name="Australia",IsoCode="AU"},
                new Country{Name="Austria",IsoCode="AT"},
                new Country{Name="Azerbaijan",IsoCode="AZ"},
                new Country{Name="Bahamas",IsoCode="BS"},
                new Country{Name="Bahrain",IsoCode="BH"},
                new Country{Name="Bangladesh",IsoCode="BD"},
                new Country{Name="Barbados",IsoCode="BB"},
                new Country{Name="Belarus",IsoCode="BY"},
                new Country{Name="Belgium",IsoCode="BE"},
                new Country{Name="Belize",IsoCode="BZ"},
                new Country{Name="Benin",IsoCode="BJ"},
                new Country{Name="Bhutan",IsoCode="BT"},
                new Country{Name="Bolivia",IsoCode="BO"},
                new Country{Name="Bosnia Herzegovina",IsoCode="BA"},
                new Country{Name="Botswana",IsoCode="BW"},
                new Country{Name="Brazil",IsoCode="BR"},
                new Country{Name="Brunei",IsoCode="BN"},
                new Country{Name="Bulgaria",IsoCode="BG"},
                new Country{Name="Burkina",IsoCode="BF"},
                new Country{Name="Burundi",IsoCode="BI"},
                new Country{Name="Cambodia",IsoCode="KH"},
                new Country{Name="Cameroon",IsoCode="CM"},
                new Country{Name="Canada",IsoCode="CA"},
                new Country{Name="Cape Verde",IsoCode="CV"},
                new Country{Name="Central African Rep",IsoCode="CF"},
                new Country{Name="Chad",IsoCode="TD"},
                new Country{Name="Chile",IsoCode="CL"},
                new Country{Name="China",IsoCode="CN"},
                new Country{Name="Colombia",IsoCode="CO"},
                new Country{Name="Comoros",IsoCode="KM"},
                new Country{Name="Congo",IsoCode="CG"},
                new Country{Name="Congo, the Democratic Republic of the",IsoCode="CD"},
                new Country{Name="Costa Rica",IsoCode="CR"},
                new Country{Name="Croatia",IsoCode="HR"},
                new Country{Name="Cuba",IsoCode="CU"},
                new Country{Name="Cyprus",IsoCode="CY"},
                new Country{Name="Czech Republic",IsoCode="CZ"},
                new Country{Name="Denmark",IsoCode="DK"},
                new Country{Name="Djibouti",IsoCode="DJ"},
                new Country{Name="Dominica",IsoCode="DM"},
                new Country{Name="Dominican Republic",IsoCode="DO"},
                new Country{Name="East Timor",IsoCode="TL"},
                new Country{Name="Ecuador",IsoCode="EC"},
                new Country{Name="Egypt",IsoCode="EG"},
                new Country{Name="El Salvador",IsoCode="SV"},
                new Country{Name="Equatorial Guinea",IsoCode="GQ"},
                new Country{Name="Eritrea",IsoCode="ER"},
                new Country{Name="Estonia",IsoCode="EE"},
                new Country{Name="Ethiopia",IsoCode="ET"},
                new Country{Name="Fiji",IsoCode="FJ"},
                new Country{Name="Finland",IsoCode="FI"},
                new Country{Name="France",IsoCode="FR"},
                new Country{Name="Gabon",IsoCode="GA"},
                new Country{Name="Gambia",IsoCode="GM"},
                new Country{Name="Georgia",IsoCode="GE"},
                new Country{Name="Germany",IsoCode="DE"},
                new Country{Name="Ghana",IsoCode="GH"},
                new Country{Name="Greece",IsoCode="GR"},
                new Country{Name="Grenada",IsoCode="GD"},
                new Country{Name="Guatemala",IsoCode="GT"},
                new Country{Name="Guinea",IsoCode="GN"},
                new Country{Name="Guinea-Bissau",IsoCode="GW"},
                new Country{Name="Guyana",IsoCode="GY"},
                new Country{Name="Haiti",IsoCode="HT"},
                new Country{Name="Honduras",IsoCode="HN"},
                new Country{Name="Hungary",IsoCode="HU"},
                new Country{Name="Iceland",IsoCode="IS"},
                new Country{Name="India",IsoCode="IN"},
                new Country{Name="Indonesia",IsoCode="ID"},
                new Country{Name="Iran",IsoCode="IR"},
                new Country{Name="Iraq",IsoCode="IQ"},
                new Country{Name="Ireland ",IsoCode="IE"},
                new Country{Name="Israel",IsoCode="IL"},
                new Country{Name="Italy",IsoCode="IT"},
                new Country{Name="Ivory Coast",IsoCode="CI"},
                new Country{Name="Jamaica",IsoCode="JM"},
                new Country{Name="Japan",IsoCode="JP"},
                new Country{Name="Jordan",IsoCode="JO"},
                new Country{Name="Kazakhstan",IsoCode="KZ"},
                new Country{Name="Kenya",IsoCode="KE"},
                new Country{Name="Kiribati",IsoCode="KI"},
                new Country{Name="Korea North",IsoCode="KP"},
                new Country{Name="Korea South",IsoCode="KR"},
                new Country{Name="Kuwait",IsoCode="KW"},
                new Country{Name="Kyrgyzstan",IsoCode="KG"},
                new Country{Name="Laos",IsoCode="LA"},
                new Country{Name="Latvia",IsoCode="LV"},
                new Country{Name="Lebanon",IsoCode="LB"},
                new Country{Name="Lesotho",IsoCode="LS"},
                new Country{Name="Liberia",IsoCode="LR"},
                new Country{Name="Libya",IsoCode="LY"},
                new Country{Name="Liechtenstein",IsoCode="LI"},
                new Country{Name="Lithuania",IsoCode="LT"},
                new Country{Name="Luxembourg",IsoCode="LU"},
                new Country{Name="Macedonia",IsoCode="MK"},
                new Country{Name="Madagascar",IsoCode="MG"},
                new Country{Name="Malawi",IsoCode="MW"},
                new Country{Name="Malaysia",IsoCode="MY"},
                new Country{Name="Maldives",IsoCode="MV"},
                new Country{Name="Mali",IsoCode="ML"},
                new Country{Name="Malta",IsoCode="MT"},
                new Country{Name="Marshall Islands",IsoCode="MH"},
                new Country{Name="Mauritania",IsoCode="MR"},
                new Country{Name="Mauritius",IsoCode="MU"},
                new Country{Name="Mexico",IsoCode="MX"},
                new Country{Name="Micronesia",IsoCode="FM"},
                new Country{Name="Moldova",IsoCode="MD"},
                new Country{Name="Monaco",IsoCode="MC"},
                new Country{Name="Mongolia",IsoCode="MN"},
                new Country{Name="Montenegro",IsoCode="ME"},
                new Country{Name="Morocco",IsoCode="MA"},
                new Country{Name="Mozambique",IsoCode="MZ"},
                new Country{Name="Myanmar, ",IsoCode="MM"},
                new Country{Name="Namibia",IsoCode="NA"},
                new Country{Name="Nauru",IsoCode="NR"},
                new Country{Name="Nepal",IsoCode="NP"},
                new Country{Name="Netherlands",IsoCode="NL"},
                new Country{Name="New Zealand",IsoCode="NZ"},
                new Country{Name="Nicaragua",IsoCode="NI"},
                new Country{Name="Niger",IsoCode="NE"},
                new Country{Name="Nigeria",IsoCode="NG"},
                new Country{Name="Norway",IsoCode="NO"},
                new Country{Name="Oman",IsoCode="OM"},
                new Country{Name="Pakistan",IsoCode="PK"},
                new Country{Name="Palau",IsoCode="PW"},
                new Country{Name="Panama",IsoCode="PA"},
                new Country{Name="Papua New Guinea",IsoCode="PG"},
                new Country{Name="Paraguay",IsoCode="PY"},
                new Country{Name="Peru",IsoCode="PE"},
                new Country{Name="Philippines",IsoCode="PH"},
                new Country{Name="Poland",IsoCode="PL"},
                new Country{Name="Portugal",IsoCode="PT"},
                new Country{Name="Qatar",IsoCode="QA"},
                new Country{Name="Romania",IsoCode="RO"},
                new Country{Name="Russian Federation",IsoCode="RU"},
                new Country{Name="Rwanda",IsoCode="RW"},
                new Country{Name="St Kitts & Nevis",IsoCode="KN"},
                new Country{Name="St Lucia",IsoCode="LC"},
                new Country{Name="Saint Vincent & the Grenadines",IsoCode="VC"},
                new Country{Name="Samoa",IsoCode="WS"},
                new Country{Name="San Marino",IsoCode="SM"},
                new Country{Name="Sao Tome & Principe",IsoCode="ST"},
                new Country{Name="Saudi Arabia",IsoCode="SA"},
                new Country{Name="Senegal",IsoCode="SN"},
                new Country{Name="Serbia",IsoCode="RS"},
                new Country{Name="Seychelles",IsoCode="SC"},
                new Country{Name="Sierra Leone",IsoCode="SL"},
                new Country{Name="Singapore",IsoCode="SG"},
                new Country{Name="Slovakia",IsoCode="SK"},
                new Country{Name="Slovenia",IsoCode="SI"},
                new Country{Name="Solomon Islands",IsoCode="SB"},
                new Country{Name="Somalia",IsoCode="SO"},
                new Country{Name="South Africa",IsoCode="ZA"},
                new Country{Name="Spain",IsoCode="ES"},
                new Country{Name="Sri Lanka",IsoCode="LK"},
                new Country{Name="Sudan",IsoCode="SD"},
                new Country{Name="Suriname",IsoCode="SR"},
                new Country{Name="Swaziland",IsoCode="SZ"},
                new Country{Name="Sweden",IsoCode="SE"},
                new Country{Name="Switzerland",IsoCode="CH"},
                new Country{Name="Syria",IsoCode="SY"},
                new Country{Name="Tajikistan",IsoCode="TJ"},
                new Country{Name="Tanzania",IsoCode="TZ"},
                new Country{Name="United Republic of Thailand",IsoCode="TH"},
                new Country{Name="Togo",IsoCode="TG"},
                new Country{Name="Tonga",IsoCode="TO"},
                new Country{Name="Trinidad & Tobago",IsoCode="TT"},
                new Country{Name="Tunisia",IsoCode="TN"},
                new Country{Name="Turkey",IsoCode="TR"},
                new Country{Name="Turkmenistan",IsoCode="TM"},
                new Country{Name="Tuvalu",IsoCode="TV"},
                new Country{Name="Uganda",IsoCode="UG"},
                new Country{Name="Ukraine",IsoCode="UA"},
                new Country{Name="United Arab Emirates",IsoCode="AE"},
                new Country{Name="United Kingdom",IsoCode="GB"},
                new Country{Name="United States",IsoCode="US"},
                new Country{Name="Uruguay",IsoCode="UY"},
                new Country{Name="Uzbekistan",IsoCode="UZ"},
                new Country{Name="Vanuatu",IsoCode="VU"},
                new Country{Name="Vatican City",IsoCode="VA"},
                new Country{Name="Venezuela",IsoCode="VE"},
                new Country{Name="Vietnam",IsoCode="VN"},
                new Country{Name="Yemen",IsoCode="YE"},
                new Country{Name="Zambia",IsoCode="ZM"},
                new Country{Name="Zimbabwe",IsoCode="ZW"},
                #endregion
            };
            context.Countries.AddOrUpdate(c => new { c.Name }, Countries.ToArray());
        }

        private void CreateGlobalizations(BaseContext context)
        {
            List<Globalization> Globalizations = new List<Globalization>()
            {
                new Globalization { Name="English", Locale="en-US", IsActive=true },
                new Globalization { Name="Dutch", Locale="nl-NL", IsActive=true },
            };
            context.Globalizations.AddOrUpdate(c => new { c.Name }, Globalizations.ToArray());
        }

        private void CreateSubscriptions(BaseContext context)
        {
            List<Subscription> Subscriptions = new List<Subscription>()
            {
                new Subscription { Feature=TariffFeature.Company, CurrencyCode="EUR", Value= decimal.Parse("3.99") },
                new Subscription { Feature=TariffFeature.Bank, CurrencyCode="EUR", Value= decimal.Parse("1.50") },
            };
            context.Subscriptions.AddOrUpdate(c => new { c.Feature, c.Value, c.CurrencyCode }, Subscriptions.ToArray());
        }

        private void CreateDemoTenant(BaseContext context)
        {
            var dbId = context.DomainDataBases.FirstOrDefault(x => x.ScreenName == "#Dummy").Id;
            var tenant = new Company();
            tenant.Id = Guid.NewGuid().ToString();
            tenant.Name = "Dummy company";
            tenant.IsActive = true;
            tenant.DataBaseId = dbId;
            tenant.Type = CompanyType.Tenant;

            var tenantClient = new Company();
            tenantClient.Id = Guid.NewGuid().ToString();
            tenantClient.Name = "Dummy client";
            tenantClient.IsActive = true;
            tenantClient.DataBaseId = dbId;
            tenantClient.Type = CompanyType.Client;
            List<Company> items = new List<Company>();
            items.Add(tenant);
            items.Add(tenantClient);
            context.Companies.AddOrUpdate(c => new { c.Name }, items.ToArray());
            context.Commit();

            using (var serviceManager = new Common.Service(dbId, string.Empty))
            {
                var actorService = serviceManager.GetService<Common.Domain.IActorService>();
                var actorClient = new Actor();
                actorClient.Id = tenantClient.Id;
                actorClient.Type = ActorType.Company;
                actorClient.Name = tenantClient.Name;
                actorClient.IsActive = true;

                var actors = new List<Actor>();
                actors.Add(actorClient);
                actorService.AddOrUpdate(c => new { c.Id }, actors);
                serviceManager.Commit();
            }

        }
    }
}