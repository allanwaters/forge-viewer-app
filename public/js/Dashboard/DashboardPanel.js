// Dashboard panel base
class DashboardPanel {
    load(parentDivId, divId, viewer) {
        this.divId = divId;
        this.viewer = viewer;
        $('#' + parentDivId).append('<div id="' + divId + '" class="dashboardPanel"></div>');
    }
}

// Dashboard panels for charts
class DashboardPanelChart extends DashboardPanel {
    load(parentDivId, divId, viewer, modelData) {
        if (!modelData.hasProperty(this.propertyToUse)){
            alert('This model does not contain a ' + this.propertyToUse +' property for the ' + this.constructor.name);
            console.log('These are the properties available on this model: ');
            console.log(Object.keys(modelData._modelData));
            return false;
        } 
        divId = this.propertyToUse.replace(/[^A-Za-z0-9]/gi, '') + divId; // div name = property + chart type
        super.load(parentDivId, divId, viewer);
        this.canvasId = divId + 'Canvas';
        $('#' + divId).append('<canvas id="' + this.canvasId + '" width="400" height="400"></canvas>');
        this.modelData = modelData;
        return true;
    }

    generateColors(count) {
        var background = []; var borders = [];
        for (var i = 0; i < count; i++) {
            var r = Math.round(Math.random() * 255); var g = Math.round(Math.random() * 255); var b = Math.round(Math.random() * 255);
            background.push('rgba(' + r + ', ' + g + ', ' + b + ', 0.2)');
            borders.push('rgba(' + r + ', ' + g + ', ' + b + ', 0.2)');
        }
        return { background: background, borders: borders };
    }
}
// Model data in format for charts
class ModelData {
    constructor(viewer) {
        this._modelData = {};
        this._viewer = viewer;
        
    }

    init(callback) {
        var _this = this;
        var rebar =[];
        _this.getAllLeafComponents(function (dbIds) {
            var count = dbIds.length;
            dbIds.forEach(function (dbId) {
                viewer.getProperties(dbId, function (props) {
                    if( props.properties[4].displayName == 'Rebar Number') rebar.push(props)
                    //console.log('rebar object',rebar)
                   // alert('rebar')
                    props.properties.forEach(function (prop) {

                        //console.log('aw prop dis name',prop.properties)
                        if (!isNaN(prop.displayValue)) return; // let's not categorize properties that store numbers
                       
                        // some adjustments for revit:
                        prop.displayValue = prop.displayValue.replace('Revit ', ''); // remove this Revit prefix
                       
                        if (prop.displayValue.indexOf('<') == 0) return; // skip categories that start with <
                        
                        // ok, now let's organ0ize the data into this hash table
                        //console.log('aw prop dis name',prop.displayName)
                        if (_this._modelData[prop.displayName] == null) _this._modelData[prop.displayName] = {};
                        //console.log('aw prop dis name',prop.displayName)
                        if (_this._modelData[prop.displayName][prop.displayValue] == null) _this._modelData[prop.displayName][prop.displayValue] = [];
                        _this._modelData[prop.displayName][prop.displayValue].push(dbId);
                        //console.log('aw prop dis name',dbId)
                        //console.log('model data',_this._modelData)
                        
                    })
                    //console.log('rebar object',_this._modelData.Category);
                    if ((--count) == 0) callback();
                });
                //console.log('outside',rebar)
            })
        })
       // console.log('rebar object',_this._modelData.Category);
    }
    

    getAllLeafComponents(callback) {
        // from https://learnforge.autodesk.io/#/viewer/extensions/panel?id=enumerate-leaf-nodes
        viewer.getObjectTree(function (tree) {
            var leaves = [];
            tree.enumNodeChildren(tree.getRootId(), function (dbId) {
                if (tree.getChildCount(dbId) === 0) {
                    leaves.push(dbId);
                }
            }, true);
            callback(leaves);
        });
    }

    hasProperty(propertyName){
        return (this._modelData[propertyName] !== undefined);
    }

    getLabels(propertyName) {
        return Object.keys(this._modelData[propertyName]);
    }

    getCountInstances(propertyName) {
        return Object.keys(this._modelData[propertyName]).map(key => this._modelData[propertyName][key].length);
    }

    getIds(propertyName, propertyValue) {
        return this._modelData[propertyName][propertyValue];
    }
}
