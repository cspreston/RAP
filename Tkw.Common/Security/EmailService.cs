namespace Common
{
    using Amazon;
    using Amazon.SimpleEmail;
    using Amazon.SimpleEmail.Model;
    using BusinessObjects;
    using Common.Independent;
    using Microsoft.AspNet.Identity;
    using System;
    using System.Collections.Generic;
    using System.Net;
    using System.Net.Mail;
    using System.Net.Mime;
    using System.Text.RegularExpressions;
    using System.Threading.Tasks;
    using System.Xml;

    public sealed class EmailService : IEmailService, IIdentityMessageService
    {
        private Email email;
        public Email Email
        {
            get
            {
                return email;
            }
            private set
            {
                if (email != value)
                {
                    email = value;
                }
            }
        }

        public EmailService()
        {
            email = new Email();
        }

        public const string SENDERUSERNAME = "senderUserName";
        public const string BCCRECIPIENTADDRESS = "bccRecipientAddress";
        public const string SUBJECT = "subject";
        public const string MESSAGE = "message";
        public const string DEFAULTRECIPIENTADDRESS = "defaultRecipientAddress";
        private const string XMLROOTPATH_D = "/settings/EmailTemplates/";

        private string GetTempletePath(EmailType type, string culture)
        {
            return XMLROOTPATH_D + (culture ?? "en-US") + "/" + type.ToString();
        }

        private void GetEmailTemplate(EmailType type, string culture)
        {
            XmlDocument doc = new XmlDocument();
            XmlTextReader reader = new XmlTextReader(System.AppDomain.CurrentDomain.BaseDirectory + Tools.DefaultValues.EMAILSETTINGSFILE);
            try
            {
                doc.Load(reader);
                this.email.SenderUserName = doc.SelectSingleNode(GetTempletePath(type, culture) + "/" + SENDERUSERNAME).InnerText;
                this.email.RecipientBCCAddress = doc.SelectSingleNode(GetTempletePath(type, culture) + "/" + BCCRECIPIENTADDRESS).InnerText;
                this.email.Subject = doc.SelectSingleNode(GetTempletePath(type, culture) + "/" + SUBJECT).InnerText;
                this.email.Message = doc.SelectSingleNode(GetTempletePath(type, culture) + "/" + MESSAGE).InnerText;
                this.email.DefaultRecipientAddress = doc.SelectSingleNode(GetTempletePath(type, culture) + "/"  + DEFAULTRECIPIENTADDRESS).InnerText;
            }
            catch (Exception)
            {
            }
            finally
            {
                reader.Close();
            }
        }

        private void GetEmailCredentials(EmailType type, string culture)
        {
            XmlDocument doc = new XmlDocument();
            XmlTextReader reader = new XmlTextReader(System.AppDomain.CurrentDomain.BaseDirectory + Tools.DefaultValues.EMAILSETTINGSFILE);
            try
            {
                doc.Load(reader);
                XmlNode exNode = doc.SelectSingleNode(GetTempletePath(type, culture) + "/" + "emailCredentials[@name=\"" + "Credentials" + "\"]");
                this.email.SMTPUsername = exNode.Attributes["SMTPUsername"].Value;
                this.email.SMTPPassword = exNode.Attributes["SMTPPassword"].Value;
                this.email.SMTPServer = exNode.Attributes["SMTPServer"].Value;
                this.email.SMTPPort = int.Parse(exNode.Attributes["SMTPPort"].Value);
                this.email.EnableSsl = Convert.ToBoolean(exNode.Attributes["EnableSsl"].Value);
                this.email.UseSMTPAuthentication = Convert.ToBoolean(exNode.Attributes["UseSMTPAuthentication"].Value);
                this.email.DefaultRecipientAddress = doc.SelectSingleNode(GetTempletePath(type, culture) + "/" + DEFAULTRECIPIENTADDRESS).InnerText;
            }
            catch (Exception)
            {
            }
            finally
            {
                reader.Close();
            }
        }

        public bool SendEmail(EmailType type, bool loadContentFromTemplate, string senderUserName, string recipientAddress, string recipientCCAddress, string recipientBCCAddress, string subject, string message,
                              Dictionary<string, string> attachments, out string error, string culture)
        {
            bool sent = false;
            error = string.Empty;
            System.Net.Mail.MailMessage MyMailMessage = null;
            GetEmailCredentials(type, culture);
            if (loadContentFromTemplate)
            {
                GetEmailTemplate(type, culture);
                senderUserName = this.email.SenderUserName;
                recipientBCCAddress = this.email.RecipientBCCAddress;
                subject = this.email.Subject;
                message = this.email.Message;
            }
            string from = String.Format("{0} <{1}>", "no-reply", senderUserName);
            if (string.IsNullOrEmpty(recipientAddress))
            {
                recipientAddress = this.email.DefaultRecipientAddress;
                from = senderUserName;
            }
            try
            {
                //TODO: ON PROD REPLACE SENDER WITH RECEIPENT
                MyMailMessage = new MailMessage();
                MyMailMessage.Subject = subject;
                MyMailMessage.Body = message;
                MyMailMessage.From = new MailAddress(from);

                if (!String.IsNullOrEmpty(recipientAddress))
                {
                    if (recipientAddress.ToString().Contains(";"))
                    {
                        char[] splitter = { ';' };
                        foreach (string mailTo in recipientAddress.ToString().Split(splitter))
                        {
                            MyMailMessage.To.Add(new MailAddress(mailTo));
                        }
                    }
                    else
                        MyMailMessage.CC.Add(new System.Net.Mail.MailAddress(recipientAddress.ToString()));
                }

                if (!String.IsNullOrEmpty(recipientCCAddress))
                {
                    if (recipientCCAddress.ToString().Contains(";"))
                    {
                        char[] splitter = { ';' };
                        foreach (string mailToCC in recipientCCAddress.ToString().Split(splitter))
                        {
                            MyMailMessage.CC.Add(new System.Net.Mail.MailAddress(mailToCC));
                        }
                    }
                    else
                        MyMailMessage.CC.Add(new System.Net.Mail.MailAddress(recipientCCAddress.ToString()));
                }

                if (!String.IsNullOrEmpty(recipientBCCAddress))
                {
                    if (recipientBCCAddress.ToString().Contains(";"))
                    {
                        char[] splitter = { ';' };
                        foreach (string mailToBCC in recipientBCCAddress.ToString().Split(splitter))
                        {
                            MyMailMessage.Bcc.Add(new System.Net.Mail.MailAddress(mailToBCC));
                        }
                    }
                    else
                        MyMailMessage.Bcc.Add(new System.Net.Mail.MailAddress(recipientBCCAddress.ToString()));
                }
                message = System.Web.HttpUtility.HtmlDecode(message);
                MyMailMessage.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(GetPlainTextFromHtml(message), null, MediaTypeNames.Text.Plain));
                MyMailMessage.IsBodyHtml = true;
                if (attachments != null)
                {
                    System.Net.Mail.Attachment attachment = null;

                    foreach (KeyValuePair<string, string> item in attachments)
                    {
                        attachment = new System.Net.Mail.Attachment(item.Key);
                        attachment.Name = item.Value;
                        MyMailMessage.Attachments.Add(attachment);
                    }
                }
                MyMailMessage.AlternateViews.Add(AlternateView.CreateAlternateViewFromString(message, null, MediaTypeNames.Text.Html));

                NetworkCredential mailAuthentication = new NetworkCredential(this.email.SMTPUsername, this.email.SMTPPassword);
                SmtpClient mailClient = new SmtpClient(this.email.SMTPServer, this.email.SMTPPort);
                mailClient.EnableSsl = this.email.EnableSsl;
                mailClient.UseDefaultCredentials = this.email.UseSMTPAuthentication;
                mailClient.Credentials = mailAuthentication;
                mailClient.Send(MyMailMessage);
                sent = true;
            }
            catch (Exception ex)
            {
                sent = false;
                error = ex.Message;
            }
            finally
            {
                if (MyMailMessage != null)
                {
                    MyMailMessage.Dispose();
                    MyMailMessage = null;
                }
            }
            return sent;
        }
        public bool SendEmailAws(EmailType type, bool loadContentFromTemplate, string senderUserName, string recipientAddress, string recipientCCAddress, string recipientBCCAddress, string subject, string message,
                              Dictionary<string, string> attachments, out string error, string culture)
        {
            bool sent = false;
            error = string.Empty;
            System.Net.Mail.MailMessage MyMailMessage = null;
            GetEmailCredentials(type, culture);
            if (loadContentFromTemplate)
            {
                GetEmailTemplate(type, culture);
                senderUserName = this.email.SenderUserName;
                recipientBCCAddress = this.email.RecipientBCCAddress;
                subject = this.email.Subject;
                message = this.email.Message;
            }
            try
            {
                AmazonSimpleEmailServiceClient client = new AmazonSimpleEmailServiceClient(this.email.SMTPUsername, this.email.SMTPPassword, RegionEndpoint.USEast1);
                Destination destination = new Destination();
                destination.ToAddresses = new List<string>() { recipientAddress };
                Body body = new Body() { Html = new Content(message) };
                Content subjectA = new Content(subject);
                Message messageA = new Message(subjectA, body);
                SendEmailRequest sendEmailRequest = new SendEmailRequest(this.email.SenderUserName, destination, messageA);
                client.SendEmail(sendEmailRequest);
                sent = true;
            }
            catch (Exception ex)
            {
                sent = false;
                error = ex.Message;
            }
            finally
            {
                if (MyMailMessage != null)
                {
                    MyMailMessage.Dispose();
                    MyMailMessage = null;
                }
            }
            return sent;
        }

        public bool SaveEmailSettings(EmailType type, string smtpUsername, string smtpPassword, string smtpServer, int smtpPort, bool enableSsl, bool useSMTPAuthentication, string senderUserName, string defaultRecipientAddress,
                                      string recipientBCCAddress, string subject, string message, string culture)
        {
            bool success = false;
            int numAttempts = 0;

            while (!success && numAttempts < 2)
            {
                try
                {
                    numAttempts++;
                    XmlDocument doc = new XmlDocument();
                    XmlTextReader reader = new XmlTextReader(System.AppDomain.CurrentDomain.BaseDirectory + Tools.DefaultValues.EMAILSETTINGSFILE);
                    doc.Load(reader);
                    XmlNode exNode = doc.SelectSingleNode(GetTempletePath(type, culture) + "/" + "emailCredentials[@name=\"" + "Credentials" + "\"]");
                    exNode.Attributes["SMTPUsername"].Value = smtpUsername;
                    exNode.Attributes["SMTPPassword"].Value = smtpPassword;
                    exNode.Attributes["SMTPServer"].Value = smtpServer;
                    exNode.Attributes["SMTPPort"].Value = smtpPort.ToString();
                    exNode.Attributes["EnableSsl"].Value = enableSsl.ToString();
                    exNode.Attributes["UseSMTPAuthentication"].Value = useSMTPAuthentication.ToString();

                    doc.SelectSingleNode(GetTempletePath(type, culture) + "/" + SENDERUSERNAME).InnerText = senderUserName;
                    doc.SelectSingleNode(GetTempletePath(type, culture) + "/" + BCCRECIPIENTADDRESS).InnerText = recipientBCCAddress;
                    doc.SelectSingleNode(GetTempletePath(type, culture) + "/" + SUBJECT).InnerText = subject;
                    doc.SelectSingleNode(GetTempletePath(type, culture) + "/" + MESSAGE).InnerText = message;
                    doc.SelectSingleNode(GetTempletePath(type, culture) + "/" + DEFAULTRECIPIENTADDRESS).InnerText = defaultRecipientAddress;

                    reader.Close();
                    doc.Save(System.AppDomain.CurrentDomain.BaseDirectory + Tools.DefaultValues.EMAILSETTINGSFILE);
                    success = true;
                }
                catch
                {
                    success = false;
                    System.Threading.Thread.Sleep(1000);
                }
            }
            return success;
        }

        public Email GetEmailSettings(EmailType type, string culture)
        {
            this.GetEmailTemplate(type, culture);
            this.GetEmailCredentials(type, culture);
            return this.Email;
        }

        public System.Threading.Tasks.Task SendAsync(IdentityMessage message)
        {
            string error = string.Empty;
            this.GetEmailTemplate(EmailType.EmailTwoFactor, null);
            var emailBody = this.email.Message;
            emailBody = emailBody.Replace("EmailParam", message.Destination);
            emailBody = emailBody.Replace("IpParam", Tools.Helper.GetClientIp());
            emailBody = emailBody.Replace("CodeParam", message.Body);
            this.SendEmail(EmailType.EmailTwoFactor, false, email.SenderUserName, message.Destination, string.Empty, string.Empty, email.Subject, emailBody, null, out error, null);
            return Task.FromResult(0);
        }
      
        private string GetPlainTextFromHtml(string htmlString)
        {
            String sb = string.Empty;

            string linkUrls = @"<a\s+(?:[^>]*?\s+)?href=\""([^\""]*)\""";

            var regexLink= new Regex(linkUrls, RegexOptions.Singleline | RegexOptions.IgnoreCase);
            var founf = regexLink.Match(htmlString);

            for (Match m = regexLink.Match(htmlString); m.Success; m = m.NextMatch())
                sb += m.Groups[1].Value.ToString();

            string htmlTagPattern = "<.*?>";
            var regexCss = new Regex("(\\<script(.+?)\\</script\\>)|(\\<style(.+?)\\</style\\>)", RegexOptions.Singleline | RegexOptions.IgnoreCase);
            htmlString = regexCss.Replace(htmlString, string.Empty);
            htmlString = Regex.Replace(htmlString, @"<br />", "\n", RegexOptions.Multiline);
            htmlString = Regex.Replace(htmlString, @"^\s+$[\r\n]*", "\n", RegexOptions.Multiline);
            htmlString = Regex.Replace(htmlString, htmlTagPattern, string.Empty);
            htmlString = htmlString.Replace("&nbsp;", string.Empty);
            if (!string.IsNullOrEmpty(sb))
                htmlString += "\n" + sb;
            return htmlString;
        }
    }
}