# PREDICT-A-BUY 🍋
<a href="https://tcl-61-smart-shopping-list.web.app">Live Site</a>

## About
Introducing PREDICT-A-BUY: The Ultimate Shopping Companion!

With PREDICT-A-Buy by your side, shopping becomes an adventure, a journey through time. Let the app be your trusty sidekick, anticipating your needs & guiding you through the aisles with its charming personality. Say goodbye to mundane shopping lists and hello to a shopping experience that is as fun as it is smart! 

## Project Purpose & Goal
Over an 8-week period in early 2023 I collaborated with three other early-career developers as part of <a href="https://the-collab-lab.codes">The Collab Lab</a>. Together we built a smart shopping list app in React.js. Our team worked under the guidance of three mentors who are all professionals in the field. They acted as our project managers and led learning modules on collaborative development strategies.

As a team, we focused on pair programming, <a href="https://github.com/the-collab-lab/tcl-61-smart-shopping-list/pulls?q=is%3Apr+is%3Aclosed">writing great pull/merge request messages</a>, over-communicating in Slack, demos, retros, and other real-world activities of professional software teams.

<a href="https://itsoliviasparks.com/the-collab-lab-info">Read more about my time at The Collab Lab</a>

## Tech Stack
React, Firebase, Sass, & Figma

## Use
- On app mount, the user is prompted to join a shopping list
    - They have 2 options:
    1. They can enter a token to join an existing list, perhaps one they share with family or roommates
    2. They can click to start a new list
- From there, the user adds items (e.g. "vegan cheeze" or "lemons") to their list
    - When adding an item the user selects when they suspect they will need to buy the item again: soon, kinda soon, or not soon
- After navigating to their shopping list, the user can see a list of item they need to buy
    - Each item is labeled with how soon they will need to buy it again
    - Each item has a delete button to delete the item from their list
    - The user can check & uncheck items off as they purchase them
    - The user can also search through their list
- PREDICT-A-BUY is smart:
    - Over time, the app comes to understand the intervals at which you buy different items
    - If an item is likely to be due to be bought soon, it rises to the top of the shopping list
    - If 60 days or more have passed since the last purchase date, it will be labeled as inactive
    - After 24 hours, all purchased items will be marked as un-purchased & labeled with their updated next purchase date prediction

### Demo
https://github.com/itsoliviasparks/predict-a-buy/assets/97206055/ef02f37b-0237-465f-ad33-7e9fc79d5406


## Problems Solved
### The Problem
When developing this app, I accidentally marked an item as purchased. I immediately knew that I wanted to implement an uncheck feature, even though it wasn't part of the project's Acceptance Criteria or the original scope. I am incredibly grateful for my fellow contributors and our mentors for their patience & support while I worked through this stretch goal.

Initially, this was easy: when the user unchecked an item, we updated the database to reduce the `totalPurchases` by 1 & reset the `dateLastPurchased` to `null`. But we soon realized that this was not a good solution, because the `dateLastPurchased` value is vital in predicting the next purchase date.

I knew we needed to store the "smart" values of `dateNextPurchased` & `dateLastPurchased` to be able to allow the user to uncheck an item and not loose the app's ability to predict when they would next need the item. 

The firebase data structure was set up for us by The Collab Lab, and was integral to all the logic we already built into the app-- we could not change it to hold a secondary values for `dateNextPurchased` & `dateLastPurchased`. So, I knew we had to use React `state`.

### The Solution
I'm really proud of the logic we developed for this feature:
1. All list items have a `boolean` of `wasPurchased`. This is `true` if the item's `dateLastPurchased` is within 24hrs of the current time. This value is derived from `state`.

    This logic is located in `/src/components/ListItem.jsx`
    ```
        const currentDate = new Date().getTime();
        const dateLastPurchasedPlus24h = dateLastPurchased
            ? dateLastPurchased.toDate().getTime() + ONE_DAY_IN_MILLISECONDS
            : null;

        const wasPurchased = currentDate < dateLastPurchasedPlus24h;
    ```
2. When the user marks an item as `wasPurchased`, before we update the database, we save the values of `dateNextPurchased` & `dateLastPurchased` into state.
3. Once we have `prevDateNextPurchased` & `prevDateLastPurchased` saved into `state`, we then trigger the database to update.

    This logic is located in `/src/components/ListItem.jsx`
    ```
        const handleCheck = () => {
            //save previous dateLastPurchased & dateNextPurchased into state to use if the user unchecks an item
            setPrevDateLastPurchased(dateLastPurchased);
            setPrevDateNextPurchased(dateNextPurchased);

            updateItem(
                wasPurchased,
                listToken,
                itemId,
                prevDateLastPurchased,
                prevDateNextPurchased,
            );
        };
    ```
4. Updating the database is conditional on whether or not the item `wasPurchased`. 

    This logic is located in `/src/api/firebase.js`
    ```
    await updateDoc(listItemRef, {
            // when the user marks an item as purchased, the date is updated to today & 1 is added to number of purchases
            // when the user unchecks an item to mark it as not purchased, the date is updated to the previous purchased date & 1 is subtracted from number of purchases
            dateLastPurchased: wasPurchased ? prevDateLastPurchased : new Date(),
            dateNextPurchased: wasPurchased
                ? prevDateNextPurchased
                : getFutureDate(estimateOfDate),
            totalPurchases: wasPurchased ? totalPurchases - 1 : totalPurchases + 1,
        });
    ```
5. Now this poses a problem, since the crucial values of `prevDateLastPurchased` & `prevDateNextPurchased` are only saved into `state` when the user first clicks on an item. Therefore, if an item is marked `wasPurchased` on app mount, those values are `null` & the database would not be correctly updated when un-clicked. To solve this, we decided to `disable` the checkbox for any items that are marked as `wasPurchased` on app mount.

    This logic is located in `/src/components/ListItem.jsx`
    ```
        //disables ability to uncheck item if the item was marked as purchased on page load
        useEffect(() => {
            if (!prevDateLastPurchased && !prevDateNextPurchased) {
                setDisabled(wasPurchased);
            }
        }, [wasPurchased, prevDateNextPurchased, prevDateLastPurchased]);

    ```

Overall we feel this provides an excellent user experience:
- The user can uncheck any items they accidentally mark as purchased while using the app
- It is safe to assume that any items marked as purchased by the user at the end of their session are genuinely purchased
- Therefore, when the user returns to the app within 24 hours, the item will be crossed out, and the checkbox will be disabled
- The app's "smartness" is never compromised
- All items are automatically marked as un-purchased after 24 hours from their last purchase date


## Lessons Learned
One of the most significant lessons I learned was the importance of clear communication both in & out of the text editor.

Dedicating time each week to go through the other pair's code, line-by-line, as I reviewed each pull request highlighted the importance of writing maintainable & easy to understand code. Additionally, having our team's fabulous mentors review the pull requests I worked on was incredibly valuable. Their thoughtful comments really opened my eyes to new ways of working through logic & they have undoubtedly made me a better programmer.

Collaborating with other developers was also a great learning experience. I worked with self-taught developers, those from different bootcamps, and professionals in the field. This has helped me expand my knowledge of the various coding techniques and approaches.

## Contributors:

- [Olivia Sparks](https://github.com/itsoliviasparks) ✨

- [Hanson Tram](https://github.com/hansontram) 😎

- [Lizzy Pine](https://github.com/lizzypine) 🌱

- [Yufa Li](https://github.com/01001101CK) 🧘‍♀️

## Mentors: 
- [Tim Taylor](https://github.com/timothy-taylor) 🔭

- [Lauren Yu](https://github.com/laurenyz) 🐘

- [Viviana Davila](https://github.com/vividavila98) 🌺
