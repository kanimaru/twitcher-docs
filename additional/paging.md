# Handling Paginated API Results

Several Twitch API endpoints return results in "pages" when there's a lot of data (e.g., fetching a long list of subscribers). Twitcher provides a convenient way to work with these paginated endpoints, such as `TwitchAPI.get_broadcaster_subscriptions()`.

Because fetching each new page of data requires an asynchronous network request, working with these paginated results in Godot involves a slightly different pattern than a simple loop.

**How it Works:**

The methods that support paging (like `get_broadcaster_subscriptions`) will typically return an object that you can iterate over.
However, each item *within* this iterator might not be the final data itself. Instead, it can be a "promise" or a placeholder representing the data for that item, 
which might still need to be fetched if it belongs to a subsequent page.

**Example Usage:**

To correctly access all items from a paginated endpoint, you need to `await` each item retrieved from the iterator. 
This ensures that if the item belongs to a new page, your code waits for that page to be fetched before proceeding.

<Badge type="tip" text="GDScript & C#" />

::: code-group

```gdscript [GDScript]
# Assuming 'TwitchAPI' is your accessible TwitchAPI instance
# and 'user_id' is the ID of the broadcaster.

# 1. Initial call to the paginated endpoint
# This returns an iterable object.
var subscriptions_iterator = await TwitchAPI.get_broadcaster_subscriptions(
    TwitchGetBroadcasterSubscriptions.Opt.new(), # Options for the request
    user_id                                    # Broadcaster's user ID
)

# 2. Loop through the iterator
print("Fetching all subscribers...")
for subscriber_promise in subscriptions_iterator:
    # 3. 'await' each item from the iterator
    #    - If the item is already loaded, 'await' returns immediately.
    #    - If the item requires fetching a new page, 'await' pauses
    #      until that page is loaded.
    var subscriber_data = await subscriber_promise

    # 4. Now 'subscriber_data' contains the actual data for one subscriber
    if subscriber_data: # Always good to check
        print("Subscriber: %s (User ID: %s)" % [subscriber_data.user_name, subscriber_data.user_id])
    else:
        print("Encountered a null item in pagination (should not happen if pages fetched correctly).")

print("Finished fetching all subscribers.")
```

```csharp [C#]
// Assuming 'TwitchApi.Instance' is your accessible TwitchApi instance
// and 'userId' is the ID of the broadcaster.

// 1. Initial call to the paginated endpoint
var response = await TwitchApi.Instance.GetBroadcasterSubscriptions(userId, new TwitchGetBroadcasterSubscriptionsOpt());

// 2. Loop through pages manually, instead of GDScript's promise iterator,
//    a paginated Response exposes NextPage() and Pagination.Cursor directly.
GD.Print("Fetching all subscribers...");
while (response != null)
{
    // 3. 'Data' already contains this page's items, no per-item await needed
    foreach (var subscriberData in response.Data)
    {
        GD.Print($"Subscriber: {subscriberData.UserName} (User ID: {subscriberData.UserId})");
    }

    // 4. Fetch the next page, if any. On the last page, Pagination is still
    //    present but its Cursor is null/empty, so check the cursor, not the object.
    response = !string.IsNullOrEmpty(response.Pagination?.Cursor) ? await response.NextPage() : null;
}

GD.Print("Finished fetching all subscribers.");
```

:::

::: tip C# note
C# doesn't use GDScript's custom iterator/"promise" protocol for pagination. Instead, every paginated `...Response` class exposes `Data` (the current page's items, ready to use immediately) plus `Pagination` and `async Task<TResponse> NextPage()` to fetch the next page: a plain `while` loop instead of a `for...in` over promises. Note that `Pagination` itself stays non-null on the last page — Twitch returns an empty `pagination: {}` object — so check `Pagination?.Cursor` for `null`/empty instead of checking `Pagination` for `null`, or `NextPage()` will loop back to page 1 forever.
:::