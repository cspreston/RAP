using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.ModelBinding;

namespace Web.Client.Net.Code
{
    public class DecimalBinder : IModelBinder
    {

        public bool BindModel(HttpActionContext actionContext, ModelBindingContext bindingContext)
        {
            ValidateBindingContext(bindingContext);

            var value = bindingContext.ValueProvider.GetValue(bindingContext.ModelName).AttemptedValue;

            decimal actualValue = 0;

            bindingContext.ModelState.SetModelValue(bindingContext.ModelName, bindingContext.ValueProvider.GetValue(bindingContext.ModelName));

            try
            {
                actualValue = decimal.Parse(value, CultureInfo.CurrentCulture);

                return true;
            }
            catch (FormatException e)
            {
                bindingContext.ModelState.AddModelError(bindingContext.ModelName, String.Format("\"{0}\" is invalid.", bindingContext.ModelName));
                return false;
            }

        }

        private static void ValidateBindingContext(ModelBindingContext bindingContext)
        {
            if (bindingContext == null)
            {
                throw new ArgumentNullException("bindingContext");
            }

            if (bindingContext.ModelMetadata == null)
            {
                throw new ArgumentException("ModelMetadata cannot be null", "bindingContext");
            }
        }

        public static bool CanBindType(Type modelType)
        {
            return modelType == typeof(decimal) || modelType == typeof(decimal?);
        }
    }
}