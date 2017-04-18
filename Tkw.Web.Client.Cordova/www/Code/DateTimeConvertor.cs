using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System;
using System.Security.Claims;
using System.Threading;
using System.Linq;

namespace Web.Client.Net.Code
{
    public class DateTimeConvertor : DateTimeConverterBase
    {
        private readonly TimeZoneInfo userTzi;

        public DateTimeConvertor()
        {
            userTzi = TimeZoneInfo.FindSystemTimeZoneById("GMT Standard Time");
            var principal = (ClaimsPrincipal)Thread.CurrentPrincipal;
            if (principal != null && principal.Identity != null && principal.Identity.IsAuthenticated)
                userTzi = TimeZoneInfo.FindSystemTimeZoneById(principal.Claims.Any(x => x.Type == "TimeZoneId") ? principal.Claims.FirstOrDefault(x => x.Type == "TimeZoneId").Value : "GMT Standard Time");
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            if (reader != null && reader.Value != "")
            {
                return DateTime.Parse(reader.Value.ToString());
            }
            else
                return null;
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            DateTime date;
            if(value is DateTimeOffset)
                date = ((DateTimeOffset)value).DateTime;
            else
                date = (DateTime)value;

            date = TimeZoneInfo.ConvertTimeFromUtc(date, userTzi);
            writer.WriteValue(((DateTime)date).ToString("dd/MM/yyyy HH:mm:ss"));
        }
    }
}