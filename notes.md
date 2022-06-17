# notes:
- pacmacro in 2019 was organized by sfu surge apparently
- there was an attempted ios port that failed, but the android port app did work

# 2019 gameplay:
- players look at their phone to show them where their team is on the map. Players then have to run around and pick up power pellets or catch pacman in real life. If they see a person in real life, they must run away/to them depending on the state.
- each character in the game is run by a team of 2-4 additional people
- people in the base-station will relay information about where other people are on the map via a phone call. (this could be built into the app in the future, but no, too difficult)
- required: constant wifi or cellular data, & gps.
- the game is run a few times before being finished.
- in 2019, there were various issues that halted gameplay, such as people not having data or battery power to stay connected. Also, the mobile app only worked on android. I remember one person had to hold multiple phones while running around downtown.

# 2019 tech stack:
- server machine -> reports locations of everyone 
- host device connected to a projector -> shows where all pacman & ghosts are
- android phones -> report just your location
- https://github.com/pacmacro/pacmacro.github.io what it looked like

# questions: 
- what do we want the gameplay to be like? **(the goal of this is to guage interest)**
  1. should there be a group of people inside like in 2019, or should everyone have an active role now? 
    - (since we no longer have to minimize the risk of people getting hit by traffic)
  2. on campus, people should have wifi everywhere, so people could communicate through discord or just make plans in person beforehand.
  3. there are multiplayer pacman variants we can take inspiration from.
  4. what if everyone is a ghost & pacman is ai based?
  5. different gamemodes? -> minimize chaos
- will we have access inside the AQ?
- will we do it outside & if so, will it be at night?
- 

# challenges:
- if outdoors, walls in the game will be difficult to enforce / will be very minimal. People can jump over small fences & stuff.
- if indoors, the game won't know a player's elevation, so power pellets could be eaten from any height. (this could be a feature?)
- communication was a difficulty last time. Since we're on campus, internet should be better though.
- if we end up having more pac-people, we'll need more costumes.

### tentative tech stack:
- ec2 micro for server (free for 1 year, but 4$ per month if running full time) -> since this is a 1 day thing, we might want to just pay 5$ for a stronger machine.
- github pages static site + basic authentication with server + html geolocation api -> should work on all phones.
- host device connected to a projector optional, but would be supported.

# todo: 
- access gps from a webpage -> get a github pages site -> make an org called csss-pacmacro-test.github.io
- setup an amazon ec2 instance or something small
- talk to ec2 instance from website
- 3 webpages:
  - ios & android phone
  - host -> hardcoded password
  - viewer -> need to make an account? shows the location of all the people.
- create chiptune music for the game !!
- fruit as bonus points

likely to be done in 2-4 weeks (will be on vacation for 1 of them & my next 7 days are fully booked)

//

- what do we want the gameplay to be like? **(the goal of this is to guage interest)**
- will we have access inside the AQ?
- will we do it outside & if so, will we be doing pacmacro at night?