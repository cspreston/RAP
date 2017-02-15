select f.[Id] 'FileId', 
fb.[Id] 'FileBucketId', 
replace(fb.PhysicalPath, '\', '') + '/' + fb.[Name] + '/' + f.[Name] 'FilePath',
b.[Name] 'BuildingName',
a.[Name] 'ClientName'
from [dbo].[Files] f 
join [dbo].[BuildingFile] bf on f.Id = bf.FileId 
join [dbo].[FileBuckets] fb on f.FileBucketId = fb.Id
join [dbo].[Buildings] b on b.Id = bf.BuildingId
join [dbo].[Actors] a on a.Id = b.ActorId
where f.IsActive = 1 
and bf.IsActive = 1 
and fb.IsActive = 1 
and fb.FileBucketTypeId = 2
