with BuildingFiles (BuildingId, FileId, FileBucketId, FileType, FilePath)
as
(
	select BuildingId, FileId, FileBucketId, 'File' as 'FileType', replace(fb.PhysicalPath, '\', '') + '/' + fb.[Name] + '/' + f.[Name] 'FilePath'
	from BuildingFile bf 
	join Files f on bf.FileId = f.Id
	join FileBuckets fb on fb.Id = f.FileBucketId 
	union
	select BuildingId, FileId, FileBucketId, 'Image' as 'FileType', replace(fb.PhysicalPath, '\', '') + '/' + fb.[Name] + '/' + f.[Name] 'FilePath'
	from BuildingImage bi
	join Files f on bi.FileId = f.Id
	join FileBuckets fb on fb.Id = f.FileBucketId 
	union
	select BuildingId, FileId, FileBucketId, 'Info' as 'FileType', replace(fb.PhysicalPath, '\', '') + '/' + fb.[Name] + '/' + f.[Name] 'FilePath'
	from BuildingDisasterInfo bd
	join Files f on bd.FileId = f.Id
	join FileBuckets fb on fb.Id = f.FileBucketId 
	union
	select BuildingId, PlanFileId 'FileId', FileBucketId, 'Plan' as 'FileType', replace(fb.PhysicalPath, '\', '') + '/' + fb.[Name] + '/' + f.[Name] 'FilePath'
	from BuildingPlan bp
	join Files f on bp.PlanFileId = f.Id
	join FileBuckets fb on fb.Id = f.FileBucketId 
	union
	select h.BuildingId, f.Id 'FileId', FileBucketId, 'Hotspot' as 'FileType', replace(fb.PhysicalPath, '\', '') + '/' + fb.[Name] + '/' + f.[Name] 'FilePath'
	from Hotspot h
	join Files f on f.Hotspot_Id = h.Id
	join FileBuckets fb on fb.Id = f.FileBucketId
	where f.Hotspot_Id is not null
)
select
	bf.BuildingId,
	bf.FileId,
	bf.FileBucketId,
	bf.FileType,
	bf.FilePath,
	b.Name 'BuildingName',
	a.Name 'ClientName'
from BuildingFiles bf
join Buildings b on b.Id = bf.BuildingId
join Actors a on a.Id = b.ActorId