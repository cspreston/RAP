using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace CTR.RAP.Migrations.Extensions
{
    public static class StringExtensions
    {
        public static string KebabCase(this string value)
        {
            if (string.IsNullOrEmpty(value))
                return value;

            string[] prohibited = { " ", "!", "-", "_", "@", "#", "$", "%", "^", "&", "*", "(", ")", "[", "]", "{", "}", "'", ",", "|", "<", ">", "?", ":", ";" };
            string sanitized = value;

            foreach (var character in prohibited)
            {
                sanitized = sanitized.Replace(character, "");
            }

            return Regex.Replace(sanitized, "(?<!^)([A-Z][a-z]|(?<=[a-z])[A-Z])", "-$1", RegexOptions.Compiled)
                .Trim()
                .ToLower();
        }
    }
}
