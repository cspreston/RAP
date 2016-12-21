using System;
using System.ComponentModel.DataAnnotations;
using System.Data.Entity.Validation;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.ExceptionHandling;

namespace Web.Client.Net
{
    public class GlobalExceptionHandler : ExceptionHandler
    {
        public override void Handle(ExceptionHandlerContext context)
        {
            string message = string.Empty;

            if (context.Exception is ValidationException)
            {
                message = context.Exception.Message;
                context.Result = new ErrorMessageResult(context.Request, new HttpResponseMessage(HttpStatusCode.InternalServerError) { ReasonPhrase = message });
            }
            else if (context.Exception is DbEntityValidationException)
            {
                var entityException = (DbEntityValidationException)context.Exception;
                foreach (var error in entityException.EntityValidationErrors)
                    message +=  String.Join(", ", error.ValidationErrors.Select(a => a.ErrorMessage));
                context.Result = new ErrorMessageResult(context.Request, new HttpResponseMessage(HttpStatusCode.InternalServerError) { ReasonPhrase = message });
            }
            else
            {
                message = context.Exception.Message;
                if (context.Exception.InnerException != null)
                {
                    message = message + "; " + context.Exception.InnerException.Message;
                    if (context.Exception.InnerException.InnerException != null)
                    {
                        message = message +  context.Exception.InnerException.InnerException.Message;
                    }
                }
                context.Result = new ErrorMessageResult(context.Request, new HttpResponseMessage(HttpStatusCode.InternalServerError) { ReasonPhrase = message});
            }
        }
    }

    public class ErrorMessageResult : IHttpActionResult
    {
        private HttpRequestMessage _request;
        private HttpResponseMessage _httpResponseMessage;

        public ErrorMessageResult(HttpRequestMessage request, HttpResponseMessage httpResponseMessage)
        {
            _request = request;
            _httpResponseMessage = httpResponseMessage;
        }

        public Task<HttpResponseMessage> ExecuteAsync(CancellationToken cancellationToken)
        {
            return Task.FromResult(_httpResponseMessage);
        }
    }
}