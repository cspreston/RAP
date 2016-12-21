using Microsoft.AspNet.Identity;
using System;
using System.Globalization;
using System.Linq;
using System.Text;

namespace Tools
{
    public static class Extensions
    {
        public static string GetFullInfo(this Exception ex)
        {
            string errMsg = ex.Message + ex.StackTrace;
            if (ex.InnerException != null)
                errMsg += "\n" + GetFullInfo(ex.InnerException);

            return errMsg;
        }

        public static string ToStringNullable(this string str)
        {
            return string.IsNullOrEmpty(str) ? null : str;
        }

        public static string GetExtension(this string str)
        {
            if (string.IsNullOrEmpty(str))
                return str;
            if (!str.Contains('.'))
                return str;
            if (!str.Contains('?'))
                return str;
            return str.Substring(0, str.LastIndexOf('.')) + str.Substring(str.LastIndexOf('.'), (str.LastIndexOf('?') - str.LastIndexOf('.')));
        }

        /// <summary>
        /// Convert string value to decimal ignore the culture.
        /// </summary>
        /// <param name="value">The value.</param>
        /// <returns>Decimal value.</returns>
        public static decimal? ToDecimal(this string value)
        {
            decimal number;
            string tempValue = value;
            if (string.IsNullOrEmpty(value))
                return null;

            var punctuation = value.Where(x => char.IsPunctuation(x)).Distinct();
            int count = punctuation.Count();

            NumberFormatInfo format = CultureInfo.InvariantCulture.NumberFormat;
            switch (count)
            {
                case 0:
                    break;
                case 1:
                    var firstPunctuation = punctuation.ElementAt(0);
                    var firstPunctuationOccurence = value.Where(x => x == firstPunctuation).Count();
                    if (firstPunctuationOccurence == 1)

                        tempValue = value.Replace(punctuation.FirstOrDefault().ToString(), format.NumberDecimalSeparator);
                    else
                        tempValue = value.Replace(punctuation.FirstOrDefault().ToString(), format.NumberGroupSeparator);
                    break;
                case 2:
                    if (punctuation.ElementAt(0) == '.')
                        tempValue = value.SwapChar('.', ',');
                    break;
                default:
                    throw new InvalidCastException();
            }

            number = decimal.Parse(tempValue, format);
            return number;
        }
        /// <summary>
        /// Swaps the char.
        /// </summary>
        /// <param name="value">The value.</param>
        /// <param name="from">From.</param>
        /// <param name="to">To.</param>
        /// <returns></returns>

        public static string SwapChar(this string value, char from, char to)
        {
            if (value == null)
                throw new ArgumentNullException("value");

            StringBuilder builder = new StringBuilder();

            foreach (var item in value)
            {
                char c = item;
                if (c == from)
                    c = to;
                else if (c == to)
                    c = from;

                builder.Append(c);
            }
            return builder.ToString();
        }

        static public string LongToIP(this long longIP)
        {
            string ip = string.Empty;
            for (int i = 0; i < 4; i++)
            {
                int num = (int)(longIP / Math.Pow(256, (3 - i)));
                longIP = longIP - (long)(num * Math.Pow(256, (3 - i)));
                if (i == 0)
                    ip = num.ToString();
                else
                    ip = ip + "." + num.ToString();
            }
            return ip;
        }

        public static long IP2Long(this string ip)
        {
            string[] ipBytes;
            double num = 0;
            if (!string.IsNullOrEmpty(ip))
            {
                ipBytes = ip.Split('.');
                for (int i = ipBytes.Length - 1; i >= 0; i--)
                {
                    num += ((int.Parse(ipBytes[i]) % 256) * Math.Pow(256, (3 - i)));
                }
            }
            return (long)num;
        }

        public static string GetErrors(this IdentityResult result)
        {
            string message = string.Empty;
            foreach (var error in result.Errors)
                message += "Error: " + String.Join(", ", error) + Environment.NewLine;
            return message;
        }
    }
}