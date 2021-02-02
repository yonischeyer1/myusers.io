# MyUsers.io - web/os testing software

My users is a forever free web/os testing software that aims to automate tests on websites in the most relible, easy and user friendly way.

  
  

## Myusers allows you to :

  

1. Automate Tests on your website without the need to know how to code.

2. Automate Tests on your website without the need to add spacial attributes to your html elements.

3. Automate Tests on your website on production environments.

4. Run tests in a schedule

5. Interact with tests when live actions required

6. Automate tests on any environment that supports vnc.

  

## GOALS:

  

### Manual QA booster :

QA will no longer have to run smoke tests and regression tests before each release she/he/it/them/they can just hit play on the test suite and let the software do its thing.

Or tests can be integrated in the CI pipeline as a regular tests would be.

This will let a Manual QA to focus on new features to be released.

  
  

### 0 reoccurring bugs :

Devs can either play pre recorded tests sent from QA or record tests themselves.

That way we can assure a more productive less buggy delivery of code by the developer.

  

### More comprehensive test reports :

I presume the tests reports can improve and give more detailed info like :

*what exactly changed in the design - color , placement , text etc

*list all features with performance issues with metrics.

*AI that learns previous reports and gives insights (ex: suggest the best developer for each feature).

  

### R&D SCORE :

If every website owner starts using this testing software we can accumulate a score for each website that will give us some kind of “R&D” score

That will be composed from the automated tests results and reports.

  
  

## How it Works :

  

1. Runing a container containing xvfb running chromium/Iceweasel and vnc

2. Connecting to the container vnc connection from host and Recording on that container mouse and keyboard actions with Java native hook library

3. Playing on that container the mouse and keyboard actions with Java robot library.

4. Make user validate the actions via video (recording sometimes glitch so as patch solution you can try re-recording and get it right until i improve the recording mechanism)

5. Play validated actions inside container And capture screen shots before each user mouse click or enter keystroke and create a reference perceptual hash out of it.

6. Play actions with java robot library on the container and before every click Eyes will take screenshot of the browser and calculate levenstien distance between the images using it.

7. If distance is not 0 the test failed if it is 0 test succeeded.

8. troubleshoot menu guidenece if test failed to either try solve the test issue or report a bug.

## Troubleshoot Menu options :

  This interactive menu guides the user on how to correct a failed test with one of the tools available or report it via email/ ticketing system API etc.

### Dynamic snapshot :

#### Problem:

When a tag snapshot has changing parts in the UI its confusing the snapshot matching server (eyes).

#### Solution:

You can open a static masking wizard in order to cover those dynamic parts (ex: counter badge component, updated list etc).

### UI Change:

#### Problem:

The website UI has changed to this snapshot.

#### Solution:

Replace current tag image with the failed tag image.

  

### Performance issue / slowness:

#### Problem:

Internet speed change / much traffic on the website / bug causing slowness

#### Solution:

You can increase the wait time of each tag and number of attempts.

  

### Bug:

#### Problem:

As a QA your point of reference to check that the website behaves as it should is the Features user stories

When you do detect an exception in behaviour you should report it to a ticketing system

#### Solution:

Report to your favorite ticketing system.

  

### A/B Test

#### Problem: 
There can be multiple themes for the same interface but elements and layout you did an action on stay in their position.

#### Solution:
 You can add this snapshot to the tag and it will check to see of one of the options is correct

### Skip

You can skip tag snapshot matching (Be carful with this option it can lead to unexpeceted behaviour).

  

### Live Snapshot

If there is a match the test will wait for live action input from the user and after the user finished it will continue from where it stopped


## Terminology :

#### Action: 
 Containing tags and mouse and keyboard actions from myusers recording session.

#### Tags: 
Array of screenshots from a validated Action recording session.

#### Eyes: 
A server that runs inside the container and matches tags one by one against current screenshots at real time of playing the test.

#### Hands: 
A server that runs inside the container that either records keyboard and mouse actions or plays them.
  

## Install

  

```bash

yarn

yarn run dev

```

## Docs

  

To be published

  

## Maintainers

  

- [Yoni.s](https://github.com/yonischeyer1)

  

## License

  

GPL-V3