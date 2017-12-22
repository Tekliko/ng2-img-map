"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var ImgMapComponent = (function () {
    function ImgMapComponent(renderer) {
        this.renderer = renderer;
        /**
         * Radius of the markers.
         */
        this.markerRadius = 10;
        /**
         * On change event.
         */
        this.changeEvent = new core_1.EventEmitter();
        /**
         * On mark event.
         */
        this.markEvent = new core_1.EventEmitter();
        /**
         * Collection of markers.
         */
        this.markers = [];
        /**
         * Index of the hover state marker.
         */
        this.markerHover = null;
        /**
         * Pixel position of markers.
         */
        this.pixels = [];
        
        /**
         * Added by V. Laugier
         */
        this.inside = require('point-in-polygon');        
        this.emphasizedMarkersIndexes = []; 
    }
    Object.defineProperty(ImgMapComponent.prototype, "setMarkers", {
        set: function (markers) {
            this.markerActive = null;
            this.markerHover = null;            
            this.markers = markers;
            this.draw();
        },
        enumerable: true,
        configurable: true
    });
    // Added by V. Laugier
    Object.defineProperty(ImgMapComponent.prototype, "setEmphasizedMarkersIndexes", {
        set: function (markers) {
            this.emphasizedMarkersIndexes = markers;            
            this.draw();
        },
        enumerable: true,
        configurable: true
    });    
    ImgMapComponent.prototype.change = function () {
        if (this.markerActive === null) {
            this.changeEvent.emit(null);
        }
        else {
            console.debug("this.markerActive: " + this.markerActive);
            this.changeEvent.emit({"markerPoints" : this.markers[this.markerActive],
                                   "markerIndex" : this.markerActive});
        }
        this.draw();
    };
    /**
     * Get the cursor position relative to the canvas.
     */
    ImgMapComponent.prototype.cursor = function (event) {
        var rect = this.canvas.nativeElement.getBoundingClientRect();
        return [
            event.clientX - rect.left,
            event.clientY - rect.top
        ];
    };
    /**
     * Draw a marker.
     */
    ImgMapComponent.prototype.drawMarker = function (pixel, type) {
        var context = this.canvas.nativeElement.getContext('2d');
        context.beginPath();
//         console.debug("HERE!!!!! " + pixel.length);
        if (pixel.length == 2) {
          context.arc(pixel[0], pixel[1], this.markerRadius, 0, 2 * Math.PI);
        } else {
//           context.rect(pixel[0], pixel[1], pixel[2], pixel[3]);
          
          context.beginPath();
          for (var i = 0; i < pixel.length ; i++) {
            if (i == 1) {
              context.moveTo(pixel[i-1], pixel[i]);
            } else {
              if (i % 2 != 0) {
                context.lineTo(pixel[i-1], pixel[i]);
              }
            }
            
          }
          
        }
        
        switch (type) {
            case 'active':
                context.fillStyle = 'rgba(100, 100, 100, 0.6)';
                break;
            case 'hover':
                context.fillStyle = 'rgba(0, 0, 255, 0.6)';
                break;
            // Added by V. Laugier
            case 'emphasized':
                context.fillStyle = 'rgba(255, 0, 0, 0.8)';
                break;
            default:
                context.fillStyle = 'rgba(0, 0, 255, 0.1)';
        }
        context.fill();
    };
    /**
     * Check if a position is inside a marker.
     */
    ImgMapComponent.prototype.insideMarker = function (pixel, coordinate) {
      
//         var inside = require('point-in-polygon');
//         var polygon = [ [ 1, 1 ], [ 1, 2 ], [ 2, 2 ], [ 2, 1 ] ];
        var polygon = [];
        
        if (pixel.length == 2) {
            return Math.sqrt((coordinate[0] - pixel[0]) * (coordinate[0] - pixel[0])
            + (coordinate[1] - pixel[1]) * (coordinate[1] - pixel[1])) < this.markerRadius;            
        } else {
          for (var i = 0; i < pixel.length; i++){
            if (i % 2 != 0) {
              var pointInPolygon = [pixel[i-1],pixel[i]];
              polygon.push(pointInPolygon);              
            }
          }
//           console.dir({"coordinate": coordinate,
//                       "polygon" : polygon,
//                       "inside" :  this.inside(coordinate,polygon)});
          return(this.inside(coordinate,polygon));
        }
        
//         console.dir([
//             this.inside([ 1.5, 1.5 ], polygon),
//             this.inside([ 4.9, 1.2 ], polygon),
//             this.inside([ 1.8, 1.1 ], polygon)
//         ]);
      
        
    };
    /**
     * Convert a percentage position to a pixel position.
     */
    ImgMapComponent.prototype.markerToPixel = function (marker) {
        var image = this.image.nativeElement;
        var result = [];
//         return [
//             (image.clientWidth / 100) * marker[0],
//             (image.clientHeight / 100) * marker[1]                        
//         ];
        
        // Added by Vincent L.
        for (var i = 0; i < marker.length; i++) {
          if (i%2 == 0) {
              result.push((image.clientWidth / 100) * marker[i]);              
          } else {
            result.push((image.clientHeight / 100) * marker[i]);              
          }
        }
        
        return result;
        
    };
    /**
     * Convert a pixel position to a percentage position.
     */
    ImgMapComponent.prototype.pixelToMarker = function (pixel) {
        var image = this.image.nativeElement;
        return [
            (pixel[0] / image.clientWidth) * 100,
            (pixel[1] / image.clientHeight) * 100
        ];
    };
    /**
     * Sets the new marker position.
     */
    ImgMapComponent.prototype.mark = function (pixel) {
        this.markerActive = this.markers.length;
//         this.markers.push(this.pixelToMarker(pixel)); // Commented out by V. Laugier
        this.draw();
        this.markEvent.emit(this.markers[this.markerActive]);
    };
    /**
     * Sets the marker pixel positions.
     */
    ImgMapComponent.prototype.setPixels = function () {
        var _this = this;
        this.pixels = [];
        this.markers.forEach(function (marker) {
            _this.pixels.push(_this.markerToPixel(marker));
        });
    };
    /**
     * Clears the canvas and draws the markers.
     */
    ImgMapComponent.prototype.draw = function () {
        var _this = this;
        var canvas = this.canvas.nativeElement;
        var container = this.container.nativeElement;
        var image = this.image.nativeElement;
        var height = image.clientHeight;
        var width = image.clientWidth;
        this.renderer.setElementAttribute(canvas, 'height', "" + height);
        this.renderer.setElementAttribute(canvas, 'width', "" + width);
        this.renderer.setElementStyle(container, 'height', height + "px");
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, width, height);
        this.setPixels();
        this.pixels.forEach(function (pixel, index) {
            if (_this.markerActive === index) {
                _this.drawMarker(pixel, 'active');
            }
            else if (_this.markerHover === index) {
                _this.drawMarker(pixel, 'hover');
            }
            else if (_this.emphasizedMarkersIndexes.indexOf(index) >= 0) {
                _this.drawMarker(pixel, 'emphasized');
            }
            else {
                _this.drawMarker(pixel);
            }
        });
    };
    ImgMapComponent.prototype.onClick = function (event) {
        var _this = this;
        var cursor = this.cursor(event);
        var active = false;
        if (this.changeEvent.observers.length) {
            var change = false;
            this.pixels.forEach(function (pixel, index) {
                if (_this.insideMarker(pixel, cursor)) {
                    active = true;
                    if (_this.markerActive === null || _this.markerActive !== index) {
                        _this.markerActive = index;
                        change = true;
                    }
                }
            });
            if (!active && this.markerActive !== null) {
                this.markerActive = null;
                change = true;
            }
            if (change)
                this.change();
        }
        if (!active && this.markEvent.observers.length) {
            this.mark(cursor);
        }
    };
    ImgMapComponent.prototype.onLoad = function (event) {
        this.draw();
    };
    ImgMapComponent.prototype.onMousemove = function (event) {
        var _this = this;
        if (this.changeEvent.observers.length) {
            var cursor_1 = this.cursor(event);
            var hover = false;
            var draw = false;
            this.pixels.forEach(function (pixel, index) {
                if (_this.insideMarker(pixel, cursor_1)) {
                    hover = true;
                    if (_this.markerHover === null || _this.markerHover !== index) {
                        _this.markerHover = index;
                        draw = true;
                    }
                }
            });
            if (!hover && this.markerHover !== null) {
                this.markerHover = null;
                draw = true;
            }
            if (draw)
                this.draw();
        }
    };
    ImgMapComponent.prototype.onMouseout = function (event) {
        if (this.markerHover) {
            this.markerHover = null;
            this.draw();
        }
    };
    ImgMapComponent.prototype.onResize = function (event) {
        this.draw();
    };
    __decorate([
        core_1.ViewChild('canvas'), 
        __metadata('design:type', core_1.ElementRef)
    ], ImgMapComponent.prototype, "canvas", void 0);
    __decorate([
        core_1.ViewChild('container'), 
        __metadata('design:type', core_1.ElementRef)
    ], ImgMapComponent.prototype, "container", void 0);
    __decorate([
        core_1.ViewChild('image'), 
        __metadata('design:type', core_1.ElementRef)
    ], ImgMapComponent.prototype, "image", void 0);
    __decorate([
        core_1.Input('markers'), 
        __metadata('design:type', Array), 
        __metadata('design:paramtypes', [Array])
    ], ImgMapComponent.prototype, "setMarkers", null);
    // Added by V. Laugier
    __decorate([
        core_1.Input('emphasizedMarkersIndexes'), 
        __metadata('design:type', Array), 
        __metadata('design:paramtypes', [Array])
    ], ImgMapComponent.prototype, "setEmphasizedMarkersIndexes", null);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Number)
    ], ImgMapComponent.prototype, "markerRadius", void 0);
    __decorate([
        core_1.Input(), 
        __metadata('design:type', String)
    ], ImgMapComponent.prototype, "src", void 0);
    __decorate([
        core_1.Output('change'), 
        __metadata('design:type', Object)
    ], ImgMapComponent.prototype, "changeEvent", void 0);
    __decorate([
        core_1.Output('mark'), 
        __metadata('design:type', Object)
    ], ImgMapComponent.prototype, "markEvent", void 0);
    ImgMapComponent = __decorate([
        core_1.Component({
            selector: 'img-map',
            styles: [
                '.img-map { position: relative; }',
                '.img-map canvas, .img-map img { position: absolute; top: 0; left: 0; }',
                '.img-map img { display: block; height: auto; max-width: 100%; }'
            ],
            template: "\n    <div\n      class=\"img-map\"\n      #container\n      (window:resize)=\"onResize($event)\"\n    >\n      <img\n        #image\n        [src]=\"src\"\n        (load)=\"onLoad($event)\"\n      >\n      <canvas\n        #canvas\n        (click)=\"onClick($event)\"\n        (mousemove)=\"onMousemove($event)\"\n        (mouseout)=\"onMouseout($event)\"\n      ></canvas>\n    </div>\n  "
        }), 
        __metadata('design:paramtypes', [core_1.Renderer])
    ], ImgMapComponent);
    return ImgMapComponent;
}());
exports.ImgMapComponent = ImgMapComponent;
//# sourceMappingURL=ng2-img-map.js.map
