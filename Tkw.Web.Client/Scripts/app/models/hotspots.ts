module RapApp.Models {
    export interface IHotspotDisplayType {
        Id: string;
        Name: string; 
        Description: string;
        FileName: string;
        Color: string;
        Type: number; 
    }

    export interface IHotspotActionType {
        Id: string;
        Name: string;
        Description: string;
    }

    export interface IHotspot {
        Id: string;
        Name: string;
        Description: string;
        BuildingId: string;
        BuildingPlanId: string;
        HotspotDisplayTypeId: string;
        BeaconuuId: string;
        HotspotDisplayType: IHotspotDisplayType,
        HotspotActionTypeId: string;
        HotspotActionType: IHotspotActionType;
        DisplayDetails: string;
        Files: Array<IFileWithBucket>;
    }

    export interface IHotspotDisplayDetails {
        Position: IPosition;
        Size: ISize;
        Rotation: number;
        Color: string;
        ForeColor: string;
        FontSize: number;
        Coords: ICoords;
        TextAlign: string;
    }

    export interface ICustomProperties {
        LineSize: number;
        LineColor: string;
        CircleSize: number;
        CircleColor: string;
    }
    
    export class Hotspot {
        public DisplayDetails: IHotspotDisplayDetails;
        public CustomProperties: ICustomProperties;
        public ActiveFileIndex: number = 0;
        public ActiveFile: any;
        public FabricJSObject: fabric.IObject;

        constructor(public Dto: IHotspot) {
            this.DisplayDetails = JSON.parse(Dto.DisplayDetails);
            //hotspot is line or circle
            if (this.Dto.HotspotDisplayType.Type != 1)
                this.CustomProperties = {
                    LineColor: this.DisplayDetails.Color,
                    CircleColor: this.DisplayDetails.Color,
                    LineSize: this.DisplayDetails.Size.width,
                    CircleSize: this.DisplayDetails.Size.width,
                };
        }

        public reloadDto(dto: IHotspot) {
            this.Dto = dto;
            this.DisplayDetails = JSON.parse(this.Dto.DisplayDetails);
        }

        public initActiveFile() {
            this.ActiveFileIndex = 0;
            if (this.Dto.Files && this.Dto.Files.length > 0) {
                this.ActiveFile = this.Dto.Files[0];
            }
            else this.ActiveFile = null;
        }

        public nextActiveFile() {
            if (this.Dto && this.Dto.Files && this.Dto.Files.length > 0) {
                if (this.Dto.Files.length - 1 > this.ActiveFileIndex) {
                    this.ActiveFileIndex++;
                    this.ActiveFile = this.Dto.Files[this.ActiveFileIndex];
                }
                else {
                    this.ActiveFileIndex = 0;
                    this.ActiveFile = this.Dto.Files[this.ActiveFileIndex];
                }
            }
            else {
                this.ActiveFileIndex = 0;
                this.ActiveFile = null;
            }
        }

        public prevActiveFile() {
            if (this.Dto && this.Dto.Files && this.Dto.Files.length > 0) {
                if (this.ActiveFileIndex > 0) {
                    this.ActiveFileIndex--;
                    this.ActiveFile = this.Dto.Files[this.ActiveFileIndex];
                }
                else {
                    this.ActiveFileIndex = this.Dto.Files.length -1;
                    this.ActiveFile = this.Dto.Files[this.ActiveFileIndex];
                }
            }
            else {
                this.ActiveFileIndex = 0;
                this.ActiveFile = null;
            }
        }
    }
}