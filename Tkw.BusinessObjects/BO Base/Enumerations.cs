namespace BusinessObjects
{
    using System;

    #region Addresses Enum
    [Flags]
    public enum AddressFeatures
    {
        Delivery = 1,
        Billing = 2
    }
    #endregion

    #region Configuration Enum
    public enum EmailType
    {
        ConfirmRegister = 0,
        ForgotPassword = 1,
        EmailTwoFactor = 2,
        DefaultTemplate = 3,
        AlertTemplate = 4
    }
    public enum TariffFeature
    {
        Company = 1,
        Bank = 2
    }
    #endregion

    #region Actors Enum
    public enum UserTitle
    {
        Mr = 1,
        Mrs = 2
    }

    public enum UserType
    {
        Root = 1,
        Tenant = 2,
        BusinessUser = 3
    }

    public enum ActorType
    {
        Tenant = 1,
        Company = 2,
        BusinessUser = 3
    }

    public enum CompanyType
    {
        Tenant = 1,
        Client = 2
    }
    #endregion

    public enum HotspotType
    {
        Icon = 0,
        Point = 1,
        Line = 2,
        Circle = 3,
    }
    public enum PermissionResource
    {
        Files = 0,
    }

    [Flags]
    public enum PermissionFeature
    {
        Read = 1,
        Create = 2,
        Delete = 4,
        SetPermission = 8
    }
    [Flags]
    public enum BuildingDisplayConfiguration
    {
        Pricing = 1,
        Contact = 2,
        Files = 4,
        Disaster = 8,
        Folders = 16,
    }

    public enum BuildingFileType
    {
        Files = 0,
        PricingFile = 1,
        ContactFile = 2
    }
}