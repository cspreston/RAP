using System;
using System.Linq;
using Microsoft.Practices.EnterpriseLibrary.SemanticLogging;
using Microsoft.Practices.EnterpriseLibrary.SemanticLogging.Formatters;

namespace Tools.Logger
{
    public static class EmailSinkExtension
    {
        public static SinkSubscription<EmailSink> LogToEmail(
          this IObservable<EventEntry> eventStream, string host, int port,
          string recipients, string subject, string smtpUsername, string smtpPassword,
          IEventTextFormatter formatter = null)
        {
            var sink = new EmailSink(host, port, recipients, subject, smtpUsername, smtpPassword, formatter);

            var subscription = eventStream.Subscribe(sink);

            return new SinkSubscription<EmailSink>(subscription, sink);
        }
    }
}