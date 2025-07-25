/*
*  Power BI Visualizations
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
import powerbiVisualsApi from "powerbi-visuals-api";

import { formattingSettings, formattingSettingsInterfaces } from "powerbi-visuals-utils-formattingmodel";
import { ColorHelper } from "powerbi-visuals-utils-colorutils";
import {
    ButtonPosition,
    SankeyDiagramLink,
    SankeyDiagramNode,
    SankeyDiagramNodeSetting
} from "./dataInterfaces";
import { dataViewWildcard } from "powerbi-visuals-utils-dataviewutils";

import FormattingSettingsCards = formattingSettings.Cards;
import FormattingSettingsSimpleCard = formattingSettings.SimpleCard;
import FormattingSettingsCompositeCard = formattingSettings.CompositeCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;
import ILocalizedItemMember = formattingSettingsInterfaces.ILocalizedItemMember;

import ISelectionId = powerbiVisualsApi.visuals.ISelectionId;

export enum CyclesDrawType {
    Duplicate,
    Backward,
    DuplicateOptimized
}

export interface ViewportSize {
    height?: string;
    width?: string;
}

interface IButtonSettings {
    fill: string;
    stroke: string;
    textFill: string;
    text: string;
    width: number;
    height: number;
}

export const buttonDefaults: IButtonSettings = {
    fill: "#DCDCDC",
    stroke: "#A9A9A9",
    textFill: "#333",
    text: "Reset",
    width: 40,
    height: 15
};

export const buttonPositionOptions: ILocalizedItemMember[] = [
    {value : ButtonPosition.Top, displayNameKey: "Visual_Top"},
    {value : ButtonPosition.TopCenter, displayNameKey: "Visual_TopCenter"},
    {value : ButtonPosition.TopRight, displayNameKey: "Visual_TopRight"},
    {value : ButtonPosition.Bottom, displayNameKey: "Visual_Bottom"},
    {value : ButtonPosition.BottomCenter, displayNameKey: "Visual_BottomCenter"},
    {value : ButtonPosition.BottomRight, displayNameKey: "Visual_BottomRight"}
];

export const duplicateNodesOptions : ILocalizedItemMember[] = [
    {value : CyclesDrawType.Duplicate, displayNameKey: "Visual_Duplicate"},
    {value : CyclesDrawType.Backward, displayNameKey: "Visual_DrawBackwardLink"},
    {value : CyclesDrawType.DuplicateOptimized, displayNameKey: "Visual_DuplicateOptimized"}
];

export class FontSettingsOptions {
    public static DefaultFontSize: number = 12;
    public static MinFontSize: number = 8;
    public static MaxFontSize: number = 60;
    public static DefaultFontFamily: string = "Arial";
    public static DefaultNormalValue: string = "normal";
    public static BoldValue: string = "bold";
    public static ItalicValue: string = "italic";
    public static UnderlineValue: string = "underline";
    public static DefaultNoneValue: string = "none";
    public static DefaultFillValue: string = "#000000";
}

export class NodeWidthDefaultOptions {
    public static DefaultWidth: number = 10;
    public static MinWidth: number = 10;
    public static MaxWidth: number = 30;
}

export class SankeyDiagramScaleSettings {
    public x: number = 1;
    public y: number = 1;
}

export class SankeyComplexSettings {
    public nodePositions: string = "[]";
    public viewportSize: string = "{}";
}

export class BaseFontSettingsCard extends FormattingSettingsCompositeCard {
    public show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayNameKey: "Visual_Show",
        value: true,
    });

    public fontFamily = new formattingSettings.FontPicker({
        name: "fontFamily",
        value: "Arial, sans-serif"
    });

    public fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Text Size",
        displayNameKey: "Visual_TextSize",
        value: FontSettingsOptions.DefaultFontSize,
        options: {
            minValue: {
                type: powerbiVisualsApi.visuals.ValidatorType.Min,
                value: FontSettingsOptions.MinFontSize,
            },
            maxValue: {
                type: powerbiVisualsApi.visuals.ValidatorType.Max,
                value: FontSettingsOptions.MaxFontSize,
            }
        }
    });

    public bold = new formattingSettings.ToggleSwitch({
        name: "fontBold",
        value: false,
    });

    public italic = new formattingSettings.ToggleSwitch({
        name: "fontItalic",
        value: false,
    });

    public underline = new formattingSettings.ToggleSwitch({
        name: "fontUnderline",
        value: false,
    });

    public fill = new formattingSettings.ColorPicker({
        name: "fill",
        displayNameKey: "Visual_Color",
        value: { value: "#000000" },
    });

    private fontControl = new formattingSettings.FontControl({
        name: "font",
        displayName: "Font",
        displayNameKey: "Visual_Font",
        fontFamily: this.fontFamily,
        fontSize: this.fontSize,
        bold: this.bold,
        underline: this.underline,
        italic: this.italic,
    });

    protected fontGroup = new formattingSettings.Group({
        name: "fontGroup",
        displayNameKey: "Visual_Values",
        slices: [this.fontControl, this.fill],
    });

    constructor(cardName: string, defaultFontSize?: number){
        super();
        this.name = cardName;
        this.fontGroup.name = `${cardName}Values`;
        this.fontSize.value = defaultFontSize ?? FontSettingsOptions.DefaultFontSize;
        this.topLevelSlice = this.show;
    }

    public groups: FormattingSettingsSlice[] = [ this.fontGroup ];
}

export class DataLabelsSettings extends BaseFontSettingsCard {
    public forceDisplay = new formattingSettings.ToggleSwitch({
        name: "forceDisplay",
        displayName: "Force display",
        displayNameKey: "Visual_Force_Display",
        description: "Display all labels anyway",
        descriptionKey: "Visual_Description_Force_Display",
        value: false
    });

    public unit = new formattingSettings.AutoDropdown({
        name: "unit",
        displayName: "Display units",
        displayNameKey: "Visual_Display_Units",
        value: 0
    });

    constructor() {
        const cardName: string = "labels";
        super(cardName);

        this.displayNameKey = "Visual_DataPointsLabels";
        this.fontGroup.slices?.push(this.unit, this.forceDisplay);
    }
}

export class LinkLabelsSettings extends BaseFontSettingsCard {
    public static DefaultFontSize: number = 9;
    constructor() {
        const cardName: string = "linkLabels";
        super(cardName, LinkLabelsSettings.DefaultFontSize);

        this.displayNameKey = "Visual_DataPointsLinkLabels";
        this.show.value = false;
    }
}

export class LinkColorSettings extends FormattingSettingsSimpleCard {
    public name: string = "linkColors";
    public displayName: string = "Fill";
    public displayNameKey: string = "Visual_LinkColors";
    public matchNodeColors = new formattingSettings.ToggleSwitch({
        name: "matchNodeColors",
        displayName: "Match Node Colors",
        displayNameKey: "Visual_LinkMatchNodeColors",
        value: true
    });
    public matchSourceOrDestination = new formattingSettings.ItemDropdown({
        name: "matchSourceOrDestination",
        displayName: "Match Color To",
        displayNameKey: "Visual_MatchColorTo",
        items: [
            { value: "source", displayName: "Source" },
            { value: "destination", displayName: "Destination" }
        ],
        value: { value: "source", displayNameKey: "Visual_MatchColorTo_Source" }
    });
    public setIndividualColors = new formattingSettings.ToggleSwitch({
        name: "setIndividualColors",
        displayName: "Set Individual Colors",
        displayNameKey: "Visual_SetIndividualColors",
        value: false
    });
    public slices: FormattingSettingsSlice[] = [
        this.matchNodeColors,
        this.matchSourceOrDestination,
        this.setIndividualColors
    ];
}

export class LinkOutlineSettings extends FormattingSettingsSimpleCard {
    public name: string = "linkOutline";
    public displayName: string = "Outline";
    public displayNameKey: string = "Visual_LinkOutline";
    public draw = new formattingSettings.ToggleSwitch({
        name: "showLinkOutine",
        displayNameKey: "Visual_ShowLinkOutline",
        value: true
    });
    public topLevelSlice: formattingSettings.ToggleSwitch = this.draw;
    public slices: FormattingSettingsSlice[] = [];
}

export class LinksSettings extends FormattingSettingsCompositeCard {
    public persistProperties: PersistPropertiesGroup = new PersistPropertiesGroup();
    public colors: LinkColorSettings = new LinkColorSettings();
    public outline: LinkOutlineSettings = new LinkOutlineSettings();

    public name: string = "links";
    public displayName: string = "Links";
    public displayNameKey: string = "Visual_Links";
    public groups: FormattingSettingsCards[] = [this.colors, this.outline];
}

export class NodesSettings extends FormattingSettingsSimpleCard {
    public name: string = "nodes";
    public displayName: string = "Nodes";
    public displayNameKey: string = "Visual_Nodes";

    public nodeWidth = new formattingSettings.NumUpDown({
        name: "nodesWidth",
        displayName: "Width",
        displayNameKey: "Visual_Width",
        value: NodeWidthDefaultOptions.DefaultWidth,
        options: {
            minValue: {
                type: powerbiVisualsApi.visuals.ValidatorType.Min,
                value: NodeWidthDefaultOptions.MinWidth,
            },
            maxValue: {
                type: powerbiVisualsApi.visuals.ValidatorType.Max,
                value: NodeWidthDefaultOptions.MaxWidth
            }
        }
    });
    public defaultColor = new formattingSettings.ColorPicker({
        name: "defaultColor",
        displayName: "Default color",
        displayNameKey: "Visual_NodeDefaultColor",
        value: { value: undefined }
    });
    public showAll = new formattingSettings.ToggleSwitch({
        name: "showAll",
        displayName: "Show all",
        displayNameKey: "Visual_NodesShowAll",
        value: false
    });
    public slices: FormattingSettingsSlice[] = [this.nodeWidth, this.defaultColor, this.showAll];
}

export class ScaleSettings extends FormattingSettingsSimpleCard {
    public provideMinHeight = new formattingSettings.ToggleSwitch({
        name: "provideMinHeight",
        displayName: "Provide min optimal height of node",
        displayNameKey: "Visual_MinOptimalHeight",
        value: true
    });

    public lnScale = new formattingSettings.ToggleSwitch({
        name: "lnScale",
        displayName: "Enable logarithmic scale",
        displayNameKey: "Visual_LogarithmicScale",
        value: false
    });

    public name: string = "scaleSettings";
    public displayName: string = "Scale settings";
    public displayNameKey: string = "Visual_ScaleSettings";
    public slices: FormattingSettingsSlice[] = [this.provideMinHeight, this.lnScale];
}

class PersistPropertiesGroup extends FormattingSettingsSimpleCard {
    public name: string = "persistProperties";
    public displayNameKey: string = "Visual_NodePositions";
    public collapsible: boolean = false;
    public visible: boolean = true;

    public _nodePositions: SankeyDiagramNodeSetting[] = [];
    public _viewportSize: ViewportSize = {};

    public nodePositions = new formattingSettings.ReadOnlyText({
        name: "nodePositions",
        displayNameKey: "Visual_NodePositions",
        value: "",
        visible: false,
    });

    public viewportSize = new formattingSettings.ReadOnlyText({
        name: "viewportSize",
        displayNameKey: "Visual_ViewportSize",
        value: "",
        visible: false,
    });

    public slices: FormattingSettingsSlice[] = [this.nodePositions, this.viewportSize]
}

export class ButtonSettings extends FormattingSettingsSimpleCard {
    public name: string = "button";
    public displayNameKey: string = "Visual_ResetButton";
    public descriptionKey: string = "Visual_ResetButonDescription";
    public show = new formattingSettings.ToggleSwitch({
        name: "showResetButon",
        displayNameKey: "Visual_ShowResetButton",
        value: false
    });

    public position = new formattingSettings.ItemDropdown({
        name: "position",
        displayNameKey: "Visual_Position",
        items: buttonPositionOptions,
        value: buttonPositionOptions[5]
    });

    topLevelSlice: formattingSettings.ToggleSwitch = this.show;
    slices: formattingSettings.Slice[] = [this.position];
}

export class NodeComplexSettings extends FormattingSettingsCompositeCard {
    public persistProperties: PersistPropertiesGroup = new PersistPropertiesGroup();
    public button: ButtonSettings = new ButtonSettings();

    public name: string = "nodeComplexSettings";
    public displayNameKey: string = "Visual_Sorting";
    public groups: FormattingSettingsCards[] = [this.persistProperties, this.button];
}

export class CyclesLinkSettings extends FormattingSettingsSimpleCard {
    public drawCycles = new formattingSettings.ItemDropdown({
        name: "drawCycles",
        displayName: "Duplicate nodes",
        displayNameKey: "Visual_DuplicateNodes",
        value: duplicateNodesOptions[0],
        items: duplicateNodesOptions
    });

    public selfLinksWeight = new formattingSettings.ToggleSwitch({
        name: "selfLinksWeight",
        displayName: "Ignore weight of self links",
        displayNameKey: "Visual_SelflinkWeight",
        value: false
    });

    public name: string = "cyclesLinks";
    public displayName: string = "Cycles displaying";
    public displayNameKey: string = "Visual_Cycles";
    public slices: FormattingSettingsSlice[] = [this.drawCycles, this.selfLinksWeight];
}

export class SankeyDiagramSettings extends FormattingSettingsModel {
    public _scale: SankeyDiagramScaleSettings = new SankeyDiagramScaleSettings();
    public sort: string = "";

    public labels: DataLabelsSettings = new DataLabelsSettings();
    public linkLabels: LinkLabelsSettings = new LinkLabelsSettings();
    public linksSelector: LinksSettings = new LinksSettings();
    private linksColorSelector: LinkColorSettings = this.linksSelector.colors
    public nodesSettings: NodesSettings = new NodesSettings();
    public scale: ScaleSettings = new ScaleSettings();
    public cyclesLinks: CyclesLinkSettings = new CyclesLinkSettings();
    public nodeComplexSettings: NodeComplexSettings = new NodeComplexSettings();
    public cards: FormattingSettingsCards[] = [this.labels, this.linkLabels, this.linksSelector, this.nodesSettings, this.scale, this.cyclesLinks, this.nodeComplexSettings];

    populateNodesColorSelector(nodes: SankeyDiagramNode[]) {
        const slices = this.nodesSettings.slices;
        if (nodes && this.nodesSettings.showAll.value) {
            nodes.forEach(node => {
                if(slices.some((nodeColorSelector: FormattingSettingsSlice) => nodeColorSelector.displayName === node.label.formattedName)){
                    return;
                }
                slices.push(new formattingSettings.ColorPicker({
                    name: "fill",
                    displayName: node.label.formattedName,
                    value: { value: node.fillColor },
                    selector: ColorHelper.normalizeSelector((<ISelectionId>node.selectionId).getSelector())
                }));
            });
        }
    }

    populateLinksColorSelector(links: SankeyDiagramLink[]) {
        // Reset slices to only the base controls
        this.linksColorSelector.slices = [
            this.linksColorSelector.matchNodeColors,
            this.linksColorSelector.matchSourceOrDestination,
            this.linksColorSelector.setIndividualColors
        ];
        const slices = this.linksColorSelector.slices;
        this.linksColorSelector.matchSourceOrDestination.visible = false;

        if (this.linksColorSelector.matchNodeColors.value) {
            // Assign colors based on source or destination
            this.linksColorSelector.setIndividualColors.visible = false;
            this.linksColorSelector.matchSourceOrDestination.visible = true;
            if (links) {
                links.forEach(link => {
                    if (this.linksColorSelector.matchSourceOrDestination.value.value === "source") {
                        link.fillColor = link.source.fillColor;
                    } else if (this.linksColorSelector.matchSourceOrDestination.value.value === "destination") {
                        link.fillColor = link.destination.fillColor;
                    }
                });
            }
        } else if (this.linksColorSelector.setIndividualColors.value) {
            // Show individual color pickers for each link
            if (links) {
                links.forEach(link => {
                    slices.push(new formattingSettings.ColorPicker({
                        name: "fill",
                        displayName: link.source.label.formattedName + " - " + link.destination.label.formattedName,
                        value: { value: link.fillColor },
                        selector: ColorHelper.normalizeSelector((<ISelectionId>link.selectionId).getSelector())
                    }));
                });
            }
        } else {
            // Show a single color picker for all links
            slices.push(new formattingSettings.ColorPicker({
                name: "fill",
                displayName: "Link Color",
                displayNameKey: "Visual_LinkColor",
                type: powerbi.visuals.FormattingComponent.ColorPicker,
                selector: dataViewWildcard.createDataViewWildcardSelector(dataViewWildcard.DataViewWildcardMatchingOption.InstancesAndTotals),
                value: { value: links && links[0] ? links[0].fillColor : "#000000" },
                instanceKind: powerbi.VisualEnumerationInstanceKinds.ConstantOrRule
            }));
        }
    }
}