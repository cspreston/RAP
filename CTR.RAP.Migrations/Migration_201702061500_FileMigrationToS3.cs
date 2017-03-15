using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Reflection;
using System.Runtime.CompilerServices;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using CTR.RAP.Migrations.Extensions;
using FluentMigrator;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace CTR.RAP.Migrations
{
    [Tags("S3FileMigration")]
    [Migration(201702061500)]
    public class Migration_201702061500_FileMigrationToS3 : Migration
    {
        private Dictionary<string, Guid> idMap;
        private const string migrationId = "4C7A0FCC-FA0C-447F-9D39-FBA6225AC6D2";
        private string rootPath = "";

        public override void Up()
        {
            idMap = new Dictionary<string, Guid>();

            switch ((string)ApplicationContext)
            {
                case "Test":
                    rootPath = "C:/inetpub/wwwroot/RAPTEST/";
                    break;

                case "Prod":
                    rootPath = "C:/inetpub/wwwroot/RAP/";
                    break;

                default:
                    rootPath = "E:/Solutions/Git/CTR/";
                    break;
            }

            Create.RapTable("MigrationDataChanges")
                .WithColumn("MigrationId").AsString(128).NotNullable()
                .WithColumn("TableName").AsString(128).NotNullable()
                .WithColumn("RecordId").AsString(128).NotNullable()
                .WithColumn("Details").AsString(int.MaxValue).NotNullable()
                .WithAuditColumns();

            //Execute.WithConnection(migrateBuildingFiles);
            //Execute.WithConnection(migrateBuildingImages);
            //Execute.WithConnection(migrateBuildingDisasterInfos);
            //Execute.WithConnection(migrateBuildingPlans);
        }

        public override void Down()
        {
            Execute.WithConnection(rollbackDataChanges);

            Delete.Table("MigrationDataChanges");
        }

        private void migrateBuildingFiles(IDbConnection conn, IDbTransaction tran)
        {
            var processFileData = new List<ExpandoObject>();
            var updateRecords = new List<ExpandoObject>();
            var changeRecords = new List<ExpandoObject>();

            var columns = new
            {
                FileId = 0,
                FileBucketId = 1,
                FilePath = 2,
                BuildingName = 3,
                ClientName = 4
            };

            // Get the files data
            using (IDbCommand cmd = tran.Connection.CreateCommand())
            {
                cmd.Transaction = tran;
                cmd.CommandText = this.GetEmbeddedSql("FileMigrationToS3_BuildingFiles.sql");

                using (IDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        dynamic fileData = new ExpandoObject();

                        fileData.FileId = reader.GetString(columns.FileId);
                        fileData.FileBucketId = reader.GetString(columns.FileBucketId);
                        fileData.FilePath = reader.GetString(columns.FilePath);
                        fileData.ClientName = reader.GetString(columns.ClientName);
                        fileData.BuildingName = reader.GetString(columns.BuildingName);

                        processFileData.Add(fileData);
                    }
                }
            }

            foreach (dynamic processData in processFileData)
            {
                // Upload the file to S3
                var targetPath = (processData.ClientName as string).KebabCase() + "/" + 
                    (processData.BuildingName as string).KebabCase() + "/files/" +
                    (processData.FilePath as string).Split('/').Reverse().First().KebabCase();

                dynamic uploadData = new ExpandoObject();

                uploadData.sourceFile = rootPath + processData.FilePath;
                uploadData.targetFile = targetPath.ToLower();

                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("Uploading " + uploadData.sourceFile);

                var location = uploadFile(uploadData);

                if (!string.IsNullOrEmpty(location))
                {
                    // Update the Files record with the new url
                    dynamic fileUpdate = new ExpandoObject();

                    fileUpdate.TableName = "Files";
                    fileUpdate.RecordId = processData.FileId;
                    fileUpdate.FieldName = "Url";
                    fileUpdate.FieldValue = location;

                    updateRecords.Add(fileUpdate);

                    // Save the change details in the MigrationDataChanges table
                    dynamic changeData = new ExpandoObject();

                    var details = JObject.FromObject(new {
                        FieldName = "Url",
                        OriginalValue = "",
                        AlteredValue = location
                    });

                    changeData.Id = Guid.NewGuid().ToString();
                    changeData.MigrationId = migrationId;
                    changeData.TableName = "Files";
                    changeData.RecordId = processData.FileId;
                    changeData.Details = details.ToString();
                    changeData.CreatedBy = migrationId;
                    changeData.CreatedDate = DateTime.Now;

                    changeRecords.Add(changeData);
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("Upload Failed");
                }
            }

            foreach (dynamic record in updateRecords)
            {
                // Create the new FileBuckets record
                using (IDbCommand cmd = tran.Connection.CreateCommand())
                {
                    cmd.Transaction = tran;

                    updateRecord(cmd, "dbo", record);
                }
            }

            foreach (dynamic record in changeRecords)
            {
                // Create the new FileBuckets record
                using (IDbCommand cmd = tran.Connection.CreateCommand())
                {
                    cmd.Transaction = tran;

                    var change = (IDictionary<string, object>)record;

                    insertRecord(cmd, "dbo", "MigrationDataChanges", change);
                }
            }
        }

        private void migrateBuildingImages(IDbConnection conn, IDbTransaction tran)
        {
            var processFileData = new List<ExpandoObject>();
            var updateRecords = new List<ExpandoObject>();
            var changeRecords = new List<ExpandoObject>();

            var columns = new
            {
                FileId = 0,
                FileBucketId = 1,
                FilePath = 2,
                BuildingName = 3,
                ClientName = 4
            };

            // Get the files data
            using (IDbCommand cmd = tran.Connection.CreateCommand())
            {
                cmd.Transaction = tran;
                cmd.CommandText = this.GetEmbeddedSql("FileMigrationToS3_BuildingImages.sql");

                using (IDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        dynamic fileData = new ExpandoObject();

                        fileData.FileId = reader.GetString(columns.FileId);
                        fileData.FileBucketId = reader.GetString(columns.FileBucketId);
                        fileData.FilePath = reader.GetString(columns.FilePath);
                        fileData.ClientName = reader.GetString(columns.ClientName);
                        fileData.BuildingName = reader.GetString(columns.BuildingName);

                        processFileData.Add(fileData);
                    }
                }
            }

            foreach (dynamic processData in processFileData)
            {
                // Upload the file to S3
                var targetPath = (processData.ClientName as string).KebabCase() + "/" +
                    (processData.BuildingName as string).KebabCase() + "/images/" +
                    (processData.FilePath as string).Split('/').Reverse().First().KebabCase();

                dynamic uploadData = new ExpandoObject();

                uploadData.sourceFile = rootPath + processData.FilePath;
                uploadData.targetFile = targetPath.ToLower();

                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("Uploading " + uploadData.sourceFile);

                var location = uploadFile(uploadData);
                var thumbLocation = "";

                if (!string.IsNullOrEmpty(location))
                {
                    // Create a thumbnail image
                    dynamic thumbData = new ExpandoObject();

                    thumbData.sourceFile = targetPath.ToLower();
                    thumbData.targetFile = targetPath.ToLower().Replace("/images/", "/thumbs/");
                    thumbData.thumbWidth = 200;

                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine("Creating Thumb " + thumbData.targetFile);

                    thumbLocation = createThumbImage(thumbData);
                }

                if (!string.IsNullOrEmpty(location))
                {
                    // Update the Files record with the new urls
                    dynamic fileUpdate = new ExpandoObject();

                    fileUpdate.TableName = "Files";
                    fileUpdate.RecordId = processData.FileId;
                    fileUpdate.FieldName = "Url";
                    fileUpdate.FieldValue = location;

                    updateRecords.Add(fileUpdate);

                    // Save the change details in the MigrationDataChanges table
                    dynamic changeData = new ExpandoObject();

                    var details = JObject.FromObject(new
                    {
                        FieldName = "Url",
                        OriginalValue = "",
                        AlteredValue = location
                    });

                    changeData.Id = Guid.NewGuid().ToString();
                    changeData.MigrationId = migrationId;
                    changeData.TableName = "Files";
                    changeData.RecordId = processData.FileId;
                    changeData.Details = details.ToString();
                    changeData.CreatedBy = migrationId;
                    changeData.CreatedDate = DateTime.Now;

                    changeRecords.Add(changeData);
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("Upload Failed");
                }

                if (!string.IsNullOrEmpty(thumbLocation))
                {
                    // Update the Files record with the new urls
                    dynamic fileUpdate = new ExpandoObject();

                    fileUpdate.TableName = "Files";
                    fileUpdate.RecordId = processData.FileId;
                    fileUpdate.FieldName = "ThumbUrl";
                    fileUpdate.FieldValue = thumbLocation;

                    updateRecords.Add(fileUpdate);

                    // Save the change details in the MigrationDataChanges table
                    dynamic changeData = new ExpandoObject();

                    var details = JObject.FromObject(new
                    {
                        FieldName = "ThumbUrl",
                        OriginalValue = "",
                        AlteredValue = thumbLocation
                    });

                    changeData.Id = Guid.NewGuid().ToString();
                    changeData.MigrationId = migrationId;
                    changeData.TableName = "Files";
                    changeData.RecordId = processData.FileId;
                    changeData.Details = details.ToString();
                    changeData.CreatedBy = migrationId;
                    changeData.CreatedDate = DateTime.Now;

                    changeRecords.Add(changeData);
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("Thumb Creation Failed");
                }
            }

            foreach (dynamic record in updateRecords)
            {
                // Create the new FileBuckets record
                using (IDbCommand cmd = tran.Connection.CreateCommand())
                {
                    cmd.Transaction = tran;

                    updateRecord(cmd, "dbo", record);
                }
            }

            foreach (dynamic record in changeRecords)
            {
                // Create the new FileBuckets record
                using (IDbCommand cmd = tran.Connection.CreateCommand())
                {
                    cmd.Transaction = tran;

                    var change = (IDictionary<string, object>)record;

                    insertRecord(cmd, "dbo", "MigrationDataChanges", change);
                }
            }
        }

        private void migrateBuildingDisasterInfos(IDbConnection conn, IDbTransaction tran)
        {
            var processFileData = new List<ExpandoObject>();
            var updateRecords = new List<ExpandoObject>();
            var changeRecords = new List<ExpandoObject>();

            var columns = new
            {
                FileId = 0,
                FileBucketId = 1,
                FilePath = 2,
                BuildingName = 3,
                ClientName = 4
            };

            // Get the files data
            using (IDbCommand cmd = tran.Connection.CreateCommand())
            {
                cmd.Transaction = tran;
                cmd.CommandText = this.GetEmbeddedSql("FileMigrationToS3_BuildingDisasterInfos.sql");

                using (IDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        dynamic fileData = new ExpandoObject();

                        fileData.FileId = reader.GetString(columns.FileId);
                        fileData.FileBucketId = reader.GetString(columns.FileBucketId);
                        fileData.FilePath = reader.GetString(columns.FilePath);
                        fileData.ClientName = reader.GetString(columns.ClientName);
                        fileData.BuildingName = reader.GetString(columns.BuildingName);

                        processFileData.Add(fileData);
                    }
                }
            }

            foreach (dynamic processData in processFileData)
            {
                // Upload the file to S3
                var targetPath = (processData.ClientName as string).KebabCase() + "/" +
                    (processData.BuildingName as string).KebabCase() + "/info/" +
                    (processData.FilePath as string).Split('/').Reverse().First().KebabCase();

                dynamic uploadData = new ExpandoObject();

                uploadData.sourceFile = rootPath + processData.FilePath;
                uploadData.targetFile = targetPath.ToLower();

                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("Uploading " + uploadData.sourceFile);

                var location = uploadFile(uploadData);

                if (!string.IsNullOrEmpty(location))
                {
                    // Update the Files record with the new url
                    dynamic fileUpdate = new ExpandoObject();

                    fileUpdate.TableName = "Files";
                    fileUpdate.RecordId = processData.FileId;
                    fileUpdate.FieldName = "Url";
                    fileUpdate.FieldValue = location;

                    updateRecords.Add(fileUpdate);

                    // Save the change details in the MigrationDataChanges table
                    dynamic changeData = new ExpandoObject();

                    var details = JObject.FromObject(new
                    {
                        FieldName = "Url",
                        OriginalValue = "",
                        AlteredValue = location
                    });

                    changeData.Id = Guid.NewGuid().ToString();
                    changeData.MigrationId = migrationId;
                    changeData.TableName = "Files";
                    changeData.RecordId = processData.FileId;
                    changeData.Details = details.ToString();
                    changeData.CreatedBy = migrationId;
                    changeData.CreatedDate = DateTime.Now;

                    changeRecords.Add(changeData);
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("Upload Failed");
                }
            }

            foreach (dynamic record in updateRecords)
            {
                // Create the new FileBuckets record
                using (IDbCommand cmd = tran.Connection.CreateCommand())
                {
                    cmd.Transaction = tran;

                    updateRecord(cmd, "dbo", record);
                }
            }

            foreach (dynamic record in changeRecords)
            {
                // Create the new FileBuckets record
                using (IDbCommand cmd = tran.Connection.CreateCommand())
                {
                    cmd.Transaction = tran;

                    var change = (IDictionary<string, object>)record;

                    insertRecord(cmd, "dbo", "MigrationDataChanges", change);
                }
            }
        }

        private void migrateBuildingPlans(IDbConnection conn, IDbTransaction tran)
        {
            var processFileData = new List<ExpandoObject>();
            var updateRecords = new List<ExpandoObject>();
            var changeRecords = new List<ExpandoObject>();

            var columns = new
            {
                FileId = 0,
                FileBucketId = 1,
                FilePath = 2,
                BuildingName = 3,
                ClientName = 4
            };

            // Get the files data
            using (IDbCommand cmd = tran.Connection.CreateCommand())
            {
                cmd.Transaction = tran;
                cmd.CommandText = this.GetEmbeddedSql("FileMigrationToS3_BuildingPlans.sql");

                using (IDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        dynamic fileData = new ExpandoObject();

                        fileData.FileId = reader.GetString(columns.FileId);
                        fileData.FileBucketId = reader.GetString(columns.FileBucketId);
                        fileData.FilePath = reader.GetString(columns.FilePath);
                        fileData.ClientName = reader.GetString(columns.ClientName);
                        fileData.BuildingName = reader.GetString(columns.BuildingName);

                        processFileData.Add(fileData);
                    }
                }
            }

            foreach (dynamic processData in processFileData)
            {
                // Upload the file to S3
                var targetPath = (processData.ClientName as string).KebabCase() + "/" +
                    (processData.BuildingName as string).KebabCase() + "/plans/" +
                    (processData.FilePath as string).Split('/').Reverse().First().KebabCase();

                var fileName = targetPath.Split('/').Last();

                dynamic uploadData = new ExpandoObject();

                uploadData.sourceFile = rootPath + processData.FilePath;
                uploadData.targetFile = targetPath.ToLower();

                Console.ForegroundColor = ConsoleColor.Green;
                Console.WriteLine("Uploading " + uploadData.sourceFile);

                var location = uploadFile(uploadData);
                var thumbLocation = "";
                var zoomLocation = "";

                if (!string.IsNullOrEmpty(location))
                {
                    // Create a thumbnail image
                    dynamic thumbData = new ExpandoObject();

                    thumbData.sourceFile = targetPath.ToLower();
                    thumbData.targetFile = targetPath.ToLower().Replace("/plans/", "/thumbs/");
                    thumbData.thumbWidth = 200;

                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine("Creating Thumb " + thumbData.targetFile);

                    thumbLocation = createThumbImage(thumbData);

                    // Create a deep zoom image
                    dynamic zoomData = new ExpandoObject();

                    zoomData.sourceFile = targetPath.ToLower();
                    zoomData.targetFolder = targetPath.Replace("/" + fileName, "");

                    Console.ForegroundColor = ConsoleColor.Green;
                    Console.WriteLine("Creating Zoom " + zoomData.targetFolder);

                    zoomLocation = createZoomImage(zoomData);
                }

                if (!string.IsNullOrEmpty(location))
                {
                    // Update the Files record with the new urls
                    dynamic fileUpdate = new ExpandoObject();

                    fileUpdate.TableName = "Files";
                    fileUpdate.RecordId = processData.FileId;
                    fileUpdate.FieldName = "Url";
                    fileUpdate.FieldValue = location;

                    updateRecords.Add(fileUpdate);

                    // Save the change details in the MigrationDataChanges table
                    dynamic changeData = new ExpandoObject();

                    var details = JObject.FromObject(new
                    {
                        FieldName = "Url",
                        OriginalValue = "",
                        AlteredValue = location
                    });

                    changeData.Id = Guid.NewGuid().ToString();
                    changeData.MigrationId = migrationId;
                    changeData.TableName = "Files";
                    changeData.RecordId = processData.FileId;
                    changeData.Details = details.ToString();
                    changeData.CreatedBy = migrationId;
                    changeData.CreatedDate = DateTime.Now;

                    changeRecords.Add(changeData);
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("Upload Failed");
                }

                if (!string.IsNullOrEmpty(thumbLocation))
                {
                    // Update the Files record with the new urls
                    dynamic fileUpdate = new ExpandoObject();

                    fileUpdate.TableName = "Files";
                    fileUpdate.RecordId = processData.FileId;
                    fileUpdate.FieldName = "ThumbUrl";
                    fileUpdate.FieldValue = thumbLocation;

                    updateRecords.Add(fileUpdate);

                    // Save the change details in the MigrationDataChanges table
                    dynamic changeData = new ExpandoObject();

                    var details = JObject.FromObject(new
                    {
                        FieldName = "ThumbUrl",
                        OriginalValue = "",
                        AlteredValue = thumbLocation
                    });

                    changeData.Id = Guid.NewGuid().ToString();
                    changeData.MigrationId = migrationId;
                    changeData.TableName = "Files";
                    changeData.RecordId = processData.FileId;
                    changeData.Details = details.ToString();
                    changeData.CreatedBy = migrationId;
                    changeData.CreatedDate = DateTime.Now;

                    changeRecords.Add(changeData);
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("Thumb Creation Failed");
                }

                if (!string.IsNullOrEmpty(zoomLocation))
                {
                    // Update the Files record with the new urls
                    dynamic fileUpdate = new ExpandoObject();

                    fileUpdate.TableName = "Files";
                    fileUpdate.RecordId = processData.FileId;
                    fileUpdate.FieldName = "ZoomUrl";
                    fileUpdate.FieldValue = zoomLocation;

                    updateRecords.Add(fileUpdate);

                    // Save the change details in the MigrationDataChanges table
                    dynamic changeData = new ExpandoObject();

                    var details = JObject.FromObject(new
                    {
                        FieldName = "ZoomUrl",
                        OriginalValue = "",
                        AlteredValue = zoomLocation
                    });

                    changeData.Id = Guid.NewGuid().ToString();
                    changeData.MigrationId = migrationId;
                    changeData.TableName = "Files";
                    changeData.RecordId = processData.FileId;
                    changeData.Details = details.ToString();
                    changeData.CreatedBy = migrationId;
                    changeData.CreatedDate = DateTime.Now;

                    changeRecords.Add(changeData);
                }
                else
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine("Zoom Creation Failed");
                }
            }

            foreach (dynamic record in updateRecords)
            {
                // Create the new FileBuckets record
                using (IDbCommand cmd = tran.Connection.CreateCommand())
                {
                    cmd.Transaction = tran;

                    updateRecord(cmd, "dbo", record);
                }
            }

            foreach (dynamic record in changeRecords)
            {
                // Create the new FileBuckets record
                using (IDbCommand cmd = tran.Connection.CreateCommand())
                {
                    cmd.Transaction = tran;

                    var change = (IDictionary<string, object>)record;

                    insertRecord(cmd, "dbo", "MigrationDataChanges", change);
                }
            }
        }

        private void rollbackDataChanges(IDbConnection conn, IDbTransaction tran)
        {
            var updateRecords = new List<ExpandoObject>();
            var columns = new
            {
                TableName = 0,
                RecordId = 1,
                Details = 2
            };

            using (IDbCommand cmd = tran.Connection.CreateCommand())
            {
                var sql = @"select TableName, RecordId, Details from dbo.MigrationDataChanges where MigrationId = '{0}'";

                cmd.Transaction = tran;
                cmd.CommandText = string.Format(sql, migrationId);

                using (IDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        dynamic update = new ExpandoObject();

                        var details = JObject.Parse(reader.GetString(columns.Details));

                        update.TableName = reader.GetString(columns.TableName);
                        update.RecordId = reader.GetString(columns.RecordId);
                        update.FieldName = details.SelectToken("FieldName").Value<string>();
                        update.FieldValue = details.SelectToken("OriginalValue").Value<string>();

                        updateRecords.Add(update);
                    }
                }
            }

            foreach (dynamic record in updateRecords)
            {
                using (IDbCommand cmd = tran.Connection.CreateCommand())
                {
                    cmd.Transaction = tran;

                    updateRecord(cmd, "dbo", record);
                }
            }
        }

        private Guid getMappedId(string key)
        {
            if (idMap.ContainsKey(key))
            {
                return idMap[key];
            }

            Guid newId = Guid.NewGuid();
            idMap[key] = newId;

            return newId;
        }

        private void insertRecord(IDbCommand command, string schema, string table, IEnumerable<KeyValuePair<string, object>> record)
        {
            const string sql = "insert into {0}.{1} ({2}) values ({3})";
            var columns = new List<string>();
            var values = new List<string>();

            foreach (var kvp in record)
            {
                string paramName = "@" + kvp.Key;
                object paramValue = kvp.Value;

                if (paramValue != null)
                {
                    command.Parameters.Add(new SqlParameter(paramName, paramValue));

                    columns.Add(kvp.Key);
                    values.Add(paramName);
                }
            }

            string colString = "[" + String.Join("],[", columns.ToArray()) + "]";
            string valString = String.Join(",", values.ToArray());

            command.CommandText = String.Format(sql, schema, table, colString, valString);
            command.ExecuteNonQuery();
        }

        private void updateRecord(IDbCommand command, string schema, dynamic update)
        {
            const string sql = "update {0}.{1} set {2} = {3} where [Id] = {4}";

            var newValue = (update.FieldValue is string) ? "'" + update.FieldValue + "'" : update.FieldValue;
            var recordId = "'" + update.RecordId + "'" ;

            command.CommandText = String.Format(sql, schema, update.TableName, update.FieldName, newValue, recordId);
            command.ExecuteNonQuery();
        }

        private string uploadFile(object data)
        {
            using (HttpClient client = new HttpClient())
            {
                var request = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");
                HttpResponseMessage response = client.PostAsync("http://localhost:3000/s3/upload", request).Result;

                //response.EnsureSuccessStatusCode();

                if (response.IsSuccessStatusCode)
                {
                    using (HttpContent content = response.Content)
                    {
                        string result = content.ReadAsStringAsync().Result;

                        try
                        {
                            var location = JObject.Parse(result).SelectToken("data.Location", true).Value<string>();

                            return location;
                        }
                        catch (Exception ex)
                        {
                            return null;
                        }
                    }
                }
                else
                {
                    return null;
                }
            }
        }

        private string createThumbImage(object data)
        {
            using (HttpClient client = new HttpClient())
            {
                var request = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");
                HttpResponseMessage response = client.PostAsync("http://localhost:3000/lambda/create/thumb", request).Result;

                if (response.IsSuccessStatusCode)
                {
                    using (HttpContent content = response.Content)
                    {
                        string result = content.ReadAsStringAsync().Result;

                        try
                        {
                            var location = JObject.Parse(result).SelectToken("Location", true).Value<string>();

                            return location;
                        }
                        catch (Exception ex)
                        {
                            return null;
                        }
                    }
                }
                else
                {
                    return null;
                }
            }
        }

        private string createZoomImage(object data)
        {
            using (HttpClient client = new HttpClient())
            {
                var request = new StringContent(JsonConvert.SerializeObject(data), Encoding.UTF8, "application/json");
                HttpResponseMessage response = client.PostAsync("http://localhost:3000/lambda/create/zoom", request).Result;

                if (response.IsSuccessStatusCode)
                {
                    using (HttpContent content = response.Content)
                    {
                        string result = content.ReadAsStringAsync().Result;

                        try
                        {
                            var files = JArray.Parse(result);
                            var location = files.FirstOrDefault(f => f.SelectToken("Location", true).Value<string>().EndsWith(".dzi"));

                            return location.SelectToken("Location").Value<string>();
                        }
                        catch (Exception ex)
                        {
                            return null;
                        }
                    }
                }
                else
                {
                    return null;
                }
            }
        }

    }
}

