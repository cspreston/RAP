using System;
using System.Globalization;
using System.Threading;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.ModelBinding;

namespace Web.Client.Net.Code
{
    public class DecimalBinderProvider : ModelBinderProvider
    {
        readonly DecimalBinder binder = new DecimalBinder();

        public override IModelBinder GetBinder(HttpConfiguration configuration, Type modelType)
        {
            if (DecimalBinder.CanBindType(modelType))
            {
                return binder;
            }
            return null;
        }
    }
}