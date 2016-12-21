var RapApp;
(function (RapApp) {
    var Models;
    (function (Models) {
        var Hotspot = (function () {
            function Hotspot(Dto) {
                this.Dto = Dto;
                this.ActiveFileIndex = 0;
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
            Hotspot.prototype.reloadDto = function (dto) {
                this.Dto = dto;
                this.DisplayDetails = JSON.parse(this.Dto.DisplayDetails);
            };
            Hotspot.prototype.initActiveFile = function () {
                this.ActiveFileIndex = 0;
                if (this.Dto.Files && this.Dto.Files.length > 0) {
                    this.ActiveFile = this.Dto.Files[0];
                }
                else
                    this.ActiveFile = null;
            };
            Hotspot.prototype.nextActiveFile = function () {
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
            };
            Hotspot.prototype.prevActiveFile = function () {
                if (this.Dto && this.Dto.Files && this.Dto.Files.length > 0) {
                    if (this.ActiveFileIndex > 0) {
                        this.ActiveFileIndex--;
                        this.ActiveFile = this.Dto.Files[this.ActiveFileIndex];
                    }
                    else {
                        this.ActiveFileIndex = this.Dto.Files.length - 1;
                        this.ActiveFile = this.Dto.Files[this.ActiveFileIndex];
                    }
                }
                else {
                    this.ActiveFileIndex = 0;
                    this.ActiveFile = null;
                }
            };
            return Hotspot;
        }());
        Models.Hotspot = Hotspot;
    })(Models = RapApp.Models || (RapApp.Models = {}));
})(RapApp || (RapApp = {}));
