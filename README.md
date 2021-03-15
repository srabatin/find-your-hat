
# Find the treasure
## Fork of Codecademy JavaScript Learning Project "Find your hat"

### Add-ons: 
- change story from find hat to find hidden chest of gold
- rename field to map
- separate player char and path char
- change chars: player char = smiley, path char = dark field, fall in hole = cross
- only reveal the field characters around the player when playing
- allow configuration of map field, hole percentage and field of view
- ask for player name and use it in game messages
- count moves to solve map
- save scores to highscore.txt and display them when winning
- ask to play again when game is over

### To-Do:
- Ask for player name only on the first time playing DONE
- Create a “hard mode” where one or more holes are added after certain turns.
- Improve graphics, see [package](https://github.com/cronvel/terminal-kit)
- Validate if field can be won 
- Refactoring!

### Instructions:
1. Set game parameters in main.js at the end of the file: 
- width = 20; // width of map fields
- height = 10; // height of map fields
- percentageHoles = 0.3; // percentage of holes on the map
- fov = 2; // field of view distance
2. Run in console with node main.js
3. Play!

See [Codecademy](https://www.codecademy.com/paths/front-end-engineer-career-path/tracks/fecp-javascript-syntax-part-iii/modules/fecp-challenge-project-find-your-hat/projects/find-your-hat ) for project description.