select f.[Id] 'FileId', 
fb.[Id] 'FileBucketId', 
replace(fb.PhysicalPath, '\', '') + '/' + fb.[Name] + '/' + f.[Name] 'FilePath',
b.[Name] 'BuildingName',
a.[Name] 'ClientName'
from [dbo].[Files] f 
join [dbo].[BuildingPlan] bp on f.Id = bp.PlanFileId 
join [dbo].[FileBuckets] fb on f.FileBucketId = fb.Id
join [dbo].[Buildings] b on b.Id = bp.BuildingId
join [dbo].[Actors] a on a.Id = b.ActorId
where f.IsActive = 1 
and bp.IsActive = 1 
and fb.IsActive = 1 
and fb.FileBucketTypeId = 2