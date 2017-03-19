# gasp - Graph Analysis Statistics Project

Usage: 

Load gen.html into Chrome

Browser based application, no installation required. However, supporting files in the directory are required.
Internet access required, for multiple reasons (API calls, library pulls, etc)
Developed and tested on Chrome version 56.x.

Known issues:

When creating more than one graph on a single page instance, sometimes ajax calls from the previous graph will not successfully cancel
This results in false standalone nodes being added on subsequent graphs.
Resolve by refreshing.

When animate is unchecked, the nodes will all stack on top of eachother until the graph is animated again. A quick remedy is to check and again uncheck the box to format the graph