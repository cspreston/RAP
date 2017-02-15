select f.[Id] 'FileId', 
fb.[Id] 'FileBucketId', 
replace(fb.PhysicalPath, '\', '') + '/' + fb.[Name] + '/' + f.[Name] 'FilePath',
b.[Name] 'BuildingName',
a.[Name] 'ClientName'
from [dbo].[Files] f 
join [dbo].[BuildingImage] bi on f.Id = bi.FileId 
join [dbo].[FileBuckets] fb on f.FileBucketId = fb.Id
join [dbo].[Buildings] b on b.Id = bi.BuildingId
join [dbo].[Actors] a on a.Id = b.ActorId
where f.IsActive = 1 
and bi.IsActive = 1 
and fb.IsActive = 1 
and fb.FileBucketTypeId = 2