using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Threading;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.ModelBinding;

namespace Web.Client.Net.Code
{
    public class DecimalValidatorModelBinder : System.Web.Http.ModelBinding.IModelBinder
    {
        public bool BindModel(HttpActionContext actionContext, ModelBindingContext bindingContext)
        {
            var input = bindingContext.ValueProvider.GetValue(bindingContext.ModelName);

            if (input != null && !string.IsNullOrEmpty(input.AttemptedValue))
            {
                if (bindingContext.ModelType == typeof(decimal))
                {
                    decimal result;
                    if (!decimal.TryParse(input.AttemptedValue, NumberStyles.Number, Thread.CurrentThread.CurrentCulture, out result))
                    {
                        return false;
                    }
                }
            }

            return true; //base.BindModel(controllerContext, bindingContext);
        }
    }
}