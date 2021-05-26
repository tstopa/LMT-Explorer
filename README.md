# LMT Explorer

This tool is used to visualize and make simpler reading [IBM License Metric Tool](https://www.ibm.com/docs/en/license-metric-tool) audit snapshot based on PVU sub-capacity metric.

 **Note:** LMT Explorer is provided as-is, without any warranty and without official support. This is community project and not official IBM tool.

## Installation

1. Go to the [releases](https://github.com/tstopa/LMT-Explorer/releases) site by clicking it on the right panel or adding `/releases` to the web address.
2. Download the installer [here](https://github.com/tstopa/LMT-Explorer/releases/download/1.0.0/LMT.Explorer-1.0.0.Setup.exe).
3. Run the installer and that's all.

## User's guide

1. When you open the program, you see a window, where you drop the [ILMT snapshot](https://www.ibm.com/docs/en/license-metric-tool?topic=utilization-creating-snapshots-license-metric-auditing-purposes) (zip archive).
2. Wait until the program loads the data and presents a diagram (this may take a while).
3. On the main panel, you see visual presentation of provided audit snapshot, where:

- Blue circles are physical servers
- Yellow are virtual machines
- Red are components
- Green are products

4. You can pick every color circle, by clicking it and move it right and left, for easier analysis.
5. By clicking on circle all its connections will be highlighted.
6. On the right panel, you can search for products. After choosing one, the view will zoom on it.

## In current version LMT Explorer works only with sub-capactiy metric!

## Information for developers

[Developer's guide](./DEVELOPER.md)
