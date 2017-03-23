Significant changes from previous submission:

    API switched from http://imdb.wemakesites.net/ to https://developers.themoviedb.org/3/getting-started

    Data set switched from IMDb to TMDb. This is a result of the API switch.

    All ajax calls and how the response paths were handled are a bit different due to the API needing a different querystring and returning a different structure of object

    Instead of IMDb tags, TMDb tags are now used. These are slightly different in a few ways:

        1) They are not prepended with any alphabetic characters. This means the user input is different, and the URLs to the pages are different

        2) As a result of 1), tags are only unique in their domain. For example: prior to this update, a tag for an actor would not ever be the same as any movie tag. Now, a movie tag can also be an actor tag, but they are in no way related. This is dealt with by the path in the URL of TMDb.

        3) The object structure of nodes and edges have both gained a new field. They both now carry the IMDb and TMDb tags. The IMDb tags are used purely to uniquely index the objects, as cytoscape.js will bug out and not render edges properly if tags are purely numeric.

    A function is now deprecated and removed thanks to additional functionality in the TMDb API. This function computed the reverse name search based on a film's cast. Because this is provided in the new API, this function is no longer needed.

    The new API has a request limit of 40 per 10 seconds. If more are requested, it breaks the graph generation as it returns 404. While this could have been handled nicely, I am trying to preserve as much of the submitted work as possible. My solution to this problem was to add a global counter and timer to force stop and "save" current states in an array. When 35 requests are reached, no more can occur until the timer fires and resets the counter, which will also continue a certain number of saved instances. A side effect of this is that graph generation will look odd in terms of progression. A bunch of nodes will be added, then 10 seconds will pass and the cycle will repeat. There really is no way to generate faster when using this API.

    Actual names have been added to edges thanks to additional functionality in the new API (why didn't I go with this one originally...)

    Something was fixed that I didn't notice was broken while refactoring the cross edge detection and now there are many more edges popping up. Theoretically this is good, as more connections are being made between datums. However, it can get a bit hard to read sometimes, as well as occasional overlapping edges although this is rare.

    Destination URLs in node and edge click features were changed from IMDb to TMDb to represent the dataset that is being used. While I am storing the IMDb tags still, I feel like it would be disingenuous to link to something that isn't actually my source data.

    A few new vars in defs.js, some new code in main.js

    Many functions in helpers.js were lightly touched to accommodate for all of the above






Usage:

Very similar to before. The only difference is the inputted values. Instead of taking the tag from the end of the URL on IMDb, now the tag is acquired from an actor page on https://www.themoviedb.org.

For example: Tom Hanks' page is https://www.themoviedb.org/person/31-tom-hanks. His tag is 31.




Known issues:

If graphs are made too quickly, the request limit may be exceeded and graph generation will fail. This can be fixed by waiting 10 seconds between graphs.

When creating more than one graph on a single page instance, sometimes ajax calls from the previous graph will not successfully cancel
This results in false standalone nodes being added on subsequent graphs.
Resolve by refreshing.

When animate is unchecked, the nodes will all stack on top of eachother until the graph is animated again. A quick remedy is to check and again uncheck the box to format the graph